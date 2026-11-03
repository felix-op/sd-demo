package services;

import clients.PersonasRestClient;
import dtos.PaginaDTO;
import dtos.PrestamoCreateDTO;
import dtos.PrestamoDTO;
import dtos.SimpleBookDTO;
import dtos.SimpleStudentDTO;
import dtos.SimpleUserDTO;
import exceptions.ConflictException;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.WebApplicationException;
import models.PrestamoModel;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import repositories.BookRepository;
import repositories.PrestamoRepository;

import java.time.LocalDate;
import java.util.NoSuchElementException;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PrestamoService {

    private static final int DURACION_DIAS = 7;
    private static final int MAX_PRESTAMOS_ACTIVOS_POR_ALUMNO = 3;

    @Inject
    PrestamoRepository prestamoRepository;

    @Inject
    BookRepository bookRepository;

    @Inject
    @RestClient
    PersonasRestClient personasRestClient;

    public PaginaDTO<PrestamoDTO> buscar(String alumno, String atendidoPor, LocalDate fechaInicio, LocalDate fechaFin, int pagina, int porPagina) {
        UUID alumnoUuid = alumno != null ? UUID.fromString(alumno) : null;
        UUID atendidoPorUuid = atendidoPor != null ? UUID.fromString(atendidoPor) : null;

        var query = prestamoRepository.buscar(alumnoUuid, atendidoPorUuid, fechaInicio, fechaFin)
                .page(Page.of(pagina - 1, porPagina));

        var items = query.list().stream()
                .map(this::toDTO)
                .toList();

        return new PaginaDTO<>(items, pagina, porPagina, query.count(), query.pageCount());
    }

    public Optional<PrestamoDTO> getPrestamo(String uuid) {
        return prestamoRepository.findByIdOptional(UUID.fromString(uuid))
                .map(this::toDTO);
    }

    @Transactional
    public PrestamoDTO createPrestamo(PrestamoCreateDTO dto) {
        UUID studentUuid = UUID.fromString(dto.alumno());
        UUID attendedByUuid = UUID.fromString(dto.atendidoPor());
        UUID bookUuid = UUID.fromString(dto.libro());

        // 1. Validar que el alumno existe en el servicio personas
        try {
            personasRestClient.getAlumno(dto.alumno());
        } catch (WebApplicationException e) {
            if (e.getResponse() != null && e.getResponse().getStatus() == 404) {
                throw new NoSuchElementException("No se encontró el alumno con uuid " + dto.alumno());
            }
            throw new RuntimeException("Error al comunicarse con el servicio de personas: " + e.getMessage(), e);
        }

        // 2. Validar que el usuario/operador existe en el servicio personas
        try {
            personasRestClient.getUsuario(dto.atendidoPor());
        } catch (WebApplicationException e) {
            if (e.getResponse() != null && e.getResponse().getStatus() == 404) {
                throw new NoSuchElementException("No se encontró el usuario con uuid " + dto.atendidoPor());
            }
            throw new RuntimeException("Error al comunicarse con el servicio de personas: " + e.getMessage(), e);
        }

        // 3. Validar que el libro existe localmente
        var book = bookRepository.findByIdOptional(bookUuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el libro con uuid " + dto.libro()));

        // 4. Validar que el libro no esté ya prestado
        if (!prestamoRepository.findActiveByBook(book.uuid).isEmpty()) {
            throw new ConflictException("El libro '" + book.title + "' ya está prestado");
        }

        // 5. Validar límite de préstamos por alumno
        if (prestamoRepository.countActiveByStudent(studentUuid) >= MAX_PRESTAMOS_ACTIVOS_POR_ALUMNO) {
            throw new ConflictException("El alumno ya tiene " + MAX_PRESTAMOS_ACTIVOS_POR_ALUMNO + " préstamos activos, el máximo permitido");
        }

        var prestamo = new PrestamoModel();
        prestamo.studentUuid = studentUuid;
        prestamo.attendedByUuid = attendedByUuid;
        prestamo.book = book;
        prestamo.startDate = dto.fechaInicio() != null ? dto.fechaInicio() : LocalDate.now();
        prestamo.dueDate = prestamo.startDate.plusDays(DURACION_DIAS);
        prestamoRepository.persist(prestamo);

        return toDTO(prestamo);
    }

    @Transactional
    public PrestamoDTO devolver(String uuid, LocalDate fecha) {
        var prestamo = prestamoRepository.findByIdOptional(UUID.fromString(uuid))
                .orElseThrow(() -> new NoSuchElementException("No se encontró el préstamo con uuid " + uuid));

        if (prestamo.returnDate != null) {
            throw new ConflictException("El préstamo ya fue devuelto");
        }

        prestamo.returnDate = fecha != null ? fecha : LocalDate.now();
        return toDTO(prestamo);
    }

    public PrestamoDTO toDTO(PrestamoModel model) {
        SimpleStudentDTO alumnoDTO;
        try {
            var student = personasRestClient.getAlumno(model.studentUuid.toString());
            alumnoDTO = new SimpleStudentDTO(student.uuid(), student.document(), student.firstName(), student.lastName());
        } catch (Exception e) {
            alumnoDTO = new SimpleStudentDTO(model.studentUuid.toString(), null, null, null);
        }

        SimpleUserDTO userDTO;
        try {
            var user = personasRestClient.getUsuario(model.attendedByUuid.toString());
            userDTO = new SimpleUserDTO(user.uuid(), user.nombre());
        } catch (Exception e) {
            userDTO = new SimpleUserDTO(model.attendedByUuid.toString(), null);
        }

        return new PrestamoDTO(
                model.uuid.toString(),
                alumnoDTO,
                userDTO,
                new SimpleBookDTO(model.book.uuid.toString(), model.book.title),
                model.startDate,
                model.dueDate,
                model.returnDate
        );
    }
}

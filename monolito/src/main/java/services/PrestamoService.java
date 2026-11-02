package services;

import dtos.PrestamoCreateDTO;
import dtos.PrestamoDTO;
import dtos.SimpleBookDTO;
import dtos.SimpleStudentDTO;
import dtos.SimpleUserDTO;
import exceptions.ConflictException;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import models.PrestamoModel;
import repositories.BookRepository;
import repositories.PrestamoRepository;
import repositories.StudentRepository;
import repositories.UserRepository;

import java.time.LocalDate;
import java.util.List;
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
    StudentRepository studentRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    BookRepository bookRepository;

    public List<PrestamoDTO> buscar(String alumno, String atendidoPor, LocalDate fechaInicio, LocalDate fechaFin, int first, int total) {
        UUID alumnoUuid = alumno != null ? UUID.fromString(alumno) : null;
        UUID atendidoPorUuid = atendidoPor != null ? UUID.fromString(atendidoPor) : null;

        return prestamoRepository.buscar(alumnoUuid, atendidoPorUuid, fechaInicio, fechaFin, first, total).stream()
                .map(PrestamoService::toDTO)
                .toList();
    }

    public Optional<PrestamoDTO> getPrestamo(String uuid) {
        return prestamoRepository.findByIdOptional(UUID.fromString(uuid))
                .map(PrestamoService::toDTO);
    }

    @Transactional
    public PrestamoDTO createPrestamo(PrestamoCreateDTO dto) {
        var student = studentRepository.findByIdOptional(UUID.fromString(dto.alumno()))
                .orElseThrow(() -> new NoSuchElementException("No se encontró el alumno con uuid " + dto.alumno()));
        var user = userRepository.findByIdOptional(UUID.fromString(dto.atendidoPor()))
                .orElseThrow(() -> new NoSuchElementException("No se encontró el usuario con uuid " + dto.atendidoPor()));
        var book = bookRepository.findByIdOptional(UUID.fromString(dto.libro()))
                .orElseThrow(() -> new NoSuchElementException("No se encontró el libro con uuid " + dto.libro()));

        if (!prestamoRepository.findActiveByBook(book.uuid).isEmpty()) {
            throw new ConflictException("El libro '" + book.title + "' ya está prestado");
        }

        if (prestamoRepository.countActiveByStudent(student.uuid) >= MAX_PRESTAMOS_ACTIVOS_POR_ALUMNO) {
            throw new ConflictException("El alumno ya tiene " + MAX_PRESTAMOS_ACTIVOS_POR_ALUMNO + " préstamos activos, el máximo permitido");
        }

        var prestamo = new PrestamoModel();
        prestamo.student = student;
        prestamo.attendedBy = user;
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

    private static PrestamoDTO toDTO(PrestamoModel p) {
        return new PrestamoDTO(
                p.uuid.toString(),
                new SimpleStudentDTO(p.student.uuid.toString(), p.student.documentId, p.student.firstName, p.student.lastName),
                new SimpleUserDTO(p.attendedBy.uuid.toString(), p.attendedBy.nombre),
                new SimpleBookDTO(p.book.uuid.toString(), p.book.title),
                p.startDate,
                p.dueDate,
                p.returnDate
        );
    }
}

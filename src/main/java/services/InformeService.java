package services;

import dtos.InformeAtencionesDTO;
import dtos.InformeNoDevueltosDTO;
import dtos.SimpleBookDTO;
import dtos.SimpleStudentDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import repositories.PrestamoRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

// NOTA: a proposito NO se filtra en SQL ni se pagina - listAll() trae TODOS los
// prestamos (con alumno/usuario/libro cargados EAGER) y se filtra en memoria.
// Es el demo de "un informe pesado tira toda la app en un monolito". Para
// produccion esto deberia filtrarse en la consulta y paginarse.
@ApplicationScoped
public class InformeService {

    @Inject
    PrestamoRepository prestamoRepository;

    public List<InformeNoDevueltosDTO> noDevueltos(LocalDate fechaInicio, LocalDate fechaFin, String estado) {
        var hoy = LocalDate.now();

        return prestamoRepository.listAll().stream()
                .filter(p -> p.returnDate == null)
                .filter(p -> !p.dueDate.isBefore(fechaInicio) && !p.dueDate.isAfter(fechaFin))
                .filter(p -> switch (estado) {
                    case "vencidos" -> p.dueDate.isBefore(hoy);
                    case "noVencidos" -> !p.dueDate.isBefore(hoy);
                    default -> true;
                })
                .map(p -> new InformeNoDevueltosDTO(
                        new SimpleStudentDTO(p.student.uuid.toString(), p.student.documentId, p.student.firstName, p.student.lastName),
                        new SimpleBookDTO(p.book.uuid.toString(), p.book.title),
                        p.book.author,
                        p.startDate,
                        p.dueDate,
                        hoy.toEpochDay() - p.dueDate.toEpochDay()
                ))
                .toList();
    }

    public List<InformeAtencionesDTO> atenciones(LocalDate fechaInicio, LocalDate fechaFin, String atendidoPor) {
        var atendidoPorUuid = atendidoPor != null ? UUID.fromString(atendidoPor) : null;

        return prestamoRepository.listAll().stream()
                .filter(p -> !p.startDate.isBefore(fechaInicio) && !p.startDate.isAfter(fechaFin))
                .filter(p -> atendidoPorUuid == null || p.attendedBy.uuid.equals(atendidoPorUuid))
                .map(p -> new InformeAtencionesDTO(
                        p.book.title,
                        p.book.author,
                        p.startDate,
                        new SimpleStudentDTO(p.student.uuid.toString(), p.student.documentId, p.student.firstName, p.student.lastName)
                ))
                .toList();
    }
}

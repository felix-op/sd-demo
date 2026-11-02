package repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import models.PrestamoModel;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class PrestamoRepository implements PanacheRepositoryBase<PrestamoModel, UUID> {

    public List<PrestamoModel> findActiveByBook(UUID bookUuid) {
        return list("book.uuid = ?1 and returnDate is null", bookUuid);
    }

    public List<PrestamoModel> findActiveByStudent(UUID studentUuid) {
        return list("student.uuid = ?1 and returnDate is null", studentUuid);
    }

    public long countActiveByStudent(UUID studentUuid) {
        return count("student.uuid = ?1 and returnDate is null", studentUuid);
    }

    public List<PrestamoModel> buscar(UUID alumno, UUID atendidoPor, LocalDate fechaInicio, LocalDate fechaFin) {
        var condiciones = new StringBuilder("1 = 1");
        var params = new HashMap<String, Object>();

        if (alumno != null) {
            condiciones.append(" and student.uuid = :alumno");
            params.put("alumno", alumno);
        }

        if (atendidoPor != null) {
            condiciones.append(" and attendedBy.uuid = :atendidoPor");
            params.put("atendidoPor", atendidoPor);
        }

        if (fechaInicio != null) {
            condiciones.append(" and startDate >= :fechaInicio");
            params.put("fechaInicio", fechaInicio);
        }

        if (fechaFin != null) {
            condiciones.append(" and startDate <= :fechaFin");
            params.put("fechaFin", fechaFin);
        }

        return list(condiciones.toString(), params);
    }
}

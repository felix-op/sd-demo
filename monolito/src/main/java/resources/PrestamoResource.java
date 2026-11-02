package resources;

import dtos.PrestamoCreateDTO;
import dtos.PrestamoDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import services.PrestamoService;
import services.Rfc7807Service;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Path("/prestamos")
public class PrestamoResource {

    @Inject
    PrestamoService prestamoService;

    @Inject
    Rfc7807Service rfc7807Service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<PrestamoDTO> prestamos(
            @QueryParam("alumno") String alumno,
            @QueryParam("atendidoPor") String atendidoPor,
            @QueryParam("fechaInicio") String fechaInicio,
            @QueryParam("fechaFin") String fechaFin,
            @QueryParam("first") int first, // Indice inicial
            @QueryParam("total") int total // Cantidad de elementos
    ) {
        var inicio = (fechaInicio == null || fechaInicio.isBlank()) ? null : LocalDate.parse(fechaInicio);
        var fin = (fechaFin == null || fechaFin.isBlank()) ? null : LocalDate.parse(fechaFin);

        total = total <= 0 ? 10 : total;
        first = Math.max(first, 0);

        return prestamoService.buscar(alumno, atendidoPor, inicio, fin, first, total);
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public PrestamoDTO prestamo(@PathParam("uuid") String uuid) {
        return prestamoService.getPrestamo(uuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el préstamo con uuid " + uuid));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crear(PrestamoCreateDTO dto) {
        var error = validar(dto);
        if (error != null) {
            return error;
        }

        var creado = prestamoService.createPrestamo(dto);
        return Response.status(Response.Status.CREATED).entity(creado).build();
    }

    @POST
    @Path("/{uuid}/devolucion")
    @Produces(MediaType.APPLICATION_JSON)
    public Response devolver(@PathParam("uuid") String uuid, @QueryParam("fecha") String fecha) {
        var fechaDevolucion = (fecha == null || fecha.isBlank()) ? null : LocalDate.parse(fecha);
        return Response.ok(prestamoService.devolver(uuid, fechaDevolucion)).build();
    }

    private Response validar(PrestamoCreateDTO dto) {
        if (dto == null) {
            return rfc7807Service.badRequest("Sin cuerpo", "No se recibió ningún campo", "/prestamos");
        }

        if (dto.alumno() == null || dto.alumno().trim().isEmpty()) {
            return rfc7807Service.badRequest("Falta el alumno", "El campo 'alumno' es obligatorio", "/prestamos");
        }

        if (dto.atendidoPor() == null || dto.atendidoPor().trim().isEmpty()) {
            return rfc7807Service.badRequest("Falta quién atendió", "El campo 'atendidoPor' es obligatorio", "/prestamos");
        }

        if (dto.libro() == null || dto.libro().trim().isEmpty()) {
            return rfc7807Service.badRequest("Falta el libro", "El campo 'libro' es obligatorio", "/prestamos");
        }

        return null;
    }
}

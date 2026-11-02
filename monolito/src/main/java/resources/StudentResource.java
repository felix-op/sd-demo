package resources;

import dtos.StudentDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import services.Rfc7807Service;
import services.StudentService;

import java.util.List;
import java.util.NoSuchElementException;

@Path("/alumnos")
public class StudentResource {

    @Inject
    StudentService studentService;

    @Inject
    Rfc7807Service rfc7807Service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<StudentDTO> alumnos(
            @QueryParam("first") int first, // Indice inicial
            @QueryParam("total") int total // Cantidad de elementos
    ) {
        var estudiantes = studentService.getStudents();

        total = total <= 0 ? 10 : total;
        first = Math.max(first, 0);
        int inicio = Math.min(first, estudiantes.size());
        int fin = Math.min(first + total, estudiantes.size());

        return estudiantes.subList(inicio, fin);
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public StudentDTO alumno(@PathParam("uuid") String uuid) {
        return studentService.getStudent(uuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el alumno con uuid " + uuid));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crear(StudentDTO dto) {
        var error = validar(dto, "/alumnos");
        if (error != null) {
            return error;
        }

        var creado = studentService.createStudent(dto);
        return Response.status(Response.Status.CREATED).entity(creado).build();
    }

    @PUT
    @Path("/{uuid}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizar(@PathParam("uuid") String uuid, StudentDTO dto) {
        var error = validar(dto, "/alumnos/" + uuid);
        if (error != null) {
            return error;
        }

        var actualizado = studentService.updateStudent(uuid, dto)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el alumno con uuid " + uuid));
        return Response.ok(actualizado).build();
    }

    @DELETE
    @Path("/{uuid}")
    public Response eliminar(@PathParam("uuid") String uuid) {
        if (!studentService.deleteStudent(uuid)) {
            throw new NoSuchElementException("No se encontró el alumno con uuid " + uuid);
        }
        return Response.noContent().build();
    }

    private Response validar(StudentDTO dto, String instance) {
        if (dto == null) {
            return rfc7807Service.badRequest("Sin cuerpo", "No se recibió ningun campo", instance);
        }

        if (dto.firstName() == null || dto.firstName().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el nombre", "El campo 'firstName' es obligatorio", instance);
        }

        if (dto.document() == null || dto.document().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el documento", "El campo 'document' es obligatorio", instance);
        }

        return null;
    }
}

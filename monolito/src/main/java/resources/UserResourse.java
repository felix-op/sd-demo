package resources;

import dtos.UserDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import services.Rfc7807Service;
import services.UserService;

import java.util.List;
import java.util.NoSuchElementException;

@Path("/usuarios")
public class UserResourse {

    @Inject
    UserService userService;

    @Inject
    Rfc7807Service rfc7807Service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDTO> usuarios() {
        return userService.getUsers();
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public UserDTO usuario(@PathParam("uuid") String uuid) {
        return userService.getUser(uuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el usuario con uuid " + uuid));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crear(UserDTO dto) {
        var error = validar(dto, "/usuarios");
        if (error != null) {
            return error;
        }

        var creado = userService.createUser(dto);
        return Response.status(Response.Status.CREATED).entity(creado).build();
    }

    @PUT
    @Path("/{uuid}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizar(@PathParam("uuid") String uuid, UserDTO dto) {
        var error = validar(dto, "/usuarios/" + uuid);
        if (error != null) {
            return error;
        }

        var actualizado = userService.updateUser(uuid, dto)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el usuario con uuid " + uuid));
        return Response.ok(actualizado).build();
    }

    @DELETE
    @Path("/{uuid}")
    public Response eliminar(@PathParam("uuid") String uuid) {
        if (!userService.deleteUser(uuid)) {
            throw new NoSuchElementException("No se encontró el usuario con uuid " + uuid);
        }
        return Response.noContent().build();
    }

    private Response validar(UserDTO dto, String instance) {
        if (dto == null) {
            return rfc7807Service.badRequest("Sin cuerpo", "No se recibió ningún campo", instance);
        }

        if (dto.nombre() == null || dto.nombre().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el nombre", "El campo 'nombre' es obligatorio", instance);
        }

        if (dto.documento() == null || dto.documento().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el documento", "El campo 'documento' es obligatorio", instance);
        }

        return null;
    }
}

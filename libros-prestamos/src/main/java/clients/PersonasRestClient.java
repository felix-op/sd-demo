package clients;

import dtos.StudentDTO;
import dtos.UserDTO;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.rest.client.inject.RegisterRestClient;

@RegisterRestClient(configKey = "personas-api")
public interface PersonasRestClient {

    @GET
    @Path("/alumnos/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    StudentDTO getAlumno(@PathParam("uuid") String uuid);

    @GET
    @Path("/usuarios/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    UserDTO getUsuario(@PathParam("uuid") String uuid);
}

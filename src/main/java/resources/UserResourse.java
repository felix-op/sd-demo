package resources;

import dtos.UserDTO;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import repositories.UserRepository;

import java.util.List;
import java.util.Optional;

@Path("/usuarios")
public class UserResourse {

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDTO> usuarios(
            @QueryParam("first") int first, // Indice inicial
            @QueryParam("total") int total // Cantidad de elementos
    ) {
        System.out.println("GET /usuarios");
        System.out.println("first=" + first + ", total=" + total);

        var personas = UserRepository.getUsers();

        total = total <= 0 ? 10 : total;
        first = Math.max(first, 0);
        int inicio = Math.min(first, personas.size());
        int fin = Math.min(first + total, personas.size());

        System.out.println("Indice [" + inicio + ", " + fin + "]");

        return personas.subList(inicio, fin);
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public Optional<UserDTO> usuario(@PathParam("uuid") String uuid)
    {
        return UserRepository.getUser(uuid);
    }

    @GET
    @Path("/permisos")
    @Produces(MediaType.APPLICATION_JSON)
    public String permisos() {
        return "Ingresar, Editar, Eliminar";
    }
}

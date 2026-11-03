package resources;

import dtos.CatalogoDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import services.CatalogoService;

import java.util.List;
import java.util.NoSuchElementException;

@Path("/catalogo")
public class CatalogoResource {

    @Inject
    CatalogoService catalogoService;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<CatalogoDTO> catalogo() {
        return catalogoService.getCatalogo();
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public CatalogoDTO libro(@PathParam("uuid") String uuid) {
        return catalogoService.getLibro(uuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el libro con uuid " + uuid));
    }
}

package resources;

import dtos.BookDTO;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import services.BookService;
import services.Rfc7807Service;

import java.util.List;
import java.util.NoSuchElementException;

@Path("/libros")
public class BookResource {

    @Inject
    BookService bookService;

    @Inject
    Rfc7807Service rfc7807Service;

    @GET
    @Produces(MediaType.APPLICATION_JSON)
    public List<BookDTO> libros(
            @QueryParam("first") int first, // Indice inicial
            @QueryParam("total") int total // Cantidad de elementos
    ) {
        var libros = bookService.getBooks();

        total = total <= 0 ? 10 : total;
        first = Math.max(first, 0);
        int inicio = Math.min(first, libros.size());
        int fin = Math.min(first + total, libros.size());

        return libros.subList(inicio, fin);
    }

    @GET
    @Path("/{uuid}")
    @Produces(MediaType.APPLICATION_JSON)
    public BookDTO libro(@PathParam("uuid") String uuid) {
        return bookService.getBook(uuid)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el libro con uuid " + uuid));
    }

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response crear(BookDTO dto) {
        var error = validar(dto, "/libros");
        if (error != null) {
            return error;
        }

        var creado = bookService.createBook(dto);
        return Response.status(Response.Status.CREATED).entity(creado).build();
    }

    @PUT
    @Path("/{uuid}")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response actualizar(@PathParam("uuid") String uuid, BookDTO dto) {
        var error = validar(dto, "/libros/" + uuid);
        if (error != null) {
            return error;
        }

        var actualizado = bookService.updateBook(uuid, dto)
                .orElseThrow(() -> new NoSuchElementException("No se encontró el libro con uuid " + uuid));
        return Response.ok(actualizado).build();
    }

    @DELETE
    @Path("/{uuid}")
    public Response eliminar(@PathParam("uuid") String uuid) {
        if (!bookService.deleteBook(uuid)) {
            throw new NoSuchElementException("No se encontró el libro con uuid " + uuid);
        }
        return Response.noContent().build();
    }

    private Response validar(BookDTO dto, String instance) {
        if (dto == null) {
            return rfc7807Service.badRequest("Sin cuerpo", "No se recibió ningún campo", instance);
        }

        if (dto.title() == null || dto.title().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el título", "El campo 'title' es obligatorio", instance);
        }

        if (dto.author() == null || dto.author().trim().isEmpty()) {
            return rfc7807Service.badRequest("No se encontró el autor", "El campo 'author' es obligatorio", instance);
        }

        return null;
    }
}

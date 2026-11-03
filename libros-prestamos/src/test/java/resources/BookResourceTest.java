package resources;

import dtos.BookDTO;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import services.BookService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@QuarkusTest
public class BookResourceTest {

    private static final List<BookDTO> BOOKS_MOCK = List.of(
            libro("1", "El Aleph"),
            libro("2", "Ficciones"),
            libro("3", "Rayuela"),
            libro("4", "Martín Fierro"),
            libro("5", "Cien años de soledad"),
            libro("6", "La ciudad y los perros"),
            libro("7", "Pedro Páramo"),
            libro("8", "El túnel"),
            libro("9", "Los detectives salvajes"),
            libro("10", "2666"),
            libro("11", "Operación Masacre"),
            libro("12", "Sobre héroes y tumbas")
    );

    @InjectMock
    BookService bookService;

    @Test
    void listaTodosLosLibros() {
        when(bookService.getBooks()).thenReturn(BOOKS_MOCK);

        given()
                .when().get("/libros")
                .then()
                .statusCode(200)
                .body("size()", is(12))
                .body("[0].title", is("El Aleph"));
    }

    @Test
    void rechazaCrearLibroConTituloDemasiadoLargo() {
        given()
                .contentType("application/json")
                .body("{\"title\":\"" + "a".repeat(256) + "\",\"author\":\"Borges\"}")
                .when().post("/libros")
                .then()
                .statusCode(400)
                .body("title", is("Campo demasiado largo"))
                .body("details", containsString("'title'"))
                .body("details", containsString("255"));
    }

    @Test
    void obtieneUnLibroPorUuid() {
        when(bookService.getBook("3")).thenReturn(Optional.of(BOOKS_MOCK.get(2)));

        given()
                .when().get("/libros/3")
                .then()
                .statusCode(200)
                .body("title", is("Rayuela"));
    }

    @Test
    void devuelve404ConFormatoRfc7807SiElLibroNoExiste() {
        when(bookService.getBook("999")).thenReturn(Optional.empty());

        given()
                .when().get("/libros/999")
                .then()
                .statusCode(404)
                .body("status", is(404))
                .body("title", is("No encontrado"));
    }

    @Test
    void creaLibroValidoDevuelve201() {
        when(bookService.createBook(any())).thenReturn(libro("13", "Nuevo Libro"));

        given()
                .contentType("application/json")
                .body("{\"title\":\"Nuevo Libro\",\"author\":\"Autor\"}")
                .when().post("/libros")
                .then()
                .statusCode(201)
                .body("title", is("Nuevo Libro"));
    }

    @Test
    void rechazaCrearLibroSinTitulo() {
        given()
                .contentType("application/json")
                .body("{\"author\":\"Autor\"}")
                .when().post("/libros")
                .then()
                .statusCode(400)
                .body("status", is(400));
    }

    @Test
    void rechazaCrearLibroSinAutor() {
        given()
                .contentType("application/json")
                .body("{\"title\":\"Algún Título\"}")
                .when().post("/libros")
                .then()
                .statusCode(400)
                .body("status", is(400));
    }

    @Test
    void actualizaLibroExistenteDevuelve200() {
        when(bookService.updateBook(eq("3"), any())).thenReturn(Optional.of(libro("3", "Rayuela Revisada")));

        given()
                .contentType("application/json")
                .body("{\"title\":\"Rayuela Revisada\",\"author\":\"Cortázar\"}")
                .when().put("/libros/3")
                .then()
                .statusCode(200)
                .body("title", is("Rayuela Revisada"));
    }

    @Test
    void devuelve404AlActualizarLibroInexistente() {
        when(bookService.updateBook(eq("999"), any())).thenReturn(Optional.empty());

        given()
                .contentType("application/json")
                .body("{\"title\":\"X\",\"author\":\"Y\"}")
                .when().put("/libros/999")
                .then()
                .statusCode(404);
    }

    @Test
    void eliminaLibroExistenteDevuelve204() {
        when(bookService.deleteBook("3")).thenReturn(true);

        given()
                .when().delete("/libros/3")
                .then()
                .statusCode(204);
    }

    @Test
    void devuelve404AlEliminarLibroInexistente() {
        when(bookService.deleteBook("999")).thenReturn(false);

        given()
                .when().delete("/libros/999")
                .then()
                .statusCode(404);
    }

    private static BookDTO libro(String uuid, String title) {
        return new BookDTO(uuid, title, "Autor", false, 100, LocalDate.of(2000, 1, 1), "Descripción", List.of());
    }
}

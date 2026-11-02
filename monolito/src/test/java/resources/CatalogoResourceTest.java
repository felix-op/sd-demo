package resources;

import dtos.CatalogoDTO;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import services.CatalogoService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.not;
import static org.mockito.Mockito.when;

@QuarkusTest
public class CatalogoResourceTest {

    private static final CatalogoDTO DISPONIBLE = libro("1", "El Aleph", true);
    private static final CatalogoDTO PRESTADO = libro("2", "Ficciones", false);

    @InjectMock
    CatalogoService catalogoService;

    @Test
    void listaElCatalogoConLaDisponibilidadDeCadaLibro() {
        when(catalogoService.getCatalogo()).thenReturn(List.of(DISPONIBLE, PRESTADO));

        given()
                .when().get("/catalogo")
                .then()
                .statusCode(200)
                .body("size()", is(2))
                .body("[0].available", is(true))
                .body("[1].available", is(false));
    }

    @Test
    void noExponeDatosDeLosAlumnosConPrestamo() {
        when(catalogoService.getCatalogo()).thenReturn(List.of(PRESTADO));

        given()
                .when().get("/catalogo")
                .then()
                .statusCode(200)
                .body("[0]", not(hasKey("alumnosConPrestamo")));
    }

    @Test
    void obtieneUnLibroDelCatalogoPorUuid() {
        when(catalogoService.getLibro("1")).thenReturn(Optional.of(DISPONIBLE));

        given()
                .when().get("/catalogo/1")
                .then()
                .statusCode(200)
                .body("title", is("El Aleph"));
    }

    @Test
    void devuelve404ConFormatoRfc7807SiElLibroNoExiste() {
        when(catalogoService.getLibro("999")).thenReturn(Optional.empty());

        given()
                .when().get("/catalogo/999")
                .then()
                .statusCode(404)
                .body("status", is(404));
    }

    private static CatalogoDTO libro(String uuid, String title, boolean available) {
        return new CatalogoDTO(uuid, title, "Borges", available, 100, LocalDate.of(1949, 1, 1), "desc");
    }
}

package resources;

import dtos.PaginaDTO;
import dtos.PrestamoDTO;
import dtos.SimpleBookDTO;
import dtos.SimpleStudentDTO;
import dtos.SimpleUserDTO;
import exceptions.ConflictException;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import services.PrestamoService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@QuarkusTest
public class PrestamoResourceTest {

    private static final SimpleStudentDTO ALUMNO = new SimpleStudentDTO("a1", "111", "Ana", "Gomez");
    private static final SimpleUserDTO USUARIO = new SimpleUserDTO("u1", "Bibliotecario");
    private static final SimpleBookDTO LIBRO = new SimpleBookDTO("l1", "El Aleph");

    private static final PrestamoDTO PRESTAMO_MOCK = new PrestamoDTO(
            "p1", ALUMNO, USUARIO, LIBRO,
            LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 8), null
    );

    @InjectMock
    PrestamoService prestamoService;

    @Test
    void listaPrestamosSinFiltros() {
        when(prestamoService.buscar(any(), any(), any(), any(), eq(1), eq(10))).thenReturn(pagina(1, 10, 1));

        given()
                .when().get("/prestamos")
                .then()
                .statusCode(200)
                .body("items.size()", is(1))
                .body("items[0].libro.title", is("El Aleph"));
    }

    @Test
    void listaPrestamosConFiltrosCombinados() {
        when(prestamoService.buscar("a1", "u1", LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 31), 1, 10))
                .thenReturn(pagina(1, 10, 1));

        given()
                .queryParam("alumno", "a1")
                .queryParam("atendidoPor", "u1")
                .queryParam("fechaInicio", "2026-01-01")
                .queryParam("fechaFin", "2026-01-31")
                .when().get("/prestamos")
                .then()
                .statusCode(200)
                .body("items.size()", is(1));
    }

    @Test
    void devuelveLosDatosDePaginadoEnLaRespuesta() {
        when(prestamoService.buscar(any(), any(), any(), any(), eq(3), eq(5))).thenReturn(pagina(3, 5, 42));

        given()
                .queryParam("pagina", 3)
                .queryParam("porPagina", 5)
                .when().get("/prestamos")
                .then()
                .statusCode(200)
                .body("pagina", is(3))
                .body("porPagina", is(5))
                .body("totalItems", is(42))
                .body("totalPaginas", is(9));
    }

    @Test
    void normalizaPaginaYTamanioInvalidos() {
        when(prestamoService.buscar(any(), any(), any(), any(), eq(1), eq(10))).thenReturn(pagina(1, 10, 1));

        given()
                .queryParam("pagina", 0)
                .queryParam("porPagina", -5)
                .when().get("/prestamos")
                .then()
                .statusCode(200)
                .body("pagina", is(1))
                .body("porPagina", is(10));
    }

    @Test
    void limitaElTamanioDePaginaAlMaximo() {
        when(prestamoService.buscar(any(), any(), any(), any(), eq(1), eq(100))).thenReturn(pagina(1, 100, 1));

        given()
                .queryParam("porPagina", 5000)
                .when().get("/prestamos")
                .then()
                .statusCode(200)
                .body("porPagina", is(100));
    }

    @Test
    void obtieneUnPrestamoPorUuid() {
        when(prestamoService.getPrestamo("p1")).thenReturn(Optional.of(PRESTAMO_MOCK));

        given()
                .when().get("/prestamos/p1")
                .then()
                .statusCode(200)
                .body("alumno.firstName", is("Ana"));
    }

    @Test
    void devuelve404ConFormatoRfc7807SiElPrestamoNoExiste() {
        when(prestamoService.getPrestamo("999")).thenReturn(Optional.empty());

        given()
                .when().get("/prestamos/999")
                .then()
                .statusCode(404)
                .body("status", is(404));
    }

    @Test
    void creaPrestamoValidoDevuelve201() {
        when(prestamoService.createPrestamo(any())).thenReturn(PRESTAMO_MOCK);

        given()
                .contentType("application/json")
                .body("{\"alumno\":\"a1\",\"atendidoPor\":\"u1\",\"libro\":\"l1\"}")
                .when().post("/prestamos")
                .then()
                .statusCode(201)
                .body("libro.title", is("El Aleph"));
    }

    @Test
    void rechazaCrearPrestamoSinAlumno() {
        given()
                .contentType("application/json")
                .body("{\"atendidoPor\":\"u1\",\"libro\":\"l1\"}")
                .when().post("/prestamos")
                .then()
                .statusCode(400);
    }

    @Test
    void rechazaCrearPrestamoSinAtendidoPor() {
        given()
                .contentType("application/json")
                .body("{\"alumno\":\"a1\",\"libro\":\"l1\"}")
                .when().post("/prestamos")
                .then()
                .statusCode(400);
    }

    @Test
    void rechazaCrearPrestamoSinLibro() {
        given()
                .contentType("application/json")
                .body("{\"alumno\":\"a1\",\"atendidoPor\":\"u1\"}")
                .when().post("/prestamos")
                .then()
                .statusCode(400);
    }

    @Test
    void devuelve409SiElServicioRechazaElPrestamo() {
        when(prestamoService.createPrestamo(any()))
                .thenThrow(new ConflictException("El libro 'El Aleph' ya está prestado"));

        given()
                .contentType("application/json")
                .body("{\"alumno\":\"a1\",\"atendidoPor\":\"u1\",\"libro\":\"l1\"}")
                .when().post("/prestamos")
                .then()
                .statusCode(409)
                .body("details", is("El libro 'El Aleph' ya está prestado"));
    }

    @Test
    void marcaDevolucionDevuelve200() {
        var devuelto = new PrestamoDTO("p1", ALUMNO, USUARIO, LIBRO,
                LocalDate.of(2026, 1, 1), LocalDate.of(2026, 1, 8), LocalDate.of(2026, 1, 5));
        when(prestamoService.devolver(eq("p1"), any())).thenReturn(devuelto);

        given()
                .when().post("/prestamos/p1/devolucion")
                .then()
                .statusCode(200)
                .body("fechaDevolucion", is("2026-01-05"));
    }

    @Test
    void devuelve409SiElPrestamoYaFueDevuelto() {
        when(prestamoService.devolver(eq("p1"), any())).thenThrow(new ConflictException("El préstamo ya fue devuelto"));

        given()
                .when().post("/prestamos/p1/devolucion")
                .then()
                .statusCode(409);
    }

    private static PaginaDTO<PrestamoDTO> pagina(int pagina, int porPagina, long totalItems) {
        int totalPaginas = (int) Math.ceil((double) totalItems / porPagina);
        return new PaginaDTO<>(List.of(PRESTAMO_MOCK), pagina, porPagina, totalItems, totalPaginas);
    }
}

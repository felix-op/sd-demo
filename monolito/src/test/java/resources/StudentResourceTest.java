package resources;

import dtos.StudentDTO;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import services.StudentService;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.is;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@QuarkusTest
public class StudentResourceTest {

    private static final List<StudentDTO> STUDENTS_MOCK = List.of(
            alumno("1", "Juan", "Perez"),
            alumno("2", "Pedro", "Gomez"),
            alumno("3", "María", "Lopez"),
            alumno("4", "Carlos", "Diaz"),
            alumno("5", "Ana", "Martinez"),
            alumno("6", "Lucía", "Sanchez"),
            alumno("7", "Martín", "Romero"),
            alumno("8", "Sofía", "Torres"),
            alumno("9", "Pablo", "Flores"),
            alumno("10", "Laura", "Acosta"),
            alumno("11", "Diego", "Rios"),
            alumno("12", "Marta", "Ortiz")
    );

    @InjectMock
    StudentService studentService;

    @Test
    void listaPrimeraPaginaDeAlumnosPorDefecto() {
        when(studentService.getStudents()).thenReturn(STUDENTS_MOCK);

        given()
                .when().get("/alumnos")
                .then()
                .statusCode(200)
                .body("size()", is(10))
                .body("[0].firstName", is("Juan"));
    }

    @Test
    void listaAlumnosConPaginadoCustom() {
        when(studentService.getStudents()).thenReturn(STUDENTS_MOCK);

        given()
                .queryParam("first", 10)
                .queryParam("total", 5)
                .when().get("/alumnos")
                .then()
                .statusCode(200)
                .body("size()", is(2))
                .body("[0].firstName", is("Diego"));
    }

    @Test
    void obtieneUnAlumnoPorUuid() {
        when(studentService.getStudent("3")).thenReturn(Optional.of(STUDENTS_MOCK.get(2)));

        given()
                .when().get("/alumnos/3")
                .then()
                .statusCode(200)
                .body("firstName", is("María"));
    }

    @Test
    void devuelve404ConFormatoRfc7807SiElAlumnoNoExiste() {
        when(studentService.getStudent("999")).thenReturn(Optional.empty());

        given()
                .when().get("/alumnos/999")
                .then()
                .statusCode(404)
                .body("status", is(404))
                .body("title", is("No encontrado"));
    }

    @Test
    void creaAlumnoValidoDevuelve201() {
        when(studentService.createStudent(any())).thenReturn(alumno("13", "Nuevo", "Alumno"));

        given()
                .contentType("application/json")
                .body("{\"firstName\":\"Nuevo\",\"lastName\":\"Alumno\",\"document\":\"999\"}")
                .when().post("/alumnos")
                .then()
                .statusCode(201)
                .body("firstName", is("Nuevo"));
    }

    @Test
    void rechazaCrearAlumnoSinNombre() {
        given()
                .contentType("application/json")
                .body("{\"lastName\":\"Alumno\",\"document\":\"999\"}")
                .when().post("/alumnos")
                .then()
                .statusCode(400)
                .body("status", is(400));
    }

    @Test
    void rechazaCrearAlumnoSinDocumento() {
        given()
                .contentType("application/json")
                .body("{\"firstName\":\"Nuevo\",\"lastName\":\"Alumno\"}")
                .when().post("/alumnos")
                .then()
                .statusCode(400)
                .body("status", is(400));
    }

    @Test
    void actualizaAlumnoExistenteDevuelve200() {
        when(studentService.updateStudent(eq("3"), any())).thenReturn(Optional.of(alumno("3", "María", "Lopez Revisado")));

        given()
                .contentType("application/json")
                .body("{\"firstName\":\"María\",\"lastName\":\"Lopez Revisado\",\"document\":\"333\"}")
                .when().put("/alumnos/3")
                .then()
                .statusCode(200)
                .body("lastName", is("Lopez Revisado"));
    }

    @Test
    void devuelve404AlActualizarAlumnoInexistente() {
        when(studentService.updateStudent(eq("999"), any())).thenReturn(Optional.empty());

        given()
                .contentType("application/json")
                .body("{\"firstName\":\"X\",\"lastName\":\"Y\",\"document\":\"1\"}")
                .when().put("/alumnos/999")
                .then()
                .statusCode(404);
    }

    @Test
    void eliminaAlumnoExistenteDevuelve204() {
        when(studentService.deleteStudent("3")).thenReturn(true);

        given()
                .when().delete("/alumnos/3")
                .then()
                .statusCode(204);
    }

    @Test
    void devuelve404AlEliminarAlumnoInexistente() {
        when(studentService.deleteStudent("999")).thenReturn(false);

        given()
                .when().delete("/alumnos/999")
                .then()
                .statusCode(404);
    }

    private static StudentDTO alumno(String uuid, String firstName, String lastName) {
        return new StudentDTO(uuid, firstName, lastName, LocalDate.of(2000, 1, 1), "doc-" + uuid, List.of());
    }
}

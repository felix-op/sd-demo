package resources;

import dtos.UserDTO;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import services.UserService;

import java.util.List;
import java.util.Optional;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.is;
import static org.mockito.Mockito.when;

@QuarkusTest
public class UserResourseTest {

    private static final List<UserDTO> USERS_MOCK = List.of(
            new UserDTO("1", "Juan", "1234"),
            new UserDTO("2", "Pedro", "1234"),
            new UserDTO("3", "María", "1234"),
            new UserDTO("4", "Carlos", "1234"),
            new UserDTO("5", "Ana", "1234"),
            new UserDTO("6", "Lucía", "1234"),
            new UserDTO("7", "Martín", "1234"),
            new UserDTO("8", "Sofía", "1234"),
            new UserDTO("9", "Pablo", "1234"),
            new UserDTO("10", "Laura", "1234"),
            new UserDTO("11", "Diego", "1234"),
            new UserDTO("12", "Marta", "1234")
    );

    @InjectMock
    UserService userService;

    @Test
    void listaTodosLosUsuarios() {
        when(userService.getUsers()).thenReturn(USERS_MOCK);

        given()
                .when().get("/usuarios")
                .then()
                .statusCode(200)
                .body("size()", is(12))
                .body("[0].nombre", is("Juan"));
    }

    @Test
    void rechazaCrearUsuarioConNombreDemasiadoLargo() {
        given()
                .contentType("application/json")
                .body("{\"nombre\":\"" + "a".repeat(256) + "\",\"documento\":\"999\"}")
                .when().post("/usuarios")
                .then()
                .statusCode(400)
                .body("title", is("Campo demasiado largo"))
                .body("details", containsString("'nombre'"))
                .body("details", containsString("255"));
    }

    @Test
    void obtieneUnUsuarioPorUuid() {
        when(userService.getUser("3")).thenReturn(Optional.of(USERS_MOCK.get(2)));

        given()
                .when().get("/usuarios/3")
                .then()
                .statusCode(200)
                .body("nombre", is("María"));
    }

    @Test
    void devuelve404ConFormatoRfc7807SiElUsuarioNoExiste() {
        when(userService.getUser("999")).thenReturn(Optional.empty());

        given()
                .when().get("/usuarios/999")
                .then()
                .statusCode(404)
                .body("status", is(404))
                .body("title", is("No encontrado"));
    }
}

package services;

import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import models.BookModel;
import models.PrestamoModel;
import models.StudentModel;
import models.UserModel;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

@QuarkusTest
public class CatalogoServiceTest {

    @Inject
    CatalogoService catalogoService;

    @Test
    void marcaComoNoDisponibleSoloLosLibrosConPrestamoActivo() {
        var uuids = QuarkusTransaction.requiringNew().call(() -> {
            var student = new StudentModel();
            student.firstName = "Ana";
            student.documentId = "1";
            student.persist();

            var user = new UserModel();
            user.nombre = "Bibliotecario";
            user.documento = "2";
            user.persist();

            var prestado = libro("Prestado");
            var devuelto = libro("Devuelto");
            var libre = libro("Libre");

            prestamo(student, user, prestado, null);
            prestamo(student, user, devuelto, LocalDate.now());

            return new String[]{prestado.uuid.toString(), devuelto.uuid.toString(), libre.uuid.toString()};
        });

        var catalogo = catalogoService.getCatalogo();

        assertFalse(disponible(catalogo, uuids[0]));
        assertTrue(disponible(catalogo, uuids[1]));
        assertTrue(disponible(catalogo, uuids[2]));
        assertFalse(catalogoService.getLibro(uuids[0]).orElseThrow().available());
        assertTrue(catalogoService.getLibro(uuids[1]).orElseThrow().available());
    }

    private static boolean disponible(java.util.List<dtos.CatalogoDTO> catalogo, String uuid) {
        return catalogo.stream().filter(l -> l.uuid().equals(uuid)).findFirst().orElseThrow().available();
    }

    private static BookModel libro(String title) {
        var book = new BookModel();
        book.title = title;
        book.author = "Autor";
        book.persist();
        return book;
    }

    private static void prestamo(StudentModel student, UserModel user, BookModel book, LocalDate returnDate) {
        var p = new PrestamoModel();
        p.student = student;
        p.attendedBy = user;
        p.book = book;
        p.startDate = LocalDate.now().minusDays(1);
        p.dueDate = LocalDate.now().plusDays(6);
        p.returnDate = returnDate;
        p.persist();
    }
}

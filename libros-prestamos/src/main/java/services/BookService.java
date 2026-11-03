package services;

import clients.PersonasRestClient;
import dtos.BookDTO;
import dtos.SimpleStudentDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import models.BookModel;
import org.eclipse.microprofile.rest.client.inject.RestClient;
import repositories.BookRepository;
import repositories.PrestamoRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class BookService {

    @Inject
    BookRepository bookRepository;

    @Inject
    PrestamoRepository prestamoRepository;

    @Inject
    @RestClient
    PersonasRestClient personasRestClient;

    public List<BookDTO> getBooks() {
        return bookRepository.listAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<BookDTO> getBook(String uuid) {
        return bookRepository.findByIdOptional(UUID.fromString(uuid))
                .map(this::toDTO);
    }

    @Transactional
    public BookDTO createBook(BookDTO bookDTO) {
        var book = new BookModel();
        book.author = bookDTO.author();
        book.title = bookDTO.title();
        book.numPages = bookDTO.numPages();
        book.pubDate = bookDTO.pubDate();
        book.description = bookDTO.description();
        bookRepository.persist(book);
        return toDTO(book);
    }

    @Transactional
    public Optional<BookDTO> updateBook(String uuid, BookDTO bookDTO) {
        return bookRepository.findByIdOptional(UUID.fromString(uuid))
                .map(book -> {
                    book.title = bookDTO.title();
                    book.author = bookDTO.author();
                    book.numPages = bookDTO.numPages();
                    book.pubDate = bookDTO.pubDate();
                    book.description = bookDTO.description();
                    return toDTO(book);
                });
    }

    @Transactional
    public boolean deleteBook(String uuid) {
        return bookRepository.deleteById(UUID.fromString(uuid));
    }

    public BookDTO toDTO(BookModel bookModel) {
        var prestamosActivos = prestamoRepository.findActiveByBook(bookModel.uuid);

        var alumnosConPrestamo = prestamosActivos.stream()
                .map(prestamo -> {
                    try {
                        var student = personasRestClient.getAlumno(prestamo.studentUuid.toString());
                        return new SimpleStudentDTO(student.uuid(), student.document(), student.firstName(), student.lastName());
                    } catch (Exception e) {
                        return new SimpleStudentDTO(prestamo.studentUuid.toString(), null, null, null);
                    }
                })
                .toList();

        return new BookDTO(
                bookModel.uuid.toString(),
                bookModel.title,
                bookModel.author,
                !prestamosActivos.isEmpty(),
                bookModel.numPages,
                bookModel.pubDate,
                bookModel.description,
                alumnosConPrestamo
        );
    }
}

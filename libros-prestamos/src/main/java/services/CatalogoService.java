package services;

import dtos.CatalogoDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import models.BookModel;
import repositories.BookRepository;
import repositories.PrestamoRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class CatalogoService {

    @Inject
    BookRepository bookRepository;

    @Inject
    PrestamoRepository prestamoRepository;

    public List<CatalogoDTO> getCatalogo() {
        var prestados = prestamoRepository.uuidsLibrosPrestados();

        return bookRepository.listAll().stream()
                .map(book -> toDTO(book, !prestados.contains(book.uuid)))
                .toList();
    }

    public Optional<CatalogoDTO> getLibro(String uuid) {
        var bookUuid = UUID.fromString(uuid);

        return bookRepository.findByIdOptional(bookUuid)
                .map(book -> toDTO(book, prestamoRepository.findActiveByBook(bookUuid).isEmpty()));
    }

    private static CatalogoDTO toDTO(BookModel book, boolean available) {
        return new CatalogoDTO(
                book.uuid.toString(),
                book.title,
                book.author,
                available,
                book.numPages,
                book.pubDate,
                book.description
        );
    }
}

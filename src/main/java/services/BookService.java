package services;

import dtos.BookDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import models.BookModel;
import repositories.BookRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class BookService {

    @Inject
    BookRepository bookRepository;

    public List<BookDTO> getBooks() {
        return bookRepository.listAll().stream()
                .map(BookService::toDTO)
                .toList();
    }

    public Optional<BookDTO> getBook(String uuid) {
        return bookRepository.findByIdOptional(UUID.fromString(uuid))
                .map(BookService::toDTO);
    }

    @Transactional
    public BookDTO createBook(BookDTO bookDTO) {
        var book = new BookModel();
        book.author = bookDTO.author();
        book.title = bookDTO.title();
        book.rented = bookDTO.rented();
        bookRepository.persist(book);
        return toDTO(book);
    }

    @Transactional
    public Optional<BookDTO> updateBook(String uuid, BookDTO bookDTO) {
        return bookRepository.findByIdOptional(UUID.fromString(uuid))
                .map(book -> {
                    book.title = bookDTO.title();
                    book.author = bookDTO.author();
                    book.rented = bookDTO.rented();
                    return toDTO(book);
                });
    }

    @Transactional
    public boolean deleteBook(String uuid) {
        return bookRepository.deleteById(UUID.fromString(uuid));
    }

    public static BookDTO toDTO(BookModel bookModel) {
        return new BookDTO(
                bookModel.uuid.toString(),
                bookModel.title,
                bookModel.author,
                bookModel.rented
        );
    }
}

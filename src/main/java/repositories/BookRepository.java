package repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import models.BookModel;

import java.util.UUID;

@ApplicationScoped
public class BookRepository implements PanacheRepositoryBase<BookModel, UUID> {

}

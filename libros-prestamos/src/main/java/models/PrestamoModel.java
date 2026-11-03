package models;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
public class PrestamoModel extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID uuid;

    @Column(nullable = false)
    public UUID studentUuid;

    @Column(nullable = false)
    public UUID attendedByUuid;

    @ManyToOne(optional = false)
    public BookModel book;

    public LocalDate startDate;

    public LocalDate dueDate;

    public LocalDate returnDate;
}

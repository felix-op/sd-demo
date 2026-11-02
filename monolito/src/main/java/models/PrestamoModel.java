package models;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToOne;

import java.time.LocalDate;
import java.util.UUID;

@Entity
public class PrestamoModel extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID uuid;

    @ManyToOne
    public StudentModel student;

    @ManyToOne
    public UserModel attendedBy;

    @ManyToOne
    public BookModel book;

    public LocalDate startDate;

    public LocalDate dueDate;

    public LocalDate returnDate;
}

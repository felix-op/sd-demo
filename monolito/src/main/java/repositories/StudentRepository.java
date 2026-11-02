package repositories;

import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import models.StudentModel;

import java.util.UUID;

@ApplicationScoped
public class StudentRepository implements PanacheRepositoryBase<StudentModel, UUID> {

}

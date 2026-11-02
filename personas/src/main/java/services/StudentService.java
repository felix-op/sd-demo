package services;

import dtos.StudentDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import models.StudentModel;
import repositories.StudentRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class StudentService {

    @Inject
    StudentRepository studentRepository;

    public List<StudentDTO> getStudents() {
        return studentRepository.listAll().stream()
                .map(this::toDTO)
                .toList();
    }

    public Optional<StudentDTO> getStudent(String uuid) {
        return studentRepository.findByIdOptional(UUID.fromString(uuid))
                .map(this::toDTO);
    }

    @Transactional
    public StudentDTO createStudent(StudentDTO studentDTO) {
        var student = new StudentModel();
        student.firstName = studentDTO.firstName();
        student.lastName = studentDTO.lastName();
        student.documentId = studentDTO.document();
        student.birthday = studentDTO.birthday();
        studentRepository.persist(student);
        return toDTO(student);
    }

    @Transactional
    public Optional<StudentDTO> updateStudent(String uuid, StudentDTO studentDTO) {
        return studentRepository.findByIdOptional(UUID.fromString(uuid))
                .map(student -> {
                    student.firstName = studentDTO.firstName();
                    student.lastName = studentDTO.lastName();
                    student.documentId = studentDTO.document();
                    student.birthday = studentDTO.birthday();
                    return toDTO(student);
                });
    }

    @Transactional
    public boolean deleteStudent(String uuid) {
        return studentRepository.deleteById(UUID.fromString(uuid));
    }

    public StudentDTO toDTO(StudentModel studentModel) {
        return new StudentDTO(
                studentModel.uuid.toString(),
                studentModel.firstName,
                studentModel.lastName,
                studentModel.birthday,
                studentModel.documentId
        );
    }
}

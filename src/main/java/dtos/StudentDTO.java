package dtos;

import java.time.LocalDate;

public record StudentDTO(
        String uuid,
        String firstName,
        String lastName,
        LocalDate birthday,
        String document
) {
}

package dtos;

import java.time.LocalDate;
import java.util.List;

public record StudentDTO(
        String uuid,
        String firstName,
        String lastName,
        LocalDate birthday,
        String document,
        List<SimpleBookDTO> librosPrestados
) {
}

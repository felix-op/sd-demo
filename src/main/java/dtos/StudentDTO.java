package dtos;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

import java.time.LocalDate;
import java.util.List;

public record StudentDTO(
        String uuid,
        @Schema(required = true) String firstName,
        String lastName,
        LocalDate birthday,
        @Schema(required = true) String document,
        List<SimpleBookDTO> librosPrestados
) {
}

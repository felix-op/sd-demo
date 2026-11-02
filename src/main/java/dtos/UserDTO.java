package dtos;

import org.eclipse.microprofile.openapi.annotations.media.Schema;

public record UserDTO(
        String uuid,
        @Schema(required = true) String nombre,
        @Schema(required = true) String documento
) {
}

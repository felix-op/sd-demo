package dtos;

public record BookDTO(
        String uuid,
        String title,
        String author,
        boolean rented
) {
}

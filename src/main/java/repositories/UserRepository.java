package repositories;

import dtos.UserDTO;

import java.util.List;
import java.util.Objects;
import java.util.Optional;

public class UserRepository {
    private static final List<UserDTO> users = List.of(
            new UserDTO("1", "Juan", "1234"),
            new UserDTO("2", "Pedro", "1234"),
            new UserDTO("3", "María", "1234"),
            new UserDTO("4", "Carlos", "1234"),
            new UserDTO("5", "Ana", "1234"),
            new UserDTO("6", "Lucía", "1234"),
            new UserDTO("7", "Martín", "1234"),
            new UserDTO("8", "Sofía", "1234"),
            new UserDTO("9", "Pablo", "1234"),
            new UserDTO("10", "Laura", "1234"),
            new UserDTO("11", "Diego", "1234"),
            new UserDTO("12", "Marta", "1234")
    );

    public static List<UserDTO> getUsers() {
        return users;
    }

    public static Optional<UserDTO> getUser(String uuid) {
        return users.stream()
                .filter((user) -> Objects.equals(user.uuid(), uuid))
                .findFirst();
    }
}

package services;

import dtos.UserDTO;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import models.UserModel;
import repositories.UserRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    public List<UserDTO> getUsers() {
        return userRepository.listAll().stream()
                .map(UserService::toDto)
                .toList();
    }

    public Optional<UserDTO> getUser(String uuid) {
        return userRepository.findByIdOptional(UUID.fromString(uuid))
                .map(UserService::toDto);
    }

    @Transactional
    public UserDTO createUser(UserDTO dto) {
        var user = new UserModel();
        user.nombre = dto.nombre();
        user.documento = dto.documento();
        userRepository.persist(user);
        return toDto(user);
    }

    @Transactional
    public Optional<UserDTO> updateUser(String uuid, UserDTO dto) {
        return userRepository.findByIdOptional(UUID.fromString(uuid))
                .map(user -> {
                    user.nombre = dto.nombre();
                    user.documento = dto.documento();
                    return toDto(user);
                });
    }

    @Transactional
    public boolean deleteUser(String uuid) {
        return userRepository.deleteById(UUID.fromString(uuid));
    }

    private static UserDTO toDto(UserModel user) {
        return new UserDTO(user.uuid.toString(), user.nombre, user.documento);
    }
}

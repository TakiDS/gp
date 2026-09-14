// package com.example.back_end.UsuarioSistema.mapper;

// import org.springframework.stereotype.Component;
// import com.example.back_end.UsuarioSistema.domain.UsuarioSistema;
// import com.example.back_end.UsuarioSistema.dto.UsuarioResponseDTO;
// import java.util.List;
// import java.util.stream.Collectors;

// @Component // O Spring gerencia isso como um Bean comum
// public class UsuarioSistemaMapper {

//     public UsuarioResponseDTO toDto(UsuarioSistema usuario) {
//         if (usuario == null) return null;

//         return new UsuarioResponseDTO(
//             usuario.getUuid(),
//             usuario.getNome(),
//             usuario.getLogin(),
//             usuario.getRole() != null ? usuario.getRole().name() : null // Garante que vire String
//         );
//     }

//     public List<UsuarioResponseDTO> toDtoList(List<UsuarioSistema> usuarios) {
//         return usuarios.stream()
//                 .map(this::toDto)
//                 .collect(Collectors.toList());
//     }
// }
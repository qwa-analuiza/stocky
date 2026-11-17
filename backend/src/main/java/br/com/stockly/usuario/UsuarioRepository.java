package br.com.stockly.usuario;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * Acesso à tabela "usuarios".
 * Os nomes "findBy"/"existsBy" ficam em inglês porque o Spring Data
 * monta a consulta SQL lendo o próprio nome do método.
 */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByEmail(String email);

    boolean existsByEmail(String email);
}

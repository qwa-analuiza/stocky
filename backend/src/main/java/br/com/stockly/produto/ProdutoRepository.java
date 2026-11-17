package br.com.stockly.produto;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Toda consulta filtra pelo usuário: ninguém enxerga o estoque de outra pessoa. */
public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    List<Produto> findAllByUsuarioIdOrderByNomeAsc(Long usuarioId);

    Optional<Produto> findByIdAndUsuarioId(Long id, Long usuarioId);
}

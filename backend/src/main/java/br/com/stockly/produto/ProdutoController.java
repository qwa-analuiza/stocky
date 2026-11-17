package br.com.stockly.produto;

import br.com.stockly.produto.dto.ProdutoRequisicao;
import br.com.stockly.produto.dto.ProdutoResposta;
import br.com.stockly.produto.dto.ResumoEstoque;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Estoque da pessoa logada. O id do usuário vem sempre do token, nunca do front. */
@RestController
@RequestMapping("/api/produtos")
public class ProdutoController {

    private final ProdutoService produtoService;

    public ProdutoController(ProdutoService produtoService) {
        this.produtoService = produtoService;
    }

    @GetMapping
    public List<ProdutoResposta> listar(@AuthenticationPrincipal Jwt token) {
        return produtoService.listar(usuarioId(token));
    }

    /** GET /api/produtos/resumo — números do painel e da tela de valor de estoque */
    @GetMapping("/resumo")
    public ResumoEstoque resumo(@AuthenticationPrincipal Jwt token) {
        return produtoService.resumir(usuarioId(token));
    }

    @GetMapping("/{id}")
    public ProdutoResposta buscar(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        return produtoService.buscar(usuarioId(token), id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoResposta criar(@AuthenticationPrincipal Jwt token, @RequestBody @Valid ProdutoRequisicao dados) {
        return produtoService.criar(usuarioId(token), dados);
    }

    @PutMapping("/{id}")
    public ProdutoResposta atualizar(@AuthenticationPrincipal Jwt token, @PathVariable Long id,
                                     @RequestBody @Valid ProdutoRequisicao dados) {
        return produtoService.atualizar(usuarioId(token), id, dados);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void excluir(@AuthenticationPrincipal Jwt token, @PathVariable Long id) {
        produtoService.excluir(usuarioId(token), id);
    }

    private static Long usuarioId(Jwt token) {
        return Long.valueOf(token.getSubject());
    }
}

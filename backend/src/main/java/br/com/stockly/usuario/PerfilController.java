package br.com.stockly.usuario;

import br.com.stockly.usuario.dto.AlterarSenhaRequisicao;
import br.com.stockly.usuario.dto.AtualizarPerfilRequisicao;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

/** Perfil da pessoa logada. O id vem sempre do token. */
@RestController
@RequestMapping("/api/perfil")
public class PerfilController {

    private final PerfilService perfilService;

    public PerfilController(PerfilService perfilService) {
        this.perfilService = perfilService;
    }

    @GetMapping
    public UsuarioResposta buscar(@AuthenticationPrincipal Jwt token) {
        return perfilService.buscar(usuarioId(token));
    }

    @PutMapping
    public UsuarioResposta atualizar(@AuthenticationPrincipal Jwt token,
                                     @RequestBody @Valid AtualizarPerfilRequisicao dados) {
        return perfilService.atualizar(usuarioId(token), dados);
    }

    @PutMapping("/senha")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void alterarSenha(@AuthenticationPrincipal Jwt token,
                             @RequestBody @Valid AlterarSenhaRequisicao dados) {
        perfilService.alterarSenha(usuarioId(token), dados);
    }

    private static Long usuarioId(Jwt token) {
        return Long.valueOf(token.getSubject());
    }
}

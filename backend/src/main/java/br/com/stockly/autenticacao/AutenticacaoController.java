package br.com.stockly.autenticacao;

import br.com.stockly.autenticacao.dto.CadastroRequisicao;
import br.com.stockly.autenticacao.dto.LoginRequisicao;
import br.com.stockly.autenticacao.dto.SessaoResposta;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AutenticacaoController {

    private final AutenticacaoService autenticacaoService;

    public AutenticacaoController(AutenticacaoService autenticacaoService) {
        this.autenticacaoService = autenticacaoService;
    }

    /** POST /api/auth/cadastro — tela "Crie sua conta grátis" */
    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public SessaoResposta cadastrar(@RequestBody @Valid CadastroRequisicao dados) {
        return autenticacaoService.cadastrar(dados);
    }

    /** POST /api/auth/login — tela "Acesse sua conta" */
    @PostMapping("/login")
    public SessaoResposta entrar(@RequestBody @Valid LoginRequisicao dados) {
        return autenticacaoService.entrar(dados);
    }
}

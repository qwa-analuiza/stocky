package br.com.stockly.autenticacao;

import br.com.stockly.autenticacao.dto.CadastroRequisicao;
import br.com.stockly.autenticacao.dto.LoginRequisicao;
import br.com.stockly.autenticacao.dto.SessaoResposta;
import br.com.stockly.compartilhado.erro.CredenciaisInvalidasException;
import br.com.stockly.compartilhado.erro.EmailJaCadastradoException;
import br.com.stockly.usuario.Usuario;
import br.com.stockly.usuario.UsuarioRepository;
import br.com.stockly.usuario.UsuarioResposta;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/** Regras de cadastro e login. */
@Service
public class AutenticacaoService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder codificadorDeSenha;
    private final TokenService tokenService;

    public AutenticacaoService(UsuarioRepository usuarios, PasswordEncoder codificadorDeSenha, TokenService tokenService) {
        this.usuarios = usuarios;
        this.codificadorDeSenha = codificadorDeSenha;
        this.tokenService = tokenService;
    }

    @Transactional
    public SessaoResposta cadastrar(CadastroRequisicao dados) {
        String email = normalizarEmail(dados.email());

        if (usuarios.existsByEmail(email)) {
            throw new EmailJaCadastradoException();
        }

        Usuario novoUsuario = usuarios.save(new Usuario(
                dados.nome().trim(),
                dados.nomeNegocio().trim(),
                email,
                codificadorDeSenha.encode(dados.senha())
        ));

        // Já devolve o token: a pessoa entra direto depois de se cadastrar
        return abrirSessao(novoUsuario);
    }

    @Transactional(readOnly = true)
    public SessaoResposta entrar(LoginRequisicao dados) {
        Usuario usuario = usuarios.findByEmail(normalizarEmail(dados.email()))
                .orElseThrow(CredenciaisInvalidasException::new);

        if (!codificadorDeSenha.matches(dados.senha(), usuario.getSenhaHash())) {
            // Mesma mensagem para e-mail ou senha errados: não revela quais e-mails existem
            throw new CredenciaisInvalidasException();
        }
        return abrirSessao(usuario);
    }

    private SessaoResposta abrirSessao(Usuario usuario) {
        TokenService.TokenGerado token = tokenService.gerar(usuario);
        return new SessaoResposta(token.token(), token.expiraEm(), UsuarioResposta.de(usuario));
    }

    private String normalizarEmail(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}

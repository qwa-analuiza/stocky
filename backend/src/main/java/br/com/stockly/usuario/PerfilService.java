package br.com.stockly.usuario;

import br.com.stockly.compartilhado.erro.CampoInvalidoException;
import br.com.stockly.compartilhado.erro.EmailJaCadastradoException;
import br.com.stockly.compartilhado.erro.NaoEncontradoException;
import br.com.stockly.usuario.dto.AlterarSenhaRequisicao;
import br.com.stockly.usuario.dto.AtualizarPerfilRequisicao;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;

/** Regras do perfil: ver e editar os próprios dados e trocar a senha. */
@Service
public class PerfilService {

    private final UsuarioRepository usuarios;
    private final PasswordEncoder codificadorDeSenha;

    public PerfilService(UsuarioRepository usuarios, PasswordEncoder codificadorDeSenha) {
        this.usuarios = usuarios;
        this.codificadorDeSenha = codificadorDeSenha;
    }

    @Transactional(readOnly = true)
    public UsuarioResposta buscar(Long usuarioId) {
        return UsuarioResposta.de(buscarUsuario(usuarioId));
    }

    @Transactional
    public UsuarioResposta atualizar(Long usuarioId, AtualizarPerfilRequisicao dados) {
        Usuario usuario = buscarUsuario(usuarioId);
        String email = dados.email().trim().toLowerCase(Locale.ROOT);

        boolean trocouEmail = !email.equals(usuario.getEmail());
        if (trocouEmail && usuarios.existsByEmail(email)) {
            throw new CampoInvalidoException("email", EmailJaCadastradoException.MENSAGEM_OUTRA_CONTA);
        }

        usuario.atualizarDados(dados.nome().trim(), dados.nomeNegocio().trim(), email);
        return UsuarioResposta.de(usuario);
    }

    @Transactional
    public void alterarSenha(Long usuarioId, AlterarSenhaRequisicao dados) {
        Usuario usuario = buscarUsuario(usuarioId);

        if (!codificadorDeSenha.matches(dados.senhaAtual(), usuario.getSenhaHash())) {
            throw new CampoInvalidoException("senhaAtual", "Senha atual incorreta");
        }
        if (dados.senhaAtual().equals(dados.novaSenha())) {
            throw new CampoInvalidoException("novaSenha", "A nova senha precisa ser diferente da atual");
        }

        usuario.trocarSenha(codificadorDeSenha.encode(dados.novaSenha()));
    }

    private Usuario buscarUsuario(Long usuarioId) {
        return usuarios.findById(usuarioId)
                .orElseThrow(() -> new NaoEncontradoException("Usuário não encontrado"));
    }
}

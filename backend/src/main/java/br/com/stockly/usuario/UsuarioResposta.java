package br.com.stockly.usuario;

/** O que o front pode saber sobre o usuário (sem a senha!). */
public record UsuarioResposta(Long id, String nome, String nomeNegocio, String email) {

    public static UsuarioResposta de(Usuario usuario) {
        return new UsuarioResposta(usuario.getId(), usuario.getNome(), usuario.getNomeNegocio(), usuario.getEmail());
    }
}

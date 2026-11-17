package br.com.stockly.autenticacao.dto;

import br.com.stockly.usuario.UsuarioResposta;

import java.time.Instant;

/** Resposta do login e do cadastro: o token e quem está logado. */
public record SessaoResposta(String token, Instant expiraEm, UsuarioResposta usuario) {}

package br.com.stockly.autenticacao.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

/** Dados da tela "Acesse sua conta". */
public record LoginRequisicao(
        @NotBlank(message = "Informe seu e-mail")
        @Email(message = "Informe um e-mail válido")
        String email,

        @NotBlank(message = "Informe sua senha")
        String senha
) {}

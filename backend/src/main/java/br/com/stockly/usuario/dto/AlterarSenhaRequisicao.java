package br.com.stockly.usuario.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados da seção "Alterar senha" do perfil. */
public record AlterarSenhaRequisicao(
        @NotBlank(message = "Informe sua senha atual")
        String senhaAtual,

        @NotBlank(message = "Crie uma nova senha")
        @Size(min = 6, max = 72, message = "A senha precisa ter entre 6 e 72 caracteres")
        String novaSenha
) {}

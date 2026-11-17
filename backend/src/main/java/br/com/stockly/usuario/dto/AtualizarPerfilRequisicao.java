package br.com.stockly.usuario.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Dados da seção "Dados da conta" do perfil. */
public record AtualizarPerfilRequisicao(
        @NotBlank(message = "Informe seu nome")
        @Size(max = 80, message = "O nome pode ter no máximo 80 caracteres")
        String nome,

        @NotBlank(message = "Informe o nome do seu negócio")
        @Size(max = 120, message = "O nome do negócio pode ter no máximo 120 caracteres")
        String nomeNegocio,

        @NotBlank(message = "Informe seu e-mail")
        @Email(message = "Informe um e-mail válido")
        @Size(max = 160, message = "O e-mail pode ter no máximo 160 caracteres")
        String email
) {}

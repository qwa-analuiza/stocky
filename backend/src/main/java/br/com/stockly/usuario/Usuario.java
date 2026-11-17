package br.com.stockly.usuario;

import jakarta.persistence.*;

import java.time.OffsetDateTime;

/**
 * Dono(a) do negócio que usa o Stockly.
 * A senha NUNCA é guardada em texto: só o hash gerado pelo BCrypt.
 */
@Entity
@Table(name = "usuarios")
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 80)
    private String nome;

    @Column(name = "nome_negocio", nullable = false, length = 120)
    private String nomeNegocio;

    @Column(nullable = false, length = 160)
    private String email;

    @Column(name = "senha_hash", nullable = false, length = 100)
    private String senhaHash;

    @Column(name = "criado_em", nullable = false, updatable = false)
    private OffsetDateTime criadoEm;

    protected Usuario() {
        // exigido pelo JPA
    }

    public Usuario(String nome, String nomeNegocio, String email, String senhaHash) {
        this.nome = nome;
        this.nomeNegocio = nomeNegocio;
        this.email = email;
        this.senhaHash = senhaHash;
    }

    public void atualizarDados(String nome, String nomeNegocio, String email) {
        this.nome = nome;
        this.nomeNegocio = nomeNegocio;
        this.email = email;
    }

    public void trocarSenha(String novaSenhaHash) {
        this.senhaHash = novaSenhaHash;
    }

    @PrePersist
    void antesDeSalvar() {
        this.criadoEm = OffsetDateTime.now();
    }

    public Long getId() { return id; }
    public String getNome() { return nome; }
    public String getNomeNegocio() { return nomeNegocio; }
    public String getEmail() { return email; }
    public String getSenhaHash() { return senhaHash; }
}

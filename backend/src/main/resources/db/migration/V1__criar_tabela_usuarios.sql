CREATE TABLE usuarios (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    nome          VARCHAR(80)  NOT NULL,
    nome_negocio  VARCHAR(120) NOT NULL,
    email         VARCHAR(160) NOT NULL,
    senha_hash    VARCHAR(100) NOT NULL,
    criado_em     DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_usuarios PRIMARY KEY (id),
    CONSTRAINT uk_usuarios_email UNIQUE (email)
);

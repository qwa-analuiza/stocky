CREATE TABLE produtos (
    id               BIGINT        NOT NULL AUTO_INCREMENT,
    usuario_id       BIGINT        NOT NULL,
    nome             VARCHAR(120)  NOT NULL,
    descricao        VARCHAR(500),
    quantidade       INT           NOT NULL,
    valor_investido  DECIMAL(12,2) NOT NULL,   -- quanto custou cada unidade
    valor_venda      DECIMAL(12,2) NOT NULL,   -- por quanto cada unidade é vendida
    data_vencimento  DATE,
    imagem           MEDIUMTEXT,               -- foto já reduzida pelo front, em base64
    criado_em        DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    atualizado_em    DATETIME(6)   NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    CONSTRAINT pk_produtos PRIMARY KEY (id),
    CONSTRAINT fk_produtos_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios (id) ON DELETE CASCADE
);

CREATE INDEX idx_produtos_usuario ON produtos (usuario_id);

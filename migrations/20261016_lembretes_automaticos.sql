-- Execute uma vez antes de publicar a versão da API.
-- Notificações são a visualização dos lembretes no cliente; não há tabela própria.
ALTER TABLE lembrete
    ADD COLUMN categoria_lembrete VARCHAR(50) NULL,
    ADD COLUMN origem_lembrete VARCHAR(20) NOT NULL DEFAULT 'manual',
    ADD COLUMN tipo_notificacao_origem VARCHAR(50) NULL,
    ADD COLUMN id_evento_origem INT UNSIGNED NULL,
    ADD COLUMN chave_idempotencia VARCHAR(191) NULL,
    ADD UNIQUE KEY uq_lembrete_chave_idempotencia (chave_idempotencia),
    ADD UNIQUE KEY uq_lembrete_automatico_evento (ID_user, origem_lembrete, tipo_notificacao_origem, id_evento_origem);

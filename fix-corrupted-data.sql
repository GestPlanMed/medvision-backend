-- Script SQL para corrigir dados corrompidos na coluna address da tabela patients
-- Execute este script diretamente no PostgreSQL ou via Prisma Studio

-- Atualizar todos os registros onde address não é um JSON válido para NULL
UPDATE patients
SET address = NULL
WHERE address IS NOT NULL
  AND jsonb_typeof(address::jsonb) IS NULL;

-- Verificar registros após atualização
SELECT id, name, address 
FROM patients 
LIMIT 10;

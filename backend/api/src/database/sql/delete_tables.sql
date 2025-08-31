-- Gera e executa automaticamente os DROP TABLE para todas as tabelas
DO $$ 
DECLARE
    tabela RECORD;
BEGIN
    FOR tabela IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(tabela.tablename) || ' CASCADE';
        RAISE NOTICE 'Tabela removida: %', tabela.tablename;
    END LOOP;
END $$;
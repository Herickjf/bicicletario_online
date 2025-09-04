-- Gera e executa automaticamente os DROP TABLE e DROP TYPE para todos os objetos no schema public
DO $$ 
DECLARE
    tabela RECORD;
    tipo   RECORD;
BEGIN
    FOR tabela IN 
        SELECT tablename 
        FROM pg_tables 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(tabela.tablename) || ' CASCADE';
        RAISE NOTICE 'Tabela removida: %', tabela.tablename;
    END LOOP;

    FOR tipo IN 
        SELECT t.typname 
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
          AND t.typtype IN ('e','c','d') -- enum, composite, domain
    LOOP
        EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(tipo.typname) || ' CASCADE';
        RAISE NOTICE 'Tipo removido: %', tipo.typname;
    END LOOP;
END $$;
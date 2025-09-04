DO $$
DECLARE
    tbl RECORD;
BEGIN
    FOR tbl IN
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
    LOOP
        EXECUTE 'TRUNCATE TABLE ' || quote_ident(tbl.tablename) || ' CASCADE';
        RAISE NOTICE 'Tabela % esvaziada!', tbl.tablename;
    END LOOP;
END $$;
CREATE OR REPLACE FUNCTION ganho_mensal(p_bike_rack_id INT)
RETURNS TABLE (
    total NUMERIC,
    media NUMERIC,
    ganho_com_alugueis NUMERIC,
    ganho_com_planos NUMERIC
) AS $$
DECLARE
    dias_no_mes INT;
BEGIN
    -- Dias no mês atual
    dias_no_mes := EXTRACT(DAY FROM (DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month - 1 day'));

    RETURN QUERY
    WITH alugueis AS (
        SELECT COALESCE(SUM(total_value),0) AS ganho_com_alugueis
        FROM Rent
        WHERE bike_rack_id = p_bike_rack_id
        AND DATE_TRUNC('month', rent_date) = DATE_TRUNC('month', CURRENT_DATE)
    ),
    planos AS (
        SELECT COALESCE(SUM(price),0) AS ganho_com_planos
        FROM Subscription s
        INNER JOIN Plan p ON s.plan_id = p.plan_id
        WHERE p.bike_rack_id = p_bike_rack_id
        AND s.active = TRUE
        AND DATE_TRUNC('month', s.start_date) <= DATE_TRUNC('month', CURRENT_DATE)
        AND (s.end_date IS NULL OR DATE_TRUNC('month', s.end_date) >= DATE_TRUNC('month', CURRENT_DATE))
    )
    SELECT 
        (a.ganho_com_alugueis + p.ganho_com_planos) AS total,
        (a.ganho_com_alugueis + p.ganho_com_planos) / dias_no_mes AS media,
        a.ganho_com_alugueis,
        p.ganho_com_planos
    FROM alugueis a, planos p;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE VIEW ganho_anual_view AS
WITH alugueis AS (
    -- Ganho com aluguéis por mês, agrupado por bike_rack
    SELECT 
        r.bike_rack_id,
        DATE_TRUNC('month', r.rent_date)::DATE AS mes,
        COALESCE(SUM(r.total_value), 0) AS ganho_com_alugueis
    FROM 
        Rent r
    WHERE 
        DATE_TRUNC('year', r.rent_date) = DATE_TRUNC('year', CURRENT_DATE)
    GROUP BY 
        1, 2
),
planos AS (
    -- Ganho com planos ativos por mês (iniciados no ano corrente), agrupado por bike_rack
    SELECT 
        p.bike_rack_id,
        DATE_TRUNC('month', s.start_date)::DATE AS mes,
        COALESCE(SUM(p.price), 0) AS ganho_com_planos
    FROM 
        Subscription s
    INNER JOIN 
        Plan p ON s.plan_id = p.plan_id
    WHERE 
        s.active = TRUE
        AND DATE_TRUNC('year', s.start_date) = DATE_TRUNC('year', CURRENT_DATE)
    GROUP BY 
        1, 2
)
SELECT 
    COALESCE(a.bike_rack_id, pl.bike_rack_id) AS bike_rack_id,
    COALESCE(a.mes, pl.mes) AS mes,
    COALESCE(a.ganho_com_alugueis, 0) AS ganho_com_alugueis,
    COALESCE(pl.ganho_com_planos, 0) AS ganho_com_planos,
    COALESCE(a.ganho_com_alugueis, 0) + COALESCE(pl.ganho_com_planos, 0) AS ganho_total
FROM 
    alugueis a
FULL OUTER JOIN 
    planos pl ON a.mes = pl.mes AND a.bike_rack_id = pl.bike_rack_id -- Join por Mês e por BikeRack
ORDER BY 
    bike_rack_id, mes;

CREATE OR REPLACE VIEW v_bikerack_detalhes AS
SELECT 
    br.*,
    a.street AS street,
    a.num AS num,
    a.zip_code AS zip_code,
    a.city AS city,
    a.state AS state,
    COUNT(DISTINCT ur.user_id) AS qtd_clientes
FROM BikeRack br
INNER JOIN Address a 
    ON br.address_id = a.address_id
LEFT JOIN UsersRole ur 
    ON br.bike_rack_id = ur.bike_rack_id
GROUP BY br.bike_rack_id, a.address_id;
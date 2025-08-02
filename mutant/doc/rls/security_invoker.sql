SELECT 
    grantee, 
    table_schema, 
    table_name, 
    privilege_type 
FROM 
    information_schema.role_table_grants 
WHERE 
    grantee = 'cnt';


SELECT
    n.nspname AS schema_name,
    c.relname AS view_name,
    CASE
        WHEN 'security_invoker=true' = ANY(c.reloptions) THEN TRUE
        WHEN 'security_invoker=1' = ANY(c.reloptions) THEN TRUE
        WHEN 'security_invoker=on' = ANY(c.reloptions) THEN TRUE
        ELSE FALSE
    END AS is_security_invoker
FROM
    pg_class c
JOIN
    pg_namespace n ON n.oid = c.relnamespace
WHERE
    c.relkind = 'v' -- 'v' означает view (представление)
    AND n.nspname NOT IN ('pg_catalog', 'information_schema', 'pg_toast') -- Исключаем системные схемы
ORDER BY
    schema_name, view_name;

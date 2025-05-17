INSERT INTO perm_report(app_id, report_id, report_name, query, report_config, report_description)
SELECT 'mutant' AS app_id,
       report_id,
       report_name,
       query,
       report_config,
       report_description
FROM perm_report
WHERE app_id = 'mui-uf-admin'
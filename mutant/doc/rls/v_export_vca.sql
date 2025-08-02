CREATE OR REPLACE VIEW pcnt.v_export_vca
WITH (security_invoker = true)
AS
SELECT
    v.name AS point,
    v.dt AS date,
    CASE v.male
        WHEN true THEN 'male'::text
        ELSE 'female'::text
    END AS gender,
    v.age,
    p.customer_id,
    p.point_id,
    v.id
FROM pcnt.v_event_data v
JOIN pcnt.point p USING (point_id);
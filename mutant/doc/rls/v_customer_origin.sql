CREATE OR REPLACE VIEW pcnt.v_customer_origin
WITH (security_invoker = true)
AS
 SELECT point.customer_id,
    origin.origin,
    origin.id,
    origin.point_id,
    origin.origin_type_id,
    origin.credentials,
    origin.is_enabled,
    origin.name
   FROM pcnt.origin
     JOIN pcnt.point USING (point_id)
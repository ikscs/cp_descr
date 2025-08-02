CREATE OR REPLACE VIEW pcnt.v_event_data_si
WITH (security_invoker = true)
AS
 SELECT event_data.point_id,
    event_data.name,
    event_data.dt,
    event_data.age,
        CASE event_data.point_id = 5
            WHEN true THEN (((event_data.demography -> 'gender'::text) ->> 'Man'::text)::numeric) > 99::numeric
            ELSE event_data.male
        END AS male,
    event_data.demography,
    point.customer_id,
    event_data.id
   FROM pcnt.event_data
     JOIN pcnt.point USING (point_id)
UNION ALL
 SELECT event_data_demo.point_id,
    event_data_demo.name,
    event_data_demo.dt,
    event_data_demo.age,
    event_data_demo.male,
    event_data_demo.demography,
    point.customer_id,
    event_data_demo.id
   FROM pcnt.event_data_demo
     JOIN pcnt.point USING (point_id)
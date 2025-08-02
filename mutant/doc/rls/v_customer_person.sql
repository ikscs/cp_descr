CREATE OR REPLACE VIEW pcnt.v_customer_person
WITH (security_invoker = true)
AS
SELECT 
	g.customer_id,
	g.name group_name,
    p.person_id,
    p.group_id,
    p.name,
	f.photo
  FROM pcnt.person p
    JOIN pcnt.person_group g USING (group_id)     
	JOIN pcnt.face_referer_data f USING (person_id)
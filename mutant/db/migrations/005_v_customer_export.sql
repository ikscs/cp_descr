create view v_customer_export as 
 SELECT origin.point_id,
    point.name,
    point.customer_id,
    incoming.ts::timestamp(0) without time zone AS ts,
    face_data.demography ->> 'age'::text AS age,
    face_data.demography ->> 'dominant_race'::text AS race,
    face_data.demography ->> 'dominant_emotion'::text AS emotion,
        CASE
            WHEN (face_data.demography ->> 'dominant_gender'::text) = 'Man'::text THEN 'male'::text
            ELSE 'female'::text
        END AS gender
   FROM pcnt.incoming
     JOIN pcnt.origin USING (origin)
     JOIN pcnt.point USING (point_id)
     JOIN pcnt.face_data USING (file_uuid)
  WHERE face_data.demography IS NOT NULL AND face_data.demography <> '{}'::jsonb AND incoming.ts > '2025-04-26 00:00:00+03'::timestamp with time zone AND origin.point_id = 5
  ORDER BY incoming.ts DESC
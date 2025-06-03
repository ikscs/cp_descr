CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION "public"."make_pcnt_customer"("p_email" text, "p_name" text='new customer'::text)
  RETURNS "pg_catalog"."jsonb" AS $BODY$
DECLARE
    v_customer_id INT;
    v_result JSONB;
		v_point_id INT;
BEGIN

		raise info 'p_name %', p_name;
	
    -- Check if customer with the given email already exists
		SELECT customer_id INTO v_customer_id
			FROM customer
			WHERE email = p_email;

    IF v_customer_id IS NOT NULL THEN
        -- Customer already exists
        v_result := jsonb_build_object(
            'ok', FALSE,
            'customer_id', v_customer_id
        );
    ELSE
        -- Customer does not exist, insert new customer
			INSERT INTO customer (email, legal_name)
        VALUES (p_email, p_name)
        RETURNING customer_id INTO v_customer_id;

			INSERT INTO pcnt.point (name, customer_id)
        VALUES ('new point', v_customer_id)
        RETURNING point_id INTO v_point_id;

			INSERT INTO pcnt.origin (point_id, name)
        VALUES (v_point_id, 'new origin');

			INSERT INTO pcnt.person_group (customer_id, point_id, name)
        VALUES (v_customer_id, v_point_id, 'new group');

			v_result := jsonb_build_object(
					'ok', TRUE,
					'customer_id', v_customer_id
			);
    END IF;

    RETURN v_result;
END;
$BODY$
  LANGUAGE plpgsql VOLATILE
  COST 100
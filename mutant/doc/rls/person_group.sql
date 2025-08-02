ALTER TABLE person_group ENABLE ROW LEVEL SECURITY;

CREATE POLICY person_group_isolation ON person_group FOR ALL USING (customer_id = current_setting('app.customer_id')::INT);

ALTER TABLE customer ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_isolation ON customer FOR ALL USING (customer_id = current_setting('app.customer_id')::INT);

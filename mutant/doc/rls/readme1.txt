ALTER TABLE point_rls ENABLE ROW LEVEL SECURITY;

CREATE POLICY customer_isolation ON point_rls FOR ALL USING (customer_id = current_setting('app.customer_id')::INT);

-- 4. Создайте роль для приложения, которая НЕ BYPASSRLS
CREATE ROLE app_user NOLOGIN; -- NOLOGIN означает, что нельзя напрямую войти под этой ролью

GRANT USAGE ON SCHEMA pcnt TO app_user;
-- 5. Предоставьте app_user привилегии на таблицу
GRANT SELECT, INSERT, UPDATE, DELETE ON point_rls TO app_user;

-- 6. В вашей сессии (или в коде приложения):
-- Установите роль приложения
SET ROLE app_user;

-- Выполнение запроса:
SET app.customer_id = '1';
SELECT current_setting('app.customer_id');
SELECT * FROM pcnt.point_rls;

-- Удаляем существующие таблицы, если они есть
DROP TABLE IF EXISTS form_data CASCADE;
DROP TABLE IF EXISTS form_version CASCADE;
DROP TABLE IF EXISTS form_tag CASCADE;
DROP TABLE IF EXISTS form CASCADE;

-- Удаляем существующие типы, если они есть
DROP TYPE IF EXISTS field_type CASCADE;
DROP TYPE IF EXISTS layout_type CASCADE;
DROP TYPE IF EXISTS form_status CASCADE;
DROP TYPE IF EXISTS form_category CASCADE;

-- Перечисление для типов полей
CREATE TYPE field_type AS ENUM (
    'text',
    'number',
    'select',
    'switch',
    'dynamic-select'
);

-- Перечисление для типов макета
CREATE TYPE layout_type AS ENUM (
    'stack',
    'grid',
    'inline',
    'columns'
);

-- Перечисление для статусов формы
CREATE TYPE form_status AS ENUM (
    'draft',
    'published',
    'archived'
);

-- Перечисление для категорий формы
CREATE TYPE form_category AS ENUM (
    'customer',
    'order',
    'product',
    'employee',
    'other'
);

-- Функция для проверки типов полей формы
CREATE OR REPLACE FUNCTION validate_form_config(config JSONB)
RETURNS BOOLEAN AS $$
DECLARE
    field_type_valid BOOLEAN;
    layout_type_valid BOOLEAN;
    field JSONB;
BEGIN
    -- Проверяем тип макета
    IF (config->'layout'->>'type')::layout_type IS NULL THEN
        RETURN FALSE;
    END IF;

    -- Проверяем типы всех полей
    FOR field IN SELECT * FROM jsonb_array_elements(config->'fields')
    LOOP
        BEGIN
            IF (field->>'type')::field_type IS NULL THEN
                RETURN FALSE;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            RETURN FALSE;
        END;
    END LOOP;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Таблица форм
CREATE TABLE form (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category form_category NOT NULL DEFAULT 'other',
    status form_status NOT NULL DEFAULT 'draft',
    current_version INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NOT NULL
);

-- Таблица тегов форм
CREATE TABLE form_tag (
    form_id UUID REFERENCES form(id) ON DELETE CASCADE,
    tag VARCHAR(50) NOT NULL,
    PRIMARY KEY (form_id, tag)
);

-- Таблица версий форм
CREATE TABLE form_version (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES form(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    config JSONB NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    UNIQUE (form_id, version),
    CONSTRAINT valid_config CHECK (validate_form_config(config))
);

-- Таблица для хранения данных форм
CREATE TABLE form_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    form_id UUID REFERENCES form(id) ON DELETE CASCADE,
    version INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(255) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (form_id, version) REFERENCES form_version(form_id, version)
);

-- Индексы
CREATE INDEX idx_form_category ON form(category);
CREATE INDEX idx_form_status ON form(status);
CREATE INDEX idx_form_version_form_id ON form_version(form_id);
CREATE INDEX idx_form_data_form_id ON form_data(form_id);
CREATE INDEX idx_form_tag_tag ON form_tag(tag);

-- Триггер для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_form_updated_at
    BEFORE UPDATE ON form
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_form_data_updated_at
    BEFORE UPDATE ON form_data
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Комментарии к таблицам
COMMENT ON TABLE form IS 'Основная таблица форм';
COMMENT ON TABLE form_version IS 'Версии форм с их конфигурацией';
COMMENT ON TABLE form_data IS 'Данные, собранные через формы';
COMMENT ON TABLE form_tag IS 'Теги для категоризации форм';

-- Комментарии к колонкам
COMMENT ON COLUMN form.id IS 'Уникальный идентификатор формы';
COMMENT ON COLUMN form.name IS 'Название формы';
COMMENT ON COLUMN form.description IS 'Описание формы';
COMMENT ON COLUMN form.category IS 'Категория формы';
COMMENT ON COLUMN form.status IS 'Текущий статус формы';
COMMENT ON COLUMN form.current_version IS 'Текущая версия формы';

COMMENT ON COLUMN form_version.config IS 'JSON конфигурация формы, включая поля и макет';
COMMENT ON COLUMN form_data.data IS 'JSON данные, собранные через форму'; 
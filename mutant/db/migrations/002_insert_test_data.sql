-- Вставка тестовых форм
INSERT INTO form (id, name, description, category, status, current_version, created_by, updated_by) VALUES
    ('11111111-1111-1111-1111-111111111111', 'Анкета клиента', 'Базовая информация о клиенте', 'customer', 'published', 2, 'system', 'system'),
    ('22222222-2222-2222-2222-222222222222', 'Заказ товара', 'Форма оформления заказа', 'order', 'published', 1, 'system', 'system'),
    ('33333333-3333-3333-3333-333333333333', 'Карточка сотрудника', 'Информация о сотруднике', 'employee', 'draft', 1, 'system', 'system');

-- Добавление тегов к формам
INSERT INTO form_tag (form_id, tag) VALUES
    ('11111111-1111-1111-1111-111111111111', 'crm'),
    ('11111111-1111-1111-1111-111111111111', 'client'),
    ('22222222-2222-2222-2222-222222222222', 'sales'),
    ('33333333-3333-3333-3333-333333333333', 'hr');

-- Вставка версий форм
INSERT INTO form_version (id, form_id, version, config, comment, created_by) VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 
     '11111111-1111-1111-1111-111111111111', 
     1,
     '{
        "layout": {"type": "stack"},
        "fields": [
            {"type": "text", "name": "fullName", "label": "ФИО"},
            {"type": "text", "name": "email", "label": "Email"},
            {"type": "text", "name": "phone", "label": "Телефон"}
        ]
     }',
     'Начальная версия',
     'system'),
    
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 
     '11111111-1111-1111-1111-111111111111', 
     2,
     '{
        "layout": {"type": "grid"},
        "fields": [
            {"type": "text", "name": "fullName", "label": "ФИО"},
            {"type": "text", "name": "email", "label": "Email"},
            {"type": "text", "name": "phone", "label": "Телефон"},
            {"type": "select", "name": "category", "label": "Категория клиента"}
        ]
     }',
     'Добавлена категория клиента',
     'system'),
    
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', 
     '22222222-2222-2222-2222-222222222222', 
     1,
     '{
        "layout": {"type": "columns"},
        "fields": [
            {"type": "dynamic-select", "name": "product", "label": "Товар"},
            {"type": "number", "name": "quantity", "label": "Количество"},
            {"type": "text", "name": "address", "label": "Адрес доставки"}
        ]
     }',
     'Базовая форма заказа',
     'system'),
    
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', 
     '33333333-3333-3333-3333-333333333333', 
     1,
     '{
        "layout": {"type": "stack"},
        "fields": [
            {"type": "text", "name": "fullName", "label": "ФИО"},
            {"type": "text", "name": "position", "label": "Должность"},
            {"type": "switch", "name": "isRemote", "label": "Удаленная работа"}
        ]
     }',
     'Черновик формы сотрудника',
     'system');

-- Вставка тестовых данных форм
INSERT INTO form_data (id, form_id, version, data, created_by, updated_by) VALUES
    ('11111111-aaaa-1111-aaaa-111111111111',
     '11111111-1111-1111-1111-111111111111',
     2,
     '{
        "fullName": "Иванов Иван Иванович",
        "email": "ivanov@example.com",
        "phone": "+7 (999) 123-45-67",
        "category": "vip"
     }',
     'system',
     'system'),
    
    ('22222222-aaaa-2222-aaaa-222222222222',
     '22222222-2222-2222-2222-222222222222',
     1,
     '{
        "product": "Ноутбук",
        "quantity": 1,
        "address": "г. Москва, ул. Примерная, д. 1"
     }',
     'system',
     'system'),
    
    ('22222222-bbbb-2222-bbbb-222222222222',
     '22222222-2222-2222-2222-222222222222',
     1,
     '{
        "product": "Смартфон",
        "quantity": 2,
        "address": "г. Санкт-Петербург, пр. Тестовый, д. 2"
     }',
     'system',
     'system'); 
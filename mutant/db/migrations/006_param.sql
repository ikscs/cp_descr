-- create table params
DROP TABLE IF EXISTS pcnt.param;
CREATE TABLE IF NOT EXISTS pcnt.param (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    group_name TEXT NOT NULL,
    datatype VARCHAR(50) NOT NULL,
    view_order INTEGER NOT NULL DEFAULT 0,
    eu TEXT DEFAULT NULL,
    display_label TEXT NOT NULL, 
    display_type TEXT NOT NULL DEFAULT 'text', -- e.g., 'text', 'number', 'select', 'checkbox', 'radio', etc.
    enum_values TEXT DEFAULT NULL, -- commaseparated values for dropdowns
    description TEXT,
    value jsonb NOT NULL, -- example: {"name": "value"}
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
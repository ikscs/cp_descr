CREATE TABLE host_container_status (
    id SERIAL PRIMARY KEY,
    host_name TEXT NOT NULL,
    container_name TEXT NOT NULL,
    status TEXT NOT NULL, -- Например: 'running', 'stopped', 'exited'
    collected_at TIMESTAMPTZ DEFAULT NOW()
    
    -- Индексы для быстрого поиска
--     INDEX idx_hcs_host_name (host_name),
--     INDEX idx_hcs_container_name (container_name),
--     INDEX idx_hcs_collected_at (collected_at)
);

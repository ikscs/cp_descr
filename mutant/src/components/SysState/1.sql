CREATE TABLE host_disk_usage (
    id SERIAL PRIMARY KEY,
    host_name TEXT NOT NULL,
    disk_path TEXT NOT NULL,
    total_size_gb NUMERIC(10, 2) NOT NULL,
    free_space_gb NUMERIC(10, 2) NOT NULL,
    collected_at TIMESTAMPTZ DEFAULT NOW()
    
    -- Индексы для быстрого поиска
--     INDEX idx_hdu_host_name (host_name),
--     INDEX idx_hdu_collected_at (collected_at)
);
-- Update music_items and tech_items tables to use status instead of date
-- This matches the UI which shows status dropdowns (In Progress/Complete)

-- Drop the existing tables and recreate with new schema
DROP TABLE IF EXISTS music_items CASCADE;
DROP TABLE IF EXISTS tech_items CASCADE;

-- Recreate music_items table with status field
CREATE TABLE music_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('progress', 'complete')),
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate tech_items table with status field
CREATE TABLE tech_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('progress', 'complete')),
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recreate indexes
CREATE INDEX idx_music_items_report ON music_items(report_id);
CREATE INDEX idx_tech_items_report ON tech_items(report_id);

-- Recreate triggers for updated_at
CREATE TRIGGER update_music_items_updated_at BEFORE UPDATE ON music_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_items_updated_at BEFORE UPDATE ON tech_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE music_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_items ENABLE ROW LEVEL SECURITY;

-- Since we're not using authentication, allow public access
CREATE POLICY "Allow all operations on music items" ON music_items
    FOR ALL USING (true)
    WITH CHECK (true);

CREATE POLICY "Allow all operations on tech items" ON tech_items
    FOR ALL USING (true)
    WITH CHECK (true);
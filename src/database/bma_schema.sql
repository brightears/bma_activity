-- BMA Activity Report Database Schema

-- Drop existing tables if they exist
DROP TABLE IF EXISTS tech_items CASCADE;
DROP TABLE IF EXISTS music_items CASCADE;
DROP TABLE IF EXISTS sales_items CASCADE;
DROP TABLE IF EXISTS challenges CASCADE;
DROP TABLE IF EXISTS priorities CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_number, year, created_by)
);

-- Create sales_items table
CREATE TABLE sales_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Existing', 'Renewal')),
    description TEXT NOT NULL,
    zones VARCHAR(255),
    yearly_value DECIMAL(12, 2),
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create music_items table
CREATE TABLE music_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tech_items table
CREATE TABLE tech_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create challenges table
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create priorities table
CREATE TABLE priorities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_reports_week_year ON reports(week_number, year);
CREATE INDEX idx_reports_created_by ON reports(created_by);
CREATE INDEX idx_sales_items_report ON sales_items(report_id);
CREATE INDEX idx_music_items_report ON music_items(report_id);
CREATE INDEX idx_tech_items_report ON tech_items(report_id);
CREATE INDEX idx_challenges_report ON challenges(report_id);
CREATE INDEX idx_priorities_report ON priorities(report_id);

-- Create update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_items_updated_at BEFORE UPDATE ON sales_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_music_items_updated_at BEFORE UPDATE ON music_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tech_items_updated_at BEFORE UPDATE ON tech_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON challenges
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priorities_updated_at BEFORE UPDATE ON priorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for report summary
CREATE OR REPLACE VIEW report_summary AS
SELECT 
    r.id,
    r.week_number,
    r.year,
    r.created_at,
    u.full_name as created_by_name,
    u.email as created_by_email,
    COUNT(DISTINCT s.id) as sales_count,
    COUNT(DISTINCT m.id) as music_count,
    COUNT(DISTINCT t.id) as tech_count,
    COUNT(DISTINCT c.id) as challenges_count,
    COUNT(DISTINCT p.id) as priorities_count,
    COALESCE(SUM(s.yearly_value), 0) as total_yearly_value
FROM reports r
LEFT JOIN users u ON r.created_by = u.id
LEFT JOIN sales_items s ON r.id = s.report_id
LEFT JOIN music_items m ON r.id = m.report_id
LEFT JOIN tech_items t ON r.id = t.report_id
LEFT JOIN challenges c ON r.id = c.report_id
LEFT JOIN priorities p ON r.id = p.report_id
GROUP BY r.id, r.week_number, r.year, r.created_at, u.full_name, u.email;

-- Insert a default admin user (password: admin123)
-- Note: This is bcrypt hash for 'admin123' - change this in production!
INSERT INTO users (username, email, password_hash, full_name, role) VALUES
    ('admin', 'admin@bma.com', '$2a$10$zKJSvl3u9dLlFOyLZdvJxOG7C3xUqKnr1iAJGXGK6xR.dY5JqKKxu', 'Admin User', 'admin');
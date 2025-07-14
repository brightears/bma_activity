-- BMA Activity Report Database Schema for Supabase
-- This schema is optimized for Supabase's PostgreSQL database

-- Enable UUID extension for Supabase Auth integration
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table that integrates with Supabase Auth
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create reports table
CREATE TABLE reports (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 53),
    year INTEGER NOT NULL CHECK (year >= 2000 AND year <= 2100),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(week_number, year, created_by)
);

-- Create sales_items table
CREATE TABLE sales_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('New', 'Existing', 'Renewal')),
    region VARCHAR(10) NOT NULL CHECK (region IN ('INT', 'TH')),
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
    date DATE NOT NULL,
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create tech_items table
CREATE TABLE tech_items (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    date DATE NOT NULL,
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
CREATE INDEX idx_sales_items_date ON sales_items(date);
CREATE INDEX idx_music_items_report ON music_items(report_id);
CREATE INDEX idx_music_items_date ON music_items(date);
CREATE INDEX idx_tech_items_report ON tech_items(report_id);
CREATE INDEX idx_tech_items_date ON tech_items(date);
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

-- Create a view for report summary with MRR calculations
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
    COALESCE(SUM(s.yearly_value), 0) as total_yearly_value,
    COALESCE(SUM(s.yearly_value) / 12, 0) as total_mrr,
    COALESCE(SUM(CASE WHEN s.region = 'INT' THEN s.yearly_value END), 0) as int_yearly_value,
    COALESCE(SUM(CASE WHEN s.region = 'TH' THEN s.yearly_value END), 0) as th_yearly_value,
    COALESCE(SUM(CASE WHEN s.region = 'INT' THEN s.yearly_value END) / 12, 0) as int_mrr,
    COALESCE(SUM(CASE WHEN s.region = 'TH' THEN s.yearly_value END) / 12, 0) as th_mrr
FROM reports r
LEFT JOIN users u ON r.created_by = u.id
LEFT JOIN sales_items s ON r.id = s.report_id
LEFT JOIN music_items m ON r.id = m.report_id
LEFT JOIN tech_items t ON r.id = t.report_id
LEFT JOIN challenges c ON r.id = c.report_id
LEFT JOIN priorities p ON r.id = p.report_id
GROUP BY r.id, r.week_number, r.year, r.created_at, u.full_name, u.email;

-- Row Level Security (RLS) Policies
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE music_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE priorities ENABLE ROW LEVEL SECURITY;

-- Users can read all users but only update their own profile
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = auth_id);

-- Reports: Users can CRUD their own reports, admins can see all
CREATE POLICY "Users can create own reports" ON reports
    FOR INSERT WITH CHECK (created_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can view own reports" ON reports
    FOR SELECT USING (
        created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        OR 
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can update own reports" ON reports
    FOR UPDATE USING (created_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own reports" ON reports
    FOR DELETE USING (created_by = (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Apply similar policies for all item tables
-- Sales items
CREATE POLICY "Users can manage sales items for own reports" ON sales_items
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Music items
CREATE POLICY "Users can manage music items for own reports" ON music_items
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Tech items
CREATE POLICY "Users can manage tech items for own reports" ON tech_items
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Challenges
CREATE POLICY "Users can manage challenges for own reports" ON challenges
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Priorities
CREATE POLICY "Users can manage priorities for own reports" ON priorities
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (auth_id, username, email, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();
-- BMA Activity Report Database Schema

-- Create database (run this separately if needed)
-- CREATE DATABASE bma_activity_report;

-- Drop existing tables if they exist
DROP TABLE IF EXISTS activity_participants CASCADE;
DROP TABLE IF EXISTS activities CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS activity_types CASCADE;
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

-- Create activity types table
CREATE TABLE activity_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7), -- For UI display (hex color)
    icon VARCHAR(50), -- Icon name for UI
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create participants table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    organization VARCHAR(255),
    position VARCHAR(100),
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create activities table
CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    activity_type_id INTEGER REFERENCES activity_types(id),
    location VARCHAR(255),
    start_date DATE NOT NULL,
    end_date DATE,
    start_time TIME,
    end_time TIME,
    duration_hours DECIMAL(5,2),
    status VARCHAR(50) DEFAULT 'planned', -- planned, ongoing, completed, cancelled
    notes TEXT,
    created_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create junction table for activity participants (many-to-many)
CREATE TABLE activity_participants (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER REFERENCES activities(id) ON DELETE CASCADE,
    participant_id INTEGER REFERENCES participants(id) ON DELETE CASCADE,
    role VARCHAR(100), -- speaker, attendee, organizer, etc.
    attendance_status VARCHAR(50) DEFAULT 'confirmed', -- confirmed, tentative, declined, no-show
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(activity_id, participant_id)
);

-- Create indexes for better performance
CREATE INDEX idx_activities_start_date ON activities(start_date);
CREATE INDEX idx_activities_activity_type ON activities(activity_type_id);
CREATE INDEX idx_activities_status ON activities(status);
CREATE INDEX idx_activities_created_by ON activities(created_by);
CREATE INDEX idx_participants_email ON participants(email);
CREATE INDEX idx_participants_name ON participants(last_name, first_name);
CREATE INDEX idx_activity_participants_activity ON activity_participants(activity_id);
CREATE INDEX idx_activity_participants_participant ON activity_participants(participant_id);

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

CREATE TRIGGER update_activity_types_updated_at BEFORE UPDATE ON activity_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_participants_updated_at BEFORE UPDATE ON participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some default activity types
INSERT INTO activity_types (name, description, color, icon) VALUES
    ('Meeting', 'Regular meetings and discussions', '#3B82F6', 'users'),
    ('Training', 'Training sessions and workshops', '#10B981', 'graduation-cap'),
    ('Conference', 'Conferences and large gatherings', '#8B5CF6', 'microphone'),
    ('Webinar', 'Online webinars and virtual events', '#F59E0B', 'video'),
    ('Workshop', 'Hands-on workshops and practical sessions', '#EF4444', 'tools'),
    ('Consultation', 'One-on-one or small group consultations', '#06B6D4', 'comments');

-- Create views for common queries
CREATE OR REPLACE VIEW activity_summary AS
SELECT 
    a.id,
    a.title,
    a.description,
    a.start_date,
    a.end_date,
    a.location,
    a.status,
    at.name as activity_type,
    at.color as activity_color,
    u.full_name as created_by_name,
    COUNT(DISTINCT ap.participant_id) as participant_count
FROM activities a
LEFT JOIN activity_types at ON a.activity_type_id = at.id
LEFT JOIN users u ON a.created_by = u.id
LEFT JOIN activity_participants ap ON a.id = ap.activity_id
GROUP BY a.id, a.title, a.description, a.start_date, a.end_date, 
         a.location, a.status, at.name, at.color, u.full_name;

-- Grant permissions (adjust as needed)
-- GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO your_db_user;
-- GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO your_db_user;
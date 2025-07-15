-- Simple table structure for BMA Activity Report
-- This replaces all the complex multi-table structure with a single JSON document approach

-- Drop existing tables (if you want to clean up - be careful with existing data!)
-- DROP TABLE IF EXISTS sales_items CASCADE;
-- DROP TABLE IF EXISTS sales_activities CASCADE;
-- DROP TABLE IF EXISTS music_items CASCADE;
-- DROP TABLE IF EXISTS tech_items CASCADE;
-- DROP TABLE IF EXISTS challenges CASCADE;
-- DROP TABLE IF EXISTS priorities CASCADE;
-- DROP TABLE IF EXISTS reports CASCADE;

-- Create the new simple structure
CREATE TABLE IF NOT EXISTS form_states (
    id SERIAL PRIMARY KEY,
    week_number INTEGER NOT NULL,
    year INTEGER NOT NULL,
    form_data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(week_number, year)
);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_form_states_week_year ON form_states(week_number, year);

-- Enable Row Level Security (optional, but good practice)
ALTER TABLE form_states ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows anyone to read and write (for internal use)
CREATE POLICY "Allow public access" ON form_states
    FOR ALL 
    TO public 
    USING (true)
    WITH CHECK (true);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to call the function
CREATE TRIGGER update_form_states_updated_at 
    BEFORE UPDATE ON form_states 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
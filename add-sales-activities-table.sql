-- Add sales_activities table to the existing schema
-- This table stores sales activity updates (In Progress/Complete status)

CREATE TABLE sales_activities (
    id SERIAL PRIMARY KEY,
    report_id INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL CHECK (status IN ('progress', 'complete')),
    description TEXT NOT NULL,
    team_member VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for better performance
CREATE INDEX idx_sales_activities_report ON sales_activities(report_id);

-- Create trigger for updated_at
CREATE TRIGGER update_sales_activities_updated_at BEFORE UPDATE ON sales_activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE sales_activities ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can manage sales activities for own reports
CREATE POLICY "Users can manage sales activities for own reports" ON sales_activities
    FOR ALL USING (
        report_id IN (
            SELECT id FROM reports WHERE created_by = (SELECT id FROM users WHERE auth_id = auth.uid())
        )
        OR
        EXISTS (SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'admin')
    );

-- Since we're not using authentication, we need to allow public access
-- This policy allows all operations without authentication
DROP POLICY IF EXISTS "Users can manage sales activities for own reports" ON sales_activities;
CREATE POLICY "Allow all operations on sales activities" ON sales_activities
    FOR ALL USING (true)
    WITH CHECK (true);
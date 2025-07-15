# Setting up the Simple Table Structure in Supabase

The "Failed to fetch" error is happening because the new `form_states` table doesn't exist in your Supabase database yet.

## Steps to Create the Table:

1. Go to your Supabase dashboard: https://app.supabase.com
2. Select your project (dzxytqfpxvmkuwrqncbq)
3. Click on "SQL Editor" in the left sidebar
4. Copy and paste this SQL:

```sql
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

-- Enable Row Level Security
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
```

5. Click "Run" to execute the SQL
6. You should see a success message
7. Go back to the website and try saving again

## Verify the Table Was Created:
- In Supabase, go to "Table Editor" in the left sidebar
- You should see a new table called `form_states`
- It should have columns: id, week_number, year, form_data, updated_at

Once the table is created, the save functionality should work immediately.
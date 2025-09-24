-- Create the trips table for the Trip Logger application
-- This script should be run in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS trips (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('trip', 'fuel')),
    km_reading INTEGER NOT NULL,
    distance INTEGER DEFAULT 0,
    amount_received DECIMAL(10,2) DEFAULT 0,
    fuel_liters DECIMAL(8,2) DEFAULT 0,
    fuel_cost DECIMAL(10,2) DEFAULT 0,
    profit DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips(date);
CREATE INDEX IF NOT EXISTS idx_trips_type ON trips(type);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_trips_updated_at
    BEFORE UPDATE ON trips
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Set up Row Level Security (RLS) policies
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own data (if you want to add user authentication later)
-- For now, allow all operations (this should be restricted in production)
CREATE POLICY "Allow all operations" ON trips
    FOR ALL USING (true);

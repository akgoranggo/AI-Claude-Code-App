-- Database initialization script
-- This script runs when the PostgreSQL container starts for the first time

-- Create the ULID generation function
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ULID generation function
CREATE OR REPLACE FUNCTION generate_ulid()
RETURNS varchar AS $$
DECLARE
    timestamp_part varchar(10);
    random_part varchar(16);
    unix_time bigint;
    crockford_chars varchar(32) := '0123456789ABCDEFGHJKMNPQRSTVWXYZ';
BEGIN
    -- Get current Unix timestamp in milliseconds
    unix_time := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::bigint;

    -- Encode timestamp (first 10 characters)
    timestamp_part := '';
    FOR i IN REVERSE 9..0 LOOP
        timestamp_part := timestamp_part || substr(crockford_chars, ((unix_time >> (i * 5)) & 31) + 1, 1);
    END LOOP;

    -- Generate random part (last 16 characters)
    random_part := '';
    FOR i IN 1..16 LOOP
        random_part := random_part || substr(crockford_chars, (floor(random() * 32)::int) + 1, 1);
    END LOOP;

    RETURN timestamp_part || random_part;
END;
$$ LANGUAGE plpgsql VOLATILE;

-- Create the default application schema
CREATE SCHEMA IF NOT EXISTS app;

-- Grant permissions
GRANT ALL ON SCHEMA app TO postgres;
GRANT USAGE ON SCHEMA app TO postgres;

-- Set default search path
ALTER DATABASE webapp SET search_path TO app, public;

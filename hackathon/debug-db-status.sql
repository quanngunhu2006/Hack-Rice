-- DEBUG: Check your current database schema status
-- Run this FIRST to see what data types you're currently using

-- Check profiles table structure
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- Check if tables exist and show their structure
SELECT
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN ('profiles', 'proposals', 'votes', 'road_reports');

-- Check current foreign key constraints
SELECT
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM
    information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE
    tc.constraint_type = 'FOREIGN KEY'
    AND tc.table_name IN ('proposals', 'votes', 'road_reports');

-- If profiles.id shows "uuid" instead of "text", you need to run the migration!

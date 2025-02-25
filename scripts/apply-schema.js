import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Get Supabase credentials from environment variables
const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: Supabase URL or service role key not found in environment variables');
  console.error('Please add SUPABASE_SERVICE_ROLE_KEY to your .env file');
  console.error('You can find this key in your Supabase dashboard under Project Settings > API');
  process.exit(1);
}

// Create Supabase client with service role key for admin privileges
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applySchema() {
  try {
    // Read the schema.sql file
    const schemaPath = path.resolve(__dirname, '../supabase/schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('Error: schema.sql file not found at', schemaPath);
      process.exit(1);
    }
    
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Applying schema to Supabase...');
    
    // Execute the SQL using the Supabase SQL API
    const { error } = await supabase.rpc('exec_sql', { sql: schemaSQL });
    
    if (error) {
      console.error('Error applying schema:', error);
      console.error('Note: You need to create a stored procedure named "exec_sql" in your Supabase database.');
      console.error('Please run the following SQL in the Supabase SQL editor:');
      console.error(`
CREATE OR REPLACE FUNCTION exec_sql(sql text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  EXECUTE sql;
END;
$$;
      `);
      process.exit(1);
    }
    
    console.log('Schema applied successfully!');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

applySchema(); 
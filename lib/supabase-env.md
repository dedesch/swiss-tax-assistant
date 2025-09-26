# Supabase Environment Variables Setup

## Required Environment Variables

Add these to your Vercel project or local `.env.local` file:

```bash
# Supabase Configuration (Server-side only - DO NOT use NEXT_PUBLIC_*)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Keep existing variables
JWT_SECRET=your-jwt-secret-here
OPENAI_API_KEY=your-openai-key-here
```

## Important Security Notes

- **Never** use `NEXT_PUBLIC_` prefix for Supabase keys in server-side operations
- Use the **Service Role Key** (not anon key) for server-side database operations
- The Service Role Key bypasses Row Level Security - handle authorization in your application code

## Database Schema

Create these tables in your Supabase Dashboard > SQL Editor:

### Users Table
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tax Calculations Table
```sql
CREATE TABLE tax_calculations (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    data JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, tax_year)
);
```

## Row Level Security (RLS)

Enable RLS and add these policies in Supabase Dashboard:

### Users Table Policies
```sql
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own record
CREATE POLICY "Users can view own profile" ON users
    FOR SELECT USING (auth.uid()::text = id::text);
```

### Tax Calculations Table Policies
```sql
ALTER TABLE tax_calculations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own calculations
CREATE POLICY "Users can view own calculations" ON tax_calculations
    FOR ALL USING (auth.uid()::text = user_id::text);
```

## How to Get Supabase Keys

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In your project dashboard, go to Settings > API
3. Copy the Project URL (NEXT_PUBLIC_SUPABASE_URL)
4. Copy the anon/public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
5. Add these to your Vercel environment variables
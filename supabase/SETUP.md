# Supabase Setup Guide for Nucleus

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Choose a database password and region
4. Wait for the project to be set up

## 2. Database Setup

### Option A: Using Supabase Dashboard
1. Go to your project dashboard
2. Navigate to "SQL Editor"
3. Copy and paste the contents of `supabase/schema.sql`
4. Run the query to create all tables
5. Copy and paste the contents of `supabase/rls-policies.sql`
6. Run the query to set up Row Level Security

### Option B: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project
supabase link --project-ref YOUR_PROJECT_ID

# Run migrations
supabase db push
```

## 3. Authentication Settings

1. In your Supabase dashboard, go to "Authentication" > "Settings"
2. Configure the following:
   - **Site URL**: `http://localhost:3000` (for development)
   - **Redirect URLs**: `http://localhost:3000/dashboard`
   - **Email Templates**: Customize as needed

## 4. Environment Variables

1. In your Supabase dashboard, go to "Settings" > "API"
2. Copy your project URL and anon key
3. Create `.env.local` in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 5. Security Notes

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- The anon key is safe to use in client-side code
- Service role key should only be used server-side (not included in this setup)

## 6. First User Setup

Since you'll be the only user:

1. Start your development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/login`
3. Create your account using the signup form
4. Check your email for verification (if email confirmation is enabled)
5. You'll automatically be redirected to the dashboard

## 7. Database Administration

You can manage your data through:
- **Supabase Dashboard**: Web interface for viewing and editing data
- **Table Editor**: Direct table editing in the dashboard
- **SQL Editor**: Run custom queries
- **API**: Use the auto-generated REST API

## Troubleshooting

### Common Issues:

1. **Authentication not working**: Check your environment variables
2. **RLS errors**: Ensure policies are applied correctly
3. **CORS issues**: Add your domain to allowed origins in Supabase settings

### Useful SQL Queries:

```sql
-- Check if RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- View all policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Reset user data (use carefully!)
DELETE FROM tasks WHERE user_id = 'user-id-here';
DELETE FROM projects WHERE user_id = 'user-id-here';
```
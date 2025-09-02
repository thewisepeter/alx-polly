# Supabase Setup for Polly Polling App

## Database Schema

The Polly app uses Supabase for authentication and database storage. The database schema includes tables for polls, poll options, votes, and poll shares.

### Tables

1. **polls** - Stores poll information
   - `id`: UUID (primary key)
   - `title`: Text (required)
   - `description`: Text (optional)
   - `created_by`: UUID (references auth.users)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp
   - `is_public`: Boolean (default: true)
   - `allow_anonymous_votes`: Boolean (default: true)
   - `end_date`: Timestamp (optional)

2. **poll_options** - Stores options for each poll
   - `id`: UUID (primary key)
   - `poll_id`: UUID (references polls)
   - `option_text`: Text (required)
   - `created_at`: Timestamp
   - `updated_at`: Timestamp

3. **votes** - Stores votes cast by users
   - `id`: UUID (primary key)
   - `poll_id`: UUID (references polls)
   - `option_id`: UUID (references poll_options)
   - `user_id`: UUID (references auth.users, nullable)
   - `anonymous_user_id`: Text (nullable)
   - `created_at`: Timestamp
   - `ip_address`: Text (optional)

4. **poll_shares** - Stores share links and QR codes
   - `id`: UUID (primary key)
   - `poll_id`: UUID (references polls)
   - `created_by`: UUID (references auth.users, nullable)
   - `share_code`: Text (unique)
   - `created_at`: Timestamp
   - `expires_at`: Timestamp (optional)

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Note your project URL and anon/public key

### 2. Set Environment Variables

Create a `.env.local` file in the root of your project with the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Run Migrations

You can apply the database schema in one of two ways:

#### Option 1: Using the Supabase CLI

1. Install the Supabase CLI: `npm install -g supabase`
2. Login to Supabase: `supabase login`
3. Link your project: `supabase link --project-ref your-project-ref`
4. Apply migrations: `supabase db push`

#### Option 2: Using the Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Copy the contents of `supabase/migrations/20240501000000_create_polls_schema.sql`
4. Paste into the SQL Editor and run the query

### 4. Set Up Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Configure your site URL (e.g., `http://localhost:3000` for development)
3. Enable Email/Password sign-in method
4. Optionally, configure other providers (Google, GitHub, etc.)

### 5. Set Up Row Level Security (RLS) Policies

The migration script includes RLS policies, but verify they are correctly applied:

1. Go to your Supabase dashboard > Table Editor
2. For each table, check the RLS policies under "Policies"
3. Ensure that the policies match those in the migration script

## Using the Database

The project includes TypeScript types and database access functions:

- `src/lib/types/database.types.ts` - TypeScript types for the database schema
- `src/lib/db/polls.ts` - Functions for interacting with polls and votes

Example usage:

```typescript
import { createPoll, getPollById, voteOnPoll } from '@/lib/db/polls';

// Create a new poll
const poll = await createPoll(
  'Favorite Programming Language',
  'Vote for your favorite programming language',
  ['JavaScript', 'TypeScript', 'Python', 'Rust', 'Go'],
  true, // isPublic
  true, // allowAnonymousVotes
  null  // endDate
);

// Get a poll by ID
const pollData = await getPollById(poll.id);

// Vote on a poll
await voteOnPoll(poll.id, pollData.options[0].id);
```

## Realtime Updates

Supabase provides realtime functionality that can be used to update poll results in real-time:

```typescript
import { supabase } from '@/lib/supabase';

// Subscribe to changes on the votes table for a specific poll
const subscription = supabase
  .channel(`poll_${pollId}`)
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'votes',
      filter: `poll_id=eq.${pollId}`,
    },
    (payload) => {
      // Update UI with new vote data
      console.log('Vote change received!', payload);
      // Refresh poll results
      refreshPollResults();
    }
  )
  .subscribe();

// Don't forget to unsubscribe when component unmounts
return () => {
  supabase.removeChannel(subscription);
};
```
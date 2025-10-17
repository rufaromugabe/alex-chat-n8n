# Database Schema Upgrade Notes

## Overview

The application has been upgraded to use domain-specific PostgreSQL schemas with auto-save functionality. Each domain (general, zesa, praz, etc.) has its own schema containing three tables. Messages are automatically saved to the database by webhooks, and user sessions are tracked with persistent user IDs stored in cookies.

## New Database Schema

### Domain-Specific Schemas

Each domain has its own PostgreSQL schema with three tables:

- `{domain}.chats` - Chat messages
- `{domain}.threads` - Thread/session metadata
- `{domain}.threads_user_memory` - User-specific memory

**Examples:**

- General domain: `general.chats`, `general.threads`, `general.threads_user_memory`
- ZESA domain: `zesa.chats`, `zesa.threads`, `zesa.threads_user_memory`
- PRAZ domain: `praz.chats`, `praz.threads`, `praz.threads_user_memory`

### Tables

#### 1. `{domain}.chats`

Stores all chat messages with auto-save from webhooks.

```sql
CREATE SCHEMA IF NOT EXISTS {domain};

CREATE TABLE IF NOT EXISTS {domain}.chats (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  message JSONB NOT NULL
);
```

**Message JSONB Structure:**

```json
{
  "type": "user" | "ai",
  "content": "message text",
  "tool_calls": [],
  "additional_kwargs": {},
  "response_metadata": {},
  "invalid_tool_calls": []
}
```

#### 2. `{domain}.threads`

Tracks conversation threads/sessions with metadata.

```sql
CREATE TABLE IF NOT EXISTS {domain}.threads (
  id VARCHAR(255) PRIMARY KEY,
  user_id VARCHAR(255),
  title TEXT NOT NULL,
  last_message TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,
  working_memory JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### 3. `{domain}.threads_user_memory`

Stores user-specific working memory across all threads within a domain.

```sql
CREATE TABLE IF NOT EXISTS {domain}.threads_user_memory (
  user_id VARCHAR(255) PRIMARY KEY,
  working_memory JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Key Changes

### 1. User ID Management

- **New File**: `lib/user-manager.ts`
- User IDs are randomly generated once and stored in cookies
- Cookie name: `mutumwa_user_id`
- Expires in 10 years
- Automatically created on first visit

### 2. Auto-Save Architecture

- Messages are NO LONGER saved by the frontend
- Webhooks handle all message persistence to domain-specific `{domain}.chats` tables
- Frontend only displays messages and manages UI state

### 3. Webhook Integration

- User ID is now passed to webhooks via FormData
- Webhooks are responsible for:
  - Saving user messages to `{domain}.chats`
  - Saving AI responses to `{domain}.chats`
  - Updating thread metadata in `{domain}.threads`

### 4. Updated API Routes

#### `/api/sessions/[sessionId]/messages?domain={domain}` (GET)

- Fetches messages from domain-specific `{domain}.chats` table
- Requires `domain` query parameter (defaults to 'general')
- Returns messages in app format

#### `/api/threads?userId={userId}&domain={domain}` (GET, POST)

- GET: Fetch all threads for a user in a specific domain
- POST: Create or update a thread (requires domain in body)

#### `/api/threads/[threadId]?domain={domain}` (GET)

- Fetch a specific thread by ID from a specific domain

## Migration Steps

### For Webhook Developers

Your webhook must now:

1. **Accept user ID in request**:

```python
user_id = request.form.get('userId')
session_id = request.form.get('sessionId')
text = request.form.get('text')
target_language = request.form.get('targetLanguage')
```

2. **Determine the domain** (based on webhook URL or configuration):

```python
# Map webhook to domain
DOMAIN_MAP = {
    'zesa_webhook': 'zesa',
    'praz_webhook': 'praz',
    'general_webhook': 'general'
}
domain = DOMAIN_MAP.get(webhook_name, 'general')
```

3. **Save messages to domain-specific `{domain}.chats`**:

```python
# Save user message
cursor.execute(f"""
  INSERT INTO {domain}.chats (session_id, message)
  VALUES (%s, %s)
""", (session_id, json.dumps({
  'type': 'user',
  'content': text,
  'tool_calls': [],
  'additional_kwargs': {},
  'response_metadata': {},
  'invalid_tool_calls': []
})))

# Save AI response
cursor.execute(f"""
  INSERT INTO {domain}.chats (session_id, message)
  VALUES (%s, %s)
""", (session_id, json.dumps({
  'type': 'ai',
  'content': ai_response,
  'tool_calls': [],
  'additional_kwargs': {},
  'response_metadata': {},
  'invalid_tool_calls': []
})))
```

4. **Update thread metadata in domain-specific `{domain}.threads`**:

```python
cursor.execute(f"""
  INSERT INTO {domain}.threads (id, user_id, title, last_message, message_count, updated_at)
  VALUES (%s, %s, %s, %s, %s, NOW())
  ON CONFLICT (id) DO UPDATE SET
    last_message = EXCLUDED.last_message,
    message_count = {domain}.threads.message_count + 1,
    updated_at = NOW()
""", (session_id, user_id, title, text, 1))
```

**⚠️ SECURITY WARNING**: The examples above use f-strings for demonstration. In production, NEVER use string interpolation for the domain name without proper validation. Always validate the domain against a whitelist:

```python
ALLOWED_DOMAINS = ['general', 'zesa', 'praz']
if domain not in ALLOWED_DOMAINS:
    raise ValueError(f"Invalid domain: {domain}")
```

## Frontend Changes

### Updated Files

- `app/chat/[sessionId]/page.tsx` - Now passes userId to webhook
- `lib/user-manager.ts` - New file for user ID management
- `lib/database.ts` - Updated methods to accept domain parameter
- `app/api/sessions/[sessionId]/messages/route.ts` - Updated to use `{domain}.chats`
- `app/api/threads/route.ts` - Updated API for thread management with domain support
- `app/api/threads/[threadId]/route.ts` - Updated API for single thread with domain support

### Removed Functionality

- Frontend no longer saves messages to database
- Old `{domain}_chat_histories` tables are deprecated (now uses `{domain}.chats` with schema separation)

## Testing

1. **Test User ID Generation**:

   - Open browser dev tools → Application → Cookies
   - Check for `mutumwa_user_id` cookie
   - Verify it persists across page reloads

2. **Test Message Auto-Save**:

   - Send a message in the general domain
   - Check `general.chats` table for the message
   - Send a message in the zesa domain
   - Check `zesa.chats` table for the message
   - Verify both user and AI messages are saved

3. **Test Thread Tracking**:

   - Start a new conversation in a domain
   - Check `{domain}.threads` table for thread entry
   - Verify `message_count` increments with each message

4. **Test Domain Isolation**:
   - Verify messages in `zesa.chats` don't appear in `general.chats`
   - Verify threads are properly isolated per domain

## Rollback Plan

If issues arise, you can temporarily revert by:

1. Restoring the old API routes from git history
2. Re-enabling frontend message saving
3. Using the old `{domain}_chat_histories` tables

## Notes

- The old domain-specific tables (`general_chat_histories`, `zesa_chat_histories`, etc.) are deprecated
- Each domain now has its own PostgreSQL schema (e.g., `zesa`, `praz`, `general`)
- Within each schema, there are three tables: `chats`, `threads`, and `threads_user_memory`
- This provides better data isolation and organization per domain
- SQL injection protection: Always validate domain names against a whitelist before using in queries
- Consider using PostgreSQL's row-level security (RLS) for additional data protection

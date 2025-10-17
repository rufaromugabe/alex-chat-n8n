# Session Storage Migration: LocalStorage → Database

## Problem

The app was storing session/thread metadata in browser localStorage (cookies) instead of using the database `threads` table with `user_id` for proper multi-device session management.

## Solution

Frontend now **only reads and deletes** threads. The webhook handles all thread creation and updates automatically.

## Changes Made

### 1. **lib/session-manager.ts**

- **Removed**: `saveSession()` - webhook handles this
- **Removed**: `updateSessionWithMessage()` - webhook handles this
- **Removed**: `generateSessionTitle()` - webhook handles this
- **Removed**: localStorage-based session storage methods (`saveSessions`, `SESSIONS_STORAGE_KEY`)
- **Kept**: `getAllSessions()` - fetches threads from database via `/api/threads?userId=X&domain=Y`
- **Kept**: `deleteSession()` - deletes from database via DELETE `/api/threads/:id`
- **Kept**: `fetchSessionMessages()` - loads messages for a thread
- **Kept**: `getCurrentSessionId()` and `setCurrentSessionId()` - localStorage for UI state only

### 2. **app/contexts/AppContext.tsx**

- **Updated**: `useEffect` on mount fetches sessions from database using `UserManager.getUserId()`
- **Updated**: `refreshSessions()` is async and fetches from database
- **Updated**: `deleteSession()` is async and deletes from database
- **Added**: `updateActiveThreadInSidebar()` - updates sidebar in real-time without database fetch

### 3. **app/chat/[sessionId]/page.tsx**

- **Removed**: Call to `SessionManager.updateSessionWithMessage()`
- **Removed**: `refreshSessions()` import and call (not needed - webhook handles updates)
- **Added**: `updateActiveThreadInSidebar()` call when user sends first message (creates thread in sidebar)
- **Added**: `updateActiveThreadInSidebar()` call when assistant responds (updates last message in sidebar)
- Webhook automatically creates/updates threads in database

### 4. **components/sidebar.tsx**

- **Updated**: `handleDeleteSession()` is async to await database deletion

### 5. **app/api/threads/[threadId]/route.ts**

- **Added**: DELETE endpoint to remove threads from database

### 6. **lib/database.ts**

- **Added**: `deleteThread()` method to delete threads from `{domain}.threads` table

## How It Works Now

### Frontend Responsibilities:

1. **Load threads**: Fetch from `{domain}.threads` filtered by `user_id` (on app mount)
2. **Load messages**: Fetch messages for a specific thread
3. **Delete threads**: Remove thread when user requests (and refresh list)
4. **Track current session**: Use localStorage for UI state only

**Real-time Sidebar Updates**:

- When user sends **first message** in a new chat → thread appears in sidebar immediately with title
- When **assistant responds** → sidebar updates with last message in real-time
- No database fetch needed - updates happen from the active chat's webhook response
- Database is only fetched on app mount and after deletion

### Webhook Responsibilities:

1. **Create threads**: When first message is sent
2. **Update threads**: Update `last_message`, `message_count`, `updated_at` on each message
3. **Generate titles**: Create thread title from first message
4. **Save messages**: Store all messages in `{domain}.chats` table

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS general.threads (
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

## Migration Notes

- Old localStorage sessions will not be migrated automatically
- Users will see empty session list on first load after this update
- New sessions will be properly stored in database going forward
- Current session ID still uses localStorage for UI state (which tab is active)
- Frontend is now read-only for threads (except delete)

# User Profile Feature

## Overview

Added a profile icon in the header that displays user information including User ID and Working Memory from the database.

## Components Created

### 1. **components/profile-modal.tsx**

Modal component that displays:

- **User ID**: The unique identifier for the user
- **Working Memory**: JSON data from `{domain}.threads_user_memory` table

Features:

- Automatically formats JSON data for readability
- Handles arrays, objects, booleans, and strings
- Shows "Not set" for empty values
- Displays last updated timestamp
- Loading state with spinner
- Error handling

### 2. **app/api/user-memory/route.ts**

API endpoint to fetch user memory:

- **GET** `/api/user-memory?userId=X&domain=Y`
- Fetches from `{domain}.threads_user_memory` table
- Returns user memory data or null if not found

### 3. **app/layout.tsx**

Updated header to include:

- Profile icon button (User icon)
- Opens ProfileModal on click
- Passes current domain to modal

## Database Schema

```sql
CREATE TABLE IF NOT EXISTS general.threads_user_memory (
  user_id VARCHAR(255) PRIMARY KEY,
  working_memory JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Working Memory Format

The `working_memory` field is a flexible JSONB that can contain any user information. Example structure:

```json
{
  "name": "John Doe",
  "facts": ["Likes coffee", "Works remotely"],
  "goals": ["Learn AI", "Build projects"],
  "events": [],
  "location": "Harare, Zimbabwe",
  "projects": ["Chat app", "E-commerce site"],
  "interests": ["Technology", "Music"],
  "occupation": "Software Developer",
  "preferences": {
    "theme": "dark",
    "language": "en"
  }
}
```

## How It Works

1. **User clicks profile icon** → Opens modal
2. **Modal fetches data** → Calls `/api/user-memory?userId=X&domain=Y`
3. **API queries database** → `DatabaseManager.getUserMemory(domain, userId)`
4. **Data is formatted** → JSON is rendered in a readable format
5. **Display** → Shows user ID and all working memory fields

## Features

### Smart Formatting

- **Arrays**: Displayed as bullet lists
- **Objects**: Shown as formatted JSON
- **Booleans**: Displayed as "Yes" or "No"
- **Empty values**: Shown as "Not set" or "None"
- **Nested objects**: Pretty-printed JSON with syntax highlighting

### Domain-Specific

- Each domain (GENERAL, ZESA, PRAZ) has its own user memory
- Switching domains shows different user information
- Memory is stored per domain in separate schemas

### UI/UX

- Clean, dark-themed modal
- Scrollable for long content
- Responsive design
- Loading states
- Error handling
- Close on backdrop click or ESC key

## Usage

Users can view their profile by:

1. Clicking the User icon in the header (next to language picker)
2. Modal opens showing their information
3. Information is specific to the current domain
4. Close by clicking outside or the X button

## Integration with Webhook

The webhook can update user memory by calling:

```typescript
await DatabaseManager.updateUserMemory(domain, userId, workingMemory);
```

This allows the AI to learn about the user and store information across conversations.

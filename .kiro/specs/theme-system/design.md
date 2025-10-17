# Theme System Design Document

## Overview

This design document outlines the architecture for implementing a comprehensive dark/light theme system for the Mutumwa AI application. The system will replace hardcoded color values with a flexible, maintainable theme infrastructure based on CSS variables, React Context, and semantic color tokens. The design ensures smooth theme transitions, proper accessibility, and persistence of user preferences.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Application Root                        │
│                      (RootLayout)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              ThemeProvider                            │  │
│  │  - Manages theme state (dark/light)                   │  │
│  │  - Reads/writes localStorage                          │  │
│  │  - Detects system preference                          │  │
│  │  - Applies theme class to <html>                      │  │
│  │  - Prevents FOUC                                      │  │
│  │                                                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │         Existing Providers                   │    │  │
│  │  │  (AuthProvider, AppProvider, etc.)           │    │  │
│  │  │                                               │    │  │
│  │  │  ┌────────────────────────────────────┐      │    │  │
│  │  │  │      Application Components        │      │    │  │
│  │  │  │  - Header (with ThemeToggle)       │      │    │  │
│  │  │  │  - Sidebar                         │      │    │  │
│  │  │  │  - Chat Components                 │      │    │  │
│  │  │  │  - Landing Page                    │      │    │  │
│  │  │  │  - All other components            │      │    │  │
│  │  │  └────────────────────────────────────┘      │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   CSS Variables  │
                  │   (globals.css)  │
                  │  - Light theme   │
                  │  - Dark theme    │
                  └─────────────────┘
```

### Component Interaction Flow

```
User clicks ThemeToggle
        │
        ▼
ThemeContext.toggleTheme()
        │
        ├──> Update state (dark ↔ light)
        │
        ├──> Save to localStorage
        │
        ├──> Update <html> class
        │
        └──> Trigger re-render
                │
                ▼
        CSS variables apply
                │
                ▼
        All components update visually
```

## Components and Interfaces

### 1. ThemeContext and Provider

**File:** `app/contexts/ThemeContext.tsx`

**Purpose:** Centralized theme state management and persistence

**Interface:**

```typescript
type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}
```

**Key Responsibilities:**

- Initialize theme from localStorage or system preference
- Provide theme state to all components via Context
- Handle theme toggling
- Persist theme changes to localStorage
- Apply theme class to document root
- Prevent flash of unstyled content (FOUC)
- Synchronize theme across browser tabs using storage events

**Implementation Details:**

- Use `useEffect` with empty dependency array to initialize theme on mount
- Use `window.matchMedia('(prefers-color-scheme: dark)')` to detect system preference
- Apply theme class to `document.documentElement` (the `<html>` tag)
- Listen to `storage` events for cross-tab synchronization
- Use `localStorage.getItem/setItem` with try-catch for error handling

### 2. ThemeToggle Component

**File:** `components/theme-toggle.tsx`

**Purpose:** UI control for switching themes

**Interface:**

```typescript
interface ThemeToggleProps {
  className?: string;
}
```

**Visual Design:**

- Button with icon (Sun for light mode, Moon for dark mode)
- Smooth icon transition/rotation animation
- Tooltip showing "Switch to [opposite theme]"
- Accessible via keyboard (Tab, Enter, Space)
- Consistent with existing UI button styles
- Size: Similar to existing header buttons (User, Language, Domain pickers)

**States:**

- Default: Shows current theme icon
- Hover: Slight scale/glow effect
- Active: Pressed state
- Focus: Visible focus ring for accessibility

**Placement:**

- In the Header component, between DomainPicker and ProfileModal button
- Responsive sizing for mobile devices

### 3. CSS Variables System

**File:** `app/globals.css`

**Purpose:** Define all theme colors using CSS custom properties

**Color Token Structure:**

```css
:root {
  /* Background Colors */
  --bg-primary: ...; /* Main background */
  --bg-secondary: ...; /* Secondary surfaces */
  --bg-tertiary: ...; /* Tertiary surfaces */
  --bg-elevated: ...; /* Elevated surfaces (modals, dropdowns) */
  --bg-input: ...; /* Input backgrounds */

  /* Text Colors */
  --text-primary: ...; /* Primary text */
  --text-secondary: ...; /* Secondary text */
  --text-tertiary: ...; /* Tertiary/muted text */
  --text-inverse: ...; /* Text on colored backgrounds */

  /* Border Colors */
  --border-primary: ...; /* Primary borders */
  --border-secondary: ...; /* Secondary borders */
  --border-focus: ...; /* Focus state borders */

  /* Accent Colors */
  --accent-primary: ...; /* Primary accent (blue) */
  --accent-primary-hover: ...;
  --accent-secondary: ...; /* Secondary accent */

  /* Semantic Colors */
  --color-success: ...;
  --color-warning: ...;
  --color-error: ...;
  --color-info: ...;

  /* Shadows and Effects */
  --shadow-sm: ...;
  --shadow-md: ...;
  --shadow-lg: ...;
  --glow-primary: ...; /* Glow effects */

  /* Gradients */
  --gradient-bg: ...; /* Background gradients */
  --gradient-accent: ...; /* Accent gradients */
}

.dark {
  /* Override all variables for dark theme */
  --bg-primary: ...;
  /* ... etc */
}
```

**Transition Configuration:**

```css
* {
  transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out,
    border-color 0.2s ease-in-out;
}

@media (prefers-reduced-motion: reduce) {
  * {
    transition: none;
  }
}
```

## Data Models

### Theme Preference Storage

**Storage Key:** `mutumwa-theme`

**Storage Format:**

```typescript
type StoredTheme = "light" | "dark";
```

**Storage Location:** `localStorage`

**Fallback Strategy:**

1. Check localStorage for saved preference
2. If not found, check system preference via `prefers-color-scheme`
3. If system preference unavailable, default to 'dark'

### Theme State

```typescript
interface ThemeState {
  current: "light" | "dark";
  isSystemPreference: boolean;
  lastChanged: number; // timestamp
}
```

## Color Palettes

### Dark Theme (Current/Refined)

**Background Colors:**

- Primary: `hsl(222, 84%, 5%)` - Deep blue-black
- Secondary: `hsl(217, 33%, 17%)` - Dark slate
- Tertiary: `hsl(217, 33%, 12%)` - Darker slate
- Elevated: `hsl(217, 33%, 20%)` - Slightly lighter for modals

**Text Colors:**

- Primary: `hsl(210, 40%, 98%)` - Near white
- Secondary: `hsl(215, 20%, 65%)` - Light gray
- Tertiary: `hsl(215, 15%, 45%)` - Muted gray

**Accent Colors:**

- Primary: `hsl(217, 91%, 60%)` - Bright blue
- Primary Hover: `hsl(217, 91%, 55%)` - Slightly darker blue
- Glow: `rgba(96, 165, 250, 0.5)` - Blue glow

**Borders:**

- Primary: `rgba(255, 255, 255, 0.1)` - Subtle white
- Secondary: `rgba(255, 255, 255, 0.05)` - Very subtle

### Light Theme (New)

**Background Colors:**

- Primary: `hsl(0, 0%, 100%)` - Pure white
- Secondary: `hsl(210, 20%, 98%)` - Very light blue-gray
- Tertiary: `hsl(210, 20%, 95%)` - Light blue-gray
- Elevated: `hsl(0, 0%, 100%)` - White for modals

**Text Colors:**

- Primary: `hsl(222, 47%, 11%)` - Very dark blue-black
- Secondary: `hsl(215, 16%, 47%)` - Medium gray
- Tertiary: `hsl(215, 10%, 60%)` - Light gray

**Accent Colors:**

- Primary: `hsl(217, 91%, 50%)` - Rich blue
- Primary Hover: `hsl(217, 91%, 45%)` - Darker blue
- Glow: `rgba(59, 130, 246, 0.3)` - Blue glow (lighter)

**Borders:**

- Primary: `hsl(214, 32%, 91%)` - Light gray
- Secondary: `hsl(214, 32%, 95%)` - Very light gray

**Shadows:**

- Small: `0 1px 2px rgba(0, 0, 0, 0.05)`
- Medium: `0 4px 6px rgba(0, 0, 0, 0.07)`
- Large: `0 10px 15px rgba(0, 0, 0, 0.1)`

### Gradient Backgrounds

**Dark Theme:**

```css
--gradient-bg: linear-gradient(
  to bottom right,
  hsl(222, 84%, 5%) 0%,
  hsl(217, 33%, 12%) 50%,
  hsl(222, 84%, 5%) 100%
);
```

**Light Theme:**

```css
--gradient-bg: linear-gradient(
  to bottom right,
  hsl(210, 40%, 98%) 0%,
  hsl(217, 91%, 95%) 50%,
  hsl(210, 40%, 98%) 100%
);
```

## Component Migration Strategy

### Priority Levels

**High Priority (Core UI):**

1. Header component
2. Sidebar component
3. Chat messages component
4. Chat input component
5. Landing page

**Medium Priority (Secondary UI):** 6. Profile modal 7. Domain picker 8. Language picker 9. Login page

**Low Priority (UI Components):** 10. Button component 11. Dialog component 12. Other shadcn/ui components

### Migration Pattern

**Before (Hardcoded):**

```tsx
<div className="bg-slate-900 text-white border-slate-700">
```

**After (Theme-aware):**

```tsx
<div className="bg-background text-foreground border-border">
```

**Tailwind Configuration:**

```typescript
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      background: 'var(--bg-primary)',
      foreground: 'var(--text-primary)',
      // ... map all CSS variables
    }
  }
}
```

### Specific Component Changes

**Header Component:**

- Background: `bg-slate-900` → `bg-background/95 backdrop-blur`
- Border: `border-white/10` → `border-border`
- Text: `text-white` → `text-foreground`
- Buttons: Use theme-aware button variants

**Sidebar Component:**

- Background gradient: Use `--gradient-bg` variable
- Session items: `bg-slate-800/50` → `bg-secondary/50`
- Hover states: `hover:bg-slate-800/50` → `hover:bg-secondary/70`
- Active session: `bg-blue-600/20` → `bg-accent-primary/20`

**Chat Messages:**

- User messages: Keep blue accent but use `--accent-primary`
- Assistant messages: `bg-slate-800/70` → `bg-secondary/70`
- Loading indicator: Use `--accent-primary` for dots

**Chat Input:**

- Input background: `bg-slate-900` → `bg-input`
- Border: `border-slate-700/30` → `border-border`
- Focus ring: `focus:ring-blue-400/70` → `focus:ring-accent-primary`
- Glow effects: Use `--glow-primary` variable

**Landing Page:**

- Main background: Keep gradient but use CSS variables
- Feature cards: `bg-slate-800/40` → `bg-secondary/40`
- Text colors: Update to use semantic variables
- Decorative blurs: Adjust opacity for light theme

**Profile Modal:**

- Dialog background: `bg-slate-800/50` → `bg-elevated`
- Input fields: `bg-slate-800` → `bg-input`
- Borders: `border-slate-600` → `border-border`

## Error Handling

### localStorage Unavailable

**Scenario:** User has disabled localStorage or is in private browsing mode

**Handling:**

```typescript
try {
  localStorage.setItem(storageKey, theme);
} catch (error) {
  console.warn("Failed to save theme preference:", error);
  // Continue without persistence
}
```

### System Preference Detection Failure

**Scenario:** `window.matchMedia` is not supported

**Handling:**

```typescript
const getSystemTheme = (): Theme => {
  if (typeof window === "undefined") return "dark";

  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  } catch {
    return "dark"; // Fallback
  }
};
```

### FOUC Prevention

**Problem:** Theme flickers on page load

**Solution:**

```typescript
// In ThemeProvider, apply theme before first render
useEffect(() => {
  const savedTheme = getSavedTheme();
  document.documentElement.classList.add(savedTheme);
}, []);
```

**Additional:** Add inline script in `<head>` to apply theme immediately:

```html
<script>
  (function () {
    const theme =
      localStorage.getItem("mutumwa-theme") ||
      (window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light");
    document.documentElement.classList.add(theme);
  })();
</script>
```

## Testing Strategy

### Unit Tests

**ThemeContext Tests:**

- ✓ Initializes with system preference when no saved theme
- ✓ Initializes with saved theme from localStorage
- ✓ toggleTheme switches between light and dark
- ✓ setTheme updates theme correctly
- ✓ Persists theme to localStorage on change
- ✓ Handles localStorage errors gracefully

**ThemeToggle Tests:**

- ✓ Renders correct icon for current theme
- ✓ Calls toggleTheme when clicked
- ✓ Is keyboard accessible
- ✓ Shows correct tooltip

### Integration Tests

**Theme Application:**

- ✓ Changing theme updates all components
- ✓ Theme persists across page reloads
- ✓ Theme synchronizes across tabs
- ✓ No FOUC on initial load

### Visual Regression Tests

**Component Appearance:**

- ✓ All components render correctly in light theme
- ✓ All components render correctly in dark theme
- ✓ Transitions are smooth
- ✓ Contrast ratios meet WCAG AA standards

### Accessibility Tests

**Contrast Ratios:**

- ✓ Text on backgrounds meets 4.5:1 ratio (normal text)
- ✓ Text on backgrounds meets 3:1 ratio (large text)
- ✓ Interactive elements have sufficient contrast

**Keyboard Navigation:**

- ✓ Theme toggle is reachable via Tab
- ✓ Theme toggle activates with Enter/Space
- ✓ Focus indicators are visible in both themes

### Manual Testing Checklist

- [ ] Test on Chrome, Firefox, Safari, Edge
- [ ] Test on mobile devices (iOS, Android)
- [ ] Test with system dark mode enabled
- [ ] Test with system light mode enabled
- [ ] Test localStorage disabled
- [ ] Test with reduced motion preference
- [ ] Test theme persistence across sessions
- [ ] Test theme synchronization across tabs
- [ ] Verify all pages (landing, chat, login)
- [ ] Verify all modals and dialogs
- [ ] Verify all interactive states (hover, focus, active)

## Performance Considerations

### CSS Variable Performance

**Approach:** Use CSS variables for all theme colors
**Impact:** Minimal - CSS variables are highly optimized by browsers
**Benefit:** Instant theme switching without re-rendering React components

### Transition Performance

**Approach:** Limit transitions to color properties only
**Configuration:**

```css
transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out,
  border-color 0.2s ease-in-out;
```

**Impact:** Negligible - color transitions are GPU-accelerated

### localStorage Access

**Approach:** Read once on mount, write on change
**Impact:** Minimal - localStorage operations are synchronous but fast
**Optimization:** Debounce writes if theme changes rapidly (not needed for toggle)

### Bundle Size

**Impact:**

- ThemeContext: ~2KB
- ThemeToggle: ~1KB
- CSS variables: ~1KB
  **Total:** ~4KB additional bundle size

## Accessibility Compliance

### WCAG 2.1 Level AA Requirements

**1.4.3 Contrast (Minimum):**

- ✓ Normal text: 4.5:1 contrast ratio
- ✓ Large text: 3:1 contrast ratio
- ✓ UI components: 3:1 contrast ratio

**1.4.11 Non-text Contrast:**

- ✓ Interactive elements have 3:1 contrast with adjacent colors

**2.1.1 Keyboard:**

- ✓ Theme toggle is keyboard accessible

**2.4.7 Focus Visible:**

- ✓ Focus indicators are visible in both themes

**2.5.5 Target Size:**

- ✓ Theme toggle button is at least 44x44px on mobile

### Reduced Motion Support

**Implementation:**

```css
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}
```

## Migration Checklist

### Phase 1: Infrastructure

- [ ] Create ThemeContext and ThemeProvider
- [ ] Define CSS variables for both themes
- [ ] Update Tailwind config to use CSS variables
- [ ] Add ThemeProvider to app layout
- [ ] Create ThemeToggle component
- [ ] Add ThemeToggle to Header

### Phase 2: Core Components

- [ ] Migrate Header component
- [ ] Migrate Sidebar component
- [ ] Migrate Chat Messages component
- [ ] Migrate Chat Input component
- [ ] Test core chat functionality

### Phase 3: Secondary Components

- [ ] Migrate Landing Page
- [ ] Migrate Profile Modal
- [ ] Migrate Login Page
- [ ] Migrate Pickers (Domain, Language)

### Phase 4: UI Components

- [ ] Migrate Button component
- [ ] Migrate Dialog component
- [ ] Migrate other shadcn/ui components

### Phase 5: Testing & Polish

- [ ] Test all components in both themes
- [ ] Verify accessibility
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Fix any visual issues
- [ ] Optimize performance

## Future Enhancements

### Potential Additions (Out of Scope)

1. **Custom Theme Colors:** Allow users to customize accent colors
2. **Auto Theme Switching:** Switch theme based on time of day
3. **High Contrast Mode:** Additional theme for accessibility
4. **Theme Presets:** Multiple pre-defined color schemes
5. **Per-Domain Themes:** Different themes for different domains

These enhancements are not part of the current implementation but could be added in future iterations.

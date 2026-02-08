# Theme System Documentation

## Overview

The application supports a dynamic theme switching system with two color schemes:
- **Orange Theme** (Default): Primary color `#F27D3A`
- **Blue Theme**: Primary color `#3B82F6`

## Implementation

### 1. Theme Store (`stores/theme.store.ts`)

Zustand-based store managing theme state with persistence:

```typescript
import { useThemeStore } from '@/stores/theme.store';

// Get current theme
const { theme, setTheme, toggleTheme } = useThemeStore();

// Set specific theme
setTheme('orange'); // or 'blue'

// Toggle between themes
toggleTheme();
```

### 2. Theme Provider (`components/shared/ThemeProvider.tsx`)

Client-side provider that applies theme classes to the document:

```tsx
import { ThemeProvider } from '@/components/shared/ThemeProvider';

<ThemeProvider>
  {children}
</ThemeProvider>
```

### 3. CSS Variables (`app/globals.css`)

Theme-specific CSS variables:

```css
/* Orange Theme */
.theme-orange {
  --primary: #F27D3A;
  --primary-foreground: oklch(0.985 0 0);
  --primary-rgb: 242, 125, 58;
  --primary-hover: #E06B28;
  --primary-light: #FFA366;
  --primary-dark: #D16829;
}

/* Blue Theme */
.theme-blue {
  --primary: #3B82F6;
  --primary-foreground: oklch(0.985 0 0);
  --primary-rgb: 59, 130, 246;
  --primary-hover: #2563EB;
  --primary-light: #60A5FA;
  --primary-dark: #1D4ED8;
}
```

## Usage in Components

### Using CSS Variables

```tsx
// Tailwind classes automatically use CSS variables
<button className="bg-primary text-primary-foreground hover:bg-primary/90">
  Click me
</button>

// For custom styles
<div style={{ backgroundColor: 'var(--primary)' }}>
  Content
</div>
```

### Theme Toggle in Profile

The theme toggle is integrated into the Profile dialog:

```tsx
import { useThemeStore } from '@/stores/theme.store';

const { theme, setTheme } = useThemeStore();

<button onClick={() => setTheme('orange')}>
  Orange Theme
</button>
<button onClick={() => setTheme('blue')}>
  Blue Theme
</button>
```

## Features

- ✅ **Persistent**: Theme preference saved in localStorage
- ✅ **Real-time**: Instant theme switching without reload
- ✅ **Type-safe**: TypeScript support with defined theme types
- ✅ **Accessible**: Maintains WCAG color contrast standards
- ✅ **Consistent**: All components use CSS variables

## Available Theme Variables

| Variable | Orange | Blue | Usage |
|----------|--------|------|-------|
| `--primary` | #F27D3A | #3B82F6 | Primary brand color |
| `--primary-foreground` | White | White | Text on primary |
| `--primary-hover` | #E06B28 | #2563EB | Hover states |
| `--primary-light` | #FFA366 | #60A5FA | Light variants |
| `--primary-dark` | #D16829 | #1D4ED8 | Dark variants |
| `--primary-rgb` | 242,125,58 | 59,130,246 | RGB values |

## Adding New Themes

To add a new theme:

1. **Update theme.store.ts**:
```typescript
export type Theme = 'orange' | 'blue' | 'green'; // Add new theme
```

2. **Add CSS variables in globals.css**:
```css
.theme-green {
  --primary: #10B981;
  --primary-foreground: oklch(0.985 0 0);
  --primary-rgb: 16, 185, 129;
  --primary-hover: #059669;
  --primary-light: #34D399;
  --primary-dark: #047857;
}
```

3. **Update theme toggle UI** in profile component

## Best Practices

1. **Always use CSS variables** for primary colors instead of hardcoded values
2. **Use Tailwind classes** (`bg-primary`, `text-primary`) when possible
3. **Test both themes** during development
4. **Maintain color contrast** for accessibility
5. **Document custom theme colors** for team reference

## Migration Guide

If you have existing hardcoded colors, replace them:

**Before:**
```tsx
<button className="bg-[#F27D3A] text-white">
  Click me
</button>
```

**After:**
```tsx
<button className="bg-primary text-primary-foreground">
  Click me
</button>
```

## Troubleshooting

### Theme not applying on page load
- Ensure ThemeProvider wraps your app in layout.tsx
- Check localStorage for 'theme-storage' key

### Colors not changing
- Verify you're using CSS variables (`var(--primary)`)
- Check that theme class is applied to document root

### Hydration errors
- ThemeProvider is client-side only
- Theme state is persisted correctly via Zustand

## References

- Theme Store: `src/stores/theme.store.ts`
- Theme Provider: `src/components/shared/ThemeProvider.tsx`
- CSS Variables: `src/app/globals.css`
- Profile Toggle: `src/components/profile/profile.tsx`

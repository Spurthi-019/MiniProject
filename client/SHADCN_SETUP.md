# Shadcn UI Setup Guide

## Overview
This project uses **Shadcn UI** components with **Tailwind CSS** for a modern, dark-themed UI experience. Shadcn UI provides beautifully designed, accessible components that can be copied into your project.

## Installation Complete ✅

The following setup has been completed:

### 1. Dependencies Installed
- `tailwindcss` - Utility-first CSS framework
- `postcss` - CSS transformation tool
- `autoprefixer` - Adds vendor prefixes automatically
- `framer-motion` - Animation library
- `class-variance-authority` - CVA for component variants
- `clsx` - Utility for constructing className strings
- `tailwind-merge` - Merge Tailwind CSS classes
- `lucide-react` - Icon library
- `tailwindcss-animate` - Animation utilities

### 2. Configuration Files Created
- ✅ `tailwind.config.js` - Tailwind configuration with custom theme
- ✅ `postcss.config.js` - PostCSS configuration
- ✅ `components.json` - Shadcn UI configuration
- ✅ `jsconfig.json` - JavaScript path aliases
- ✅ `src/lib/utils.js` - Utility functions (cn helper)

### 3. Components Available
Located in `src/components/ui/`:
- ✅ **Button** (`button.jsx`) - Multiple variants and sizes
- ✅ **Card** (`card.jsx`) - Card with Header, Content, Footer
- ✅ **Input** (`input.jsx`) - Form input with focus states

### 4. Theme System
- **Dark Mode**: Enabled by default via `document.documentElement.classList.add('dark')`
- **CSS Variables**: Defined in `src/index.css` for easy theming
- **Colors**: Purple gradient primary, pink secondary, goldenrod accents

## Usage

### Importing Components
```javascript
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
```

### Button Examples
```javascript
// Default button
<Button>Click me</Button>

// Variants
<Button variant="secondary">Secondary</Button>
<Button variant="destructive">Delete</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="lg">Large</Button>
<Button size="icon">🔍</Button>
```

### Card Examples
```javascript
<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
    <CardDescription>Card description</CardDescription>
  </CardHeader>
  <CardContent>
    Your content here
  </CardContent>
  <CardFooter>
    <Button>Action</Button>
  </CardFooter>
</Card>
```

### Input Examples
```javascript
<Input type="email" placeholder="Enter email" />
<Input type="password" placeholder="Enter password" />
<Input disabled placeholder="Disabled" />
```

## Demo Page
Visit `/demo/shadcn` to see all components in action with the dark theme.

## Custom Theme Colors

### Primary (Purple Gradient)
- Light: `#667eea`
- Main: `#764ba2`
- Dark: `#5a3a7f`

### Secondary (Pink)
- Light: `#f093fb`
- Main: `#f5576c`
- Dark: `#c44558`

### Accent (Goldenrod)
- Gold: `#FFD700`
- Amber: `#FFC107`
- Goldenrod: `#DAA520`

## Adding More Components

To add additional Shadcn UI components manually:

1. Visit [Shadcn UI Documentation](https://ui.shadcn.com/)
2. Browse the components library
3. Copy the component code
4. Create a new file in `src/components/ui/`
5. Import and use in your pages

### Popular Components to Add:
- Dialog/Modal
- Dropdown Menu
- Tabs
- Toast/Alert
- Select
- Avatar
- Badge
- Table

## Path Aliases
The following path aliases are configured in `jsconfig.json`:
- `@/components` → `src/components`
- `@/lib` → `src/lib`
- `@/utils` → `src/utils`
- `@/ui` → `src/components/ui`
- `@/hooks` → `src/hooks`

## Tailwind CSS Custom Classes

### Background Gradients
- `bg-gradient-primary` - Purple gradient
- `bg-gradient-secondary` - Pink gradient
- `bg-gradient-gold` - Gold gradient

### Border Radius
- `rounded-lg` - Large radius (var(--radius))
- `rounded-md` - Medium radius
- `rounded-sm` - Small radius

## Dark Mode

Dark mode is enabled by default via the `dark` class on the HTML element. The theme uses CSS variables that automatically switch based on the presence of this class.

To toggle dark mode programmatically:
```javascript
// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');

// Toggle dark mode
document.documentElement.classList.toggle('dark');
```

## Styling Best Practices

1. **Use the `cn()` utility** for merging classes:
   ```javascript
   import { cn } from '@/lib/utils';
   
   <div className={cn("base-class", isActive && "active-class")} />
   ```

2. **Prefer CSS variables** for consistent theming:
   ```javascript
   className="bg-primary text-primary-foreground"
   ```

3. **Use Tailwind utilities** for responsive design:
   ```javascript
   className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
   ```

## Troubleshooting

### CSS Lint Warnings
If you see warnings like "Unknown at rule @apply" in `index.css`, these are expected and won't affect functionality. PostCSS processes these directives during the build.

### Import Errors
If you get import errors with `@/` paths:
1. Ensure `jsconfig.json` is in the client root
2. Restart your VS Code editor
3. Restart the development server

### Tailwind Not Working
1. Ensure `index.css` imports are at the top:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
2. Check that `tailwind.config.js` content paths are correct
3. Restart the development server

## Resources
- [Shadcn UI Documentation](https://ui.shadcn.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Radix UI Primitives](https://www.radix-ui.com/) (used by Shadcn)
- [Class Variance Authority](https://cva.style/docs)

## Next Steps
1. Browse the Shadcn UI component library
2. Add components you need to `src/components/ui/`
3. Integrate components into your existing pages
4. Customize the theme colors in `tailwind.config.js` and `index.css`
5. Build amazing dark-themed UIs! 🚀

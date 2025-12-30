# React + TypeScript + Vite + Tailwind CSS v4 + shadcn/ui

A modern, production-ready React application with TypeScript, Vite, Tailwind CSS v4, and shadcn/ui components organized using Atomic Design principles.

## ✨ Features

- ⚡️ **Vite** - Lightning-fast build tool and dev server
- ⚛️ **React 19** - Latest React with concurrent features
- 🔷 **TypeScript** - Type-safe development with full IntelliSense
- 🎨 **Tailwind CSS v4** - Utility-first CSS with modern @theme syntax
- 🧩 **shadcn/ui** - Beautiful, accessible components
- 🏗️ **Atomic Design** - Scalable component architecture
- 🌓 **Dark Mode** - Built-in theme switching
- 🎯 **ESLint** - Code quality with comprehensive rules
- 💅 **Prettier** - Consistent code formatting
- 🐕 **Husky** - Git hooks for quality checks
- 📦 **Path Aliases** - Clean imports with @/ prefix

## 📁 Project Structure

```
src/
├── components/
│   ├── atoms/              # Basic building blocks (Button, Input, Card, etc.)
│   │   ├── index.ts        # Single barrel export
│   │   ├── Button/
│   │   ├── Card/
│   │   └── ...
│   ├── molecules/          # Simple groups of atoms
│   │   ├── index.ts
│   │   └── ...
│   ├── organisms/          # Complex UI components
│   │   ├── index.ts
│   │   └── ...
│   ├── templates/          # Page-level layouts
│   │   ├── index.ts
│   │   └── ...
│   └── theme-provider.tsx  # Theme context
├── pages/                  # Page components
│   ├── index.ts
│   └── HomePage/
├── hooks/                  # Custom React hooks
│   ├── index.ts
│   └── useTheme.ts
├── lib/                    # Utilities
│   └── utils.ts
└── types/                  # TypeScript definitions
```

## 🚀 Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview
```

## 🛠️ Available Scripts

```bash
# Development
pnpm run dev                    # Start dev server
pnpm run build                  # Build for production
pnpm run preview                # Preview production build

# Code Quality
pnpm run lint                   # Check for linting errors
pnpm run lint:fix               # Auto-fix linting errors
pnpm run format                 # Format all files with Prettier
pnpm run format:check           # Check if files are formatted
pnpm run type-check             # TypeScript type checking
pnpm run type-check:watch       # Type checking in watch mode

# shadcn/ui Components
pnpm dlx shadcn@latest add <component>  # Add a component
```

## 🧩 Adding Components

### Adding shadcn/ui Components

```bash
# Add a component
pnpm dlx shadcn@latest add button

# The components will be added to src/components/ui/
# You can manually organize them into atomic structure as needed
```

## 📦 Import Examples

```tsx
// Clean imports with barrel exports
import { Button, Card, Input } from "@/components/atoms";
import { Dialog, Popover } from "@/components/molecules";
import { Form, Table } from "@/components/organisms";
import { HomePage } from "@/pages";
import { useTheme } from "@/hooks";
```

## 🎨 Theming

The project uses Tailwind CSS v4 with CSS variables for theming:

```css
/* src/index.css */
@import "tailwindcss";

:root {
  --background: oklch(1 0 0);
  --foreground: oklch(0.145 0 0);
  /* ... more variables */
}

.dark {
  --background: oklch(0.145 0 0);
  --foreground: oklch(0.985 0 0);
  /* ... more variables */
}
```

Toggle theme in your components:

```tsx
import { useTheme } from "@/hooks";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>Toggle Theme</button>
  );
}
```

## 🏗️ Atomic Design Principles

### Atoms

Basic building blocks (Button, Input, Label, Card)

```tsx
import { Button } from "@/components/atoms";
<Button variant="primary">Click me</Button>;
```

### Molecules

Simple groups of atoms (InputField, SearchBox)

```tsx
// Combines Label + Input
<InputField label="Email" id="email" />
```

### Organisms

Complex UI components (Header, ProductGrid)

```tsx
<Header /> // Contains Logo, Navigation, UserProfile
```

### Templates

Page-level layouts (DashboardLayout, AuthLayout)

```tsx
<DashboardLayout>
  <YourPageContent />
</DashboardLayout>
```

## 📝 Code Quality Tools

### ESLint

Configured with React, TypeScript, accessibility, and import plugins.

### Prettier

Automatic code formatting on save (VS Code) and pre-commit.

### Husky

Pre-commit hooks run:

- ESLint auto-fix
- Prettier formatting
- Type checking

## 🔧 Configuration Files

- `vite.config.ts` - Vite configuration with path aliases
- `tsconfig.json` - TypeScript configuration
- `components.json` - shadcn/ui configuration
- `eslint.config.js` - ESLint rules
- `.prettierrc` - Prettier formatting rules
- `tailwind.config.js` - Not needed for v4 (uses CSS @theme)

## 📚 Documentation

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [TypeScript](https://www.typescriptlang.org/)
- [Atomic Design](https://atomicdesign.bradfrost.com/)

## 🤝 Contributing

1. Follow the established file structure
2. Use path aliases (@/) for imports
3. Run `pnpm run lint:fix` before committing
4. Organize new shadcn/ui components into atomic structure
5. Update barrel exports (index.ts) when adding components

## 📄 License

MIT

---

Built with ❤️ using React, TypeScript, Vite, Tailwind CSS v4, and shadcn/ui
import reactDom from "eslint-plugin-react-dom";

export default defineConfig([
globalIgnores(["dist"]),
{
files: ["**/*.{ts,tsx}"],
extends: [
// Other configs...
// Enable lint rules for React
reactX.configs["recommended-typescript"],
// Enable lint rules for React DOM
reactDom.configs.recommended,
],
languageOptions: {
parserOptions: {
project: ["./tsconfig.node.json", "./tsconfig.app.json"],
tsconfigRootDir: import.meta.dirname,
},
// other options...
},
},
]);

```

```

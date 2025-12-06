# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Vibin Coders SaaS Accelerator is a comprehensive Next.js 15+ SaaS accelerator built with modern web technologies. This foundation provides everything needed to quickly build and deploy SaaS applications with authentication, payments, analytics, and API management capabilities.

## Technology Stack

- **Framework**: Next.js 15+ with App Router
- **Language**: TypeScript
- **Authentication**: Supabase Auth with JWT tokens
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui component library
- **Theming**: next-themes for dark/light mode support
- **Icons**: Lucide React
- **Package Manager**: npm

## Development Commands

```bash
# Development
npm run dev              # Start development server with Turbopack
npm run build           # Build for production
npm run start           # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run type-check      # Run TypeScript type checking

# Utilities
npm run clean           # Clean build artifacts
```

## Project Architecture

### Directory Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Authentication login page
│   ├── dashboard/         # Protected dashboard page (requires auth)
│   ├── globals.css        # Global styles and Tailwind
│   ├── layout.tsx         # Root layout with providers
│   └── page.tsx           # Landing page
├── components/
│   ├── ui/                # shadcn/ui components (auto-generated)
│   ├── auth/              # Authentication components
│   │   ├── LoginForm.tsx  # Login form with validation
│   │   ├── UserMenu.tsx   # User dropdown menu in header
│   │   ├── ProtectedRoute.tsx        # Server-side route protection
│   │   └── ClientProtectedRoute.tsx  # Client-side route protection
│   ├── layout/            # Layout components (Header, Footer, Navigation)
│   ├── features/          # Feature-specific components
│   │   └── landing/       # Landing page sections
│   └── common/            # Shared utility components
├── contexts/
│   └── AuthContext.tsx    # Authentication context provider
├── lib/
│   ├── auth/
│   │   └── server.ts      # Server-side auth utilities
│   ├── supabase/
│   │   ├── client.ts      # Browser Supabase client
│   │   └── server.ts      # Server Supabase client
│   ├── utils.ts           # Utility functions (cn helper)
│   ├── constants.ts       # App configuration and constants
│   └── types.ts           # Shared TypeScript interfaces
├── styles/
│   └── globals.css        # Additional custom styles
├── types/
│   ├── auth.ts            # Authentication type definitions
│   └── subscription.ts    # Subscription/billing type definitions
└── middleware.ts          # Route protection middleware
```

### Component Architecture

- **Layout Components**: Responsive header with navigation, footer with links, mobile-friendly design
- **Authentication System**: Complete Supabase auth integration with login, user menu, and route protection
- **Landing Sections**: Hero section, features showcase, pricing preview with 3-tier structure
- **UI Utilities**: Loading spinners, theme toggle, reusable components
- **Type System**: Comprehensive TypeScript definitions for auth and future features

### Styling System

- **Design Tokens**: Custom color palette with brand colors (blues/purples)
- **Dark Mode**: Automatic system detection with manual toggle
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Animation**: Custom animations for fade-in, slide-in effects
- **Component Variants**: shadcn/ui design system with consistent styling

## Configuration Files

- **tailwind.config.ts**: Extended with custom colors, animations, and brand tokens
- **prettier.config.js**: Code formatting with Tailwind class sorting
- **next.config.ts**: Production optimizations with security headers
- **components.json**: shadcn/ui configuration for consistent theming
- **middleware.ts**: Route protection and authentication middleware
- **.env.local.example**: Template for environment variables (includes Supabase config)

## Current Features

### Implemented
- Complete landing page with hero, features, and pricing sections
- Responsive navigation with mobile menu
- Dark/light mode theming
- **Full Supabase authentication system**
  - JWT token handling with secure cookies
  - Login page with form validation and error handling
  - Protected dashboard page
  - User menu with logout functionality
  - Route protection middleware
  - Server and client-side auth utilities
- TypeScript type definitions for auth and future features
- Component library setup with shadcn/ui
- Development workflow with linting and formatting

### Planned (Type Definitions Ready)
- Subscription management with Stripe integration
- User settings and profile management
- API management and rate limiting
- Analytics and reporting
- Team collaboration features

## Authentication System

### Architecture Overview
The authentication system uses Supabase Auth with JWT tokens and follows security best practices:

- **Client-side**: React Context (`AuthContext`) provides user state and auth methods
- **Server-side**: Utilities in `src/lib/auth/server.ts` for SSR and API routes
- **Route Protection**: Next.js middleware handles automatic redirects
- **Session Management**: Secure HTTP-only cookies with automatic refresh

### Environment Variables Required
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
SUPABASE_SECRET_KEY=your-secret-key
```

### Page Protection Methods

**Method 1: Automatic Folder Protection (Recommended)**
```typescript
// Pages in these folders are automatically protected:
src/app/dashboard/    // All dashboard pages require auth
src/app/settings/     // All settings pages require auth  
src/app/profile/      // All profile pages require auth
```
Configure protected folders in `src/middleware.ts`:
```typescript
const protectedRoutes = ['/dashboard', '/settings', '/profile']
```

**Method 2: Server Component Protection**
```typescript
import ProtectedRoute from '@/components/auth/ProtectedRoute'

export default function MyPage() {
  return (
    <ProtectedRoute>
      <PageContent />
    </ProtectedRoute>
  )
}
```

**Method 3: Client Component Protection**
```typescript
import ClientProtectedRoute from '@/components/auth/ClientProtectedRoute'

export default function MyPage() {
  return (
    <ClientProtectedRoute>
      <InteractiveContent />
    </ClientProtectedRoute>
  )
}
```

**Method 4: Mixed Content (Public + Private)**
```typescript
import { useAuth } from '@/contexts/AuthContext'

export default function MixedPage() {
  const { user, loading } = useAuth()
  
  return (
    <div>
      <PublicContent />
      {user ? <PrivateContent /> : <SignInPrompt />}
    </div>
  )
}
```

### Authentication Hooks and Utilities

**Client-side Hook:**
```typescript
import { useAuth } from '@/contexts/AuthContext'

const { user, loading, error, signIn, signOut } = useAuth()
```

**Server-side Utilities:**
```typescript
import { getUser, requireAuth } from '@/lib/auth/server'

// Get current user (returns null if not authenticated)
const user = await getUser()

// Require authentication (redirects to login if not authenticated)
const user = await requireAuth()
```

## Navigation System

### Overview
The project includes a comprehensive navigation system with hierarchical structure support, sidebar navigation, and breadcrumb trails. The navigation is designed to be flexible and configurable per page.

### Navigation Hierarchy Levels

The navigation system supports 4 levels of hierarchy:

1. **X Level (Header)**: Main navigation in the top header bar
2. **Y Level (Sidebar Primary)**: Main sections in the left sidebar (e.g., Analytics, Settings)  
3. **Z Level (Sidebar Secondary)**: Sub-sections nested under Y items (e.g., Reports, Users, Profile)
4. **W Level (Breadcrumb Only)**: Specific pages shown only in breadcrumbs

### Using the Navigation System

**Basic Page Setup:**
```typescript
'use client';

import { usePathname } from 'next/navigation';
import { MainLayout } from '@/components/layout/MainLayout';
import { NavigationConfig } from '@/types/navigation';

const navigationConfig: NavigationConfig = {
  title: 'Page Title',
  sidebar: {
    enabled: true,
    section: 'SectionName',
    icon: 'Home', // Icon from Lucide React
  },
  breadcrumb: {
    path: ['Parent', 'Current Page'],
  },
};

export default function MyPage() {
  const pathname = usePathname();

  return (
    <MainLayout config={navigationConfig} pathname={pathname}>
      {/* Your page content */}
    </MainLayout>
  );
}
```

**Available Icons:**
- Home, BarChart3, Settings, Users, FileText, User

**Navigation Context:**
```typescript
import { useNavigation } from '@/contexts/NavigationContext';

const { 
  sidebarSections,     // Current sidebar structure
  sidebarOpen,         // Sidebar open/closed state
  toggleSidebar,       // Toggle sidebar function
  registerPage         // Register page in navigation
} = useNavigation();
```

### Components

**MainLayout**: Primary layout wrapper that includes sidebar and breadcrumbs
**Sidebar**: Collapsible left navigation with hierarchical menu support  
**Breadcrumbs**: Dynamic breadcrumb trail based on navigation config

### Layout Spacing

The navigation layout uses balanced spacing:
- **Left margin**: 48px total (24px + 24px padding) when sidebar is open
- **Right margin**: 48px padding for visual balance
- **Sidebar widths**: 256px (open) / 64px (collapsed)
- **Breadcrumb border**: Contained within content padding for consistency

## Development Guidelines

### Adding New Components
1. Follow shadcn/ui patterns for consistency
2. Use TypeScript interfaces from `src/types/auth.ts` for auth-related components
3. Implement responsive design with Tailwind classes
4. Add proper ARIA attributes for accessibility

### Styling Conventions
- Use custom CSS variables for brand colors
- Follow mobile-first responsive design
- Implement smooth transitions and animations
- Maintain consistent spacing with Tailwind utilities

### Type Safety
- All components must be properly typed
- Use existing type definitions from `src/types/`
- Extend types in `src/lib/types.ts` for shared interfaces
- Maintain strict TypeScript configuration

## Future Extensions

The codebase is prepared for these Phase 2+ features:
- ✅ **Supabase authentication and database** (IMPLEMENTED)
- Stripe payment processing and subscription management
- User settings and profile management pages
- Advanced analytics dashboard with user metrics
- API rate limiting and management
- Team collaboration and user management
- Email templates and notifications
- Password reset and email verification flows

## Key Constants

Important configuration values are centralized in `src/lib/constants.ts`:
- App metadata and branding
- Subscription tier definitions
- Feature flags and permissions
- API configuration
- Validation rules and limits

This foundation provides a production-ready starting point for SaaS development with modern best practices and scalable architecture.
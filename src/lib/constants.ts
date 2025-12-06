import { SubscriptionTier } from './types';

// App configuration
export const APP_CONFIG = {
  name: 'SaaSify',
  description: 'The fastest way to build and deploy your SaaS application',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  version: '1.0.0',
  author: 'SaaSify Team',
  email: 'hello@saasify.com',
  social: {
    github: 'https://github.com/saasify',
    twitter: 'https://twitter.com/saasify',
    linkedin: 'https://linkedin.com/company/saasify',
  },
} as const;

// Subscription plans configuration
export const SUBSCRIPTION_PLANS = {
  [SubscriptionTier.FREE]: {
    name: 'Free',
    price: 0,
    currency: 'USD',
    interval: 'month',
    features: {
      max_users: 1000,
      api_calls_per_month: 10000,
      storage_gb: 1,
      support_level: 'community',
      custom_branding: false,
      advanced_analytics: false,
      priority_support: false,
      sso: false,
    },
    stripe_price_id: null,
  },
  [SubscriptionTier.PRO]: {
    name: 'Pro',
    price: 29,
    currency: 'USD',
    interval: 'month',
    features: {
      max_users: 10000,
      api_calls_per_month: 100000,
      storage_gb: 10,
      support_level: 'email',
      custom_branding: true,
      advanced_analytics: true,
      priority_support: true,
      sso: false,
    },
    stripe_price_id: process.env.STRIPE_PRO_PRICE_ID,
  },
  [SubscriptionTier.ENTERPRISE]: {
    name: 'Enterprise',
    price: null, // Custom pricing
    currency: 'USD',
    interval: 'month',
    features: {
      max_users: -1, // Unlimited
      api_calls_per_month: -1, // Unlimited
      storage_gb: -1, // Unlimited
      support_level: 'dedicated',
      custom_branding: true,
      advanced_analytics: true,
      priority_support: true,
      sso: true,
    },
    stripe_price_id: null, // Custom pricing
  },
} as const;

// Feature flags
export const FEATURES = {
  AUTHENTICATION: 'authentication',
  PAYMENTS: 'payments',
  ANALYTICS: 'analytics',
  API_MANAGEMENT: 'api_management',
  TEAM_COLLABORATION: 'team_collaboration',
  CUSTOM_BRANDING: 'custom_branding',
  ADVANCED_SECURITY: 'advanced_security',
  PRIORITY_SUPPORT: 'priority_support',
  SSO: 'sso',
  WEBHOOKS: 'webhooks',
} as const;

// API configuration
export const API_CONFIG = {
  base_url: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30 seconds
  retry_attempts: 3,
  retry_delay: 1000, // 1 second
} as const;

// Pagination defaults
export const PAGINATION = {
  default_page: 1,
  default_limit: 10,
  max_limit: 100,
  limits: [10, 25, 50, 100],
} as const;

// Validation constants
export const VALIDATION = {
  password: {
    min_length: 8,
    max_length: 128,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: false,
  },
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  name: {
    min_length: 2,
    max_length: 50,
  },
} as const;

// Rate limiting
export const RATE_LIMITS = {
  api: {
    [SubscriptionTier.FREE]: 100, // requests per hour
    [SubscriptionTier.PRO]: 1000,
    [SubscriptionTier.ENTERPRISE]: 10000,
  },
  auth: {
    login_attempts: 5, // per 15 minutes
    password_reset: 3, // per hour
    signup_attempts: 3, // per hour
  },
} as const;

// File upload limits
export const UPLOAD_LIMITS = {
  max_file_size: 10 * 1024 * 1024, // 10MB
  allowed_types: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif',
    'application/pdf',
    'text/plain',
    'text/csv',
  ],
  max_files: 5,
} as const;

// Cache configuration
export const CACHE = {
  user_session: 24 * 60 * 60, // 24 hours
  api_response: 5 * 60, // 5 minutes
  static_content: 30 * 24 * 60 * 60, // 30 days
} as const;

// Error codes
export const ERROR_CODES = {
  // Authentication
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  
  // Validation
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  
  // Subscription
  SUBSCRIPTION_REQUIRED: 'SUBSCRIPTION_REQUIRED',
  FEATURE_NOT_AVAILABLE: 'FEATURE_NOT_AVAILABLE',
  USAGE_LIMIT_EXCEEDED: 'USAGE_LIMIT_EXCEEDED',
  
  // General
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE',
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
  ACCOUNT_CREATED: 'Account created successfully',
  LOGIN_SUCCESS: 'Logged in successfully',
  LOGOUT_SUCCESS: 'Logged out successfully',
  PASSWORD_RESET_SENT: 'Password reset email sent',
  PASSWORD_UPDATED: 'Password updated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SUBSCRIPTION_UPDATED: 'Subscription updated successfully',
  SUBSCRIPTION_CANCELED: 'Subscription canceled successfully',
} as const;

// Navigation items
export const NAVIGATION_ITEMS = [
  { name: 'Features', href: '/#features', auth_required: false },
  { name: 'Pricing', href: '/#pricing', auth_required: false },
  { name: 'Dashboard', href: '/dashboard', auth_required: true },
  { name: 'Settings', href: '/settings', auth_required: true },
  { name: 'API Docs', href: '/api-docs', auth_required: false },
] as const;

// Theme configuration
export const THEME = {
  default: 'system',
  options: ['light', 'dark', 'system'],
} as const;
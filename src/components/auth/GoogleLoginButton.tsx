'use client';

import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { Chrome } from 'lucide-react';
import { useState } from 'react';

interface GoogleLoginButtonProps {
  redirectTo?: string;
  variant?: 'default' | 'outline';
  className?: string;
}

export function GoogleLoginButton({
  redirectTo = '/boards',
  variant = 'outline',
  className,
}: GoogleLoginButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${redirectTo}`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('Google login error:', error.message);
        setIsLoading(false);
      }
      // If successful, browser will redirect to Google OAuth
    } catch (error) {
      console.error('Unexpected error during Google login:', error);
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleGoogleLogin}
      variant={variant}
      className={className}
      type="button"
      disabled={isLoading}
    >
      <Chrome className="mr-2 h-4 w-4" />
      {isLoading ? 'Connecting...' : 'Continue with Google'}
    </Button>
  );
}

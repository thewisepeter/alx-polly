'use client';

import { useAuth } from './auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
) => {
  const WithAuth: React.FC<P> = (props) => {
    const { user, session } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!session) {
        router.replace('/auth/signin');
      }
    }, [session, router]);

    if (!session) {
      return null; // or a loading spinner
    }

    return <WrappedComponent {...props} />;
  };

  return WithAuth;
};

export default withAuth;

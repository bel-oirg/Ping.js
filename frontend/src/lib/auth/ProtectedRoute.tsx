'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
	children: React.ReactNode;
	fallbackUrl?: string;
}

export function ProtectedRoute({
	children,
	fallbackUrl = '/dashboard'
}: ProtectedRouteProps): React.ReactNode {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (isLoading) return;

		if (!isAuthenticated) {
			localStorage.setItem('redirectAfrerLogin','/dashboard');
			router.replace('/login');
		}
	}, [isAuthenticated, isLoading, router, fallbackUrl, pathname]);

	if (isLoading || !isAuthenticated) return null;
	return children;
}

interface PublicRouteProps {
	children: React.ReactNode;
	redirectAuthenticatedTo?: string;
}

export function PublicRoute({
	children,
	redirectAuthenticatedTo = '/dashboard'
}: PublicRouteProps): React.ReactNode {
	const { isAuthenticated, isLoading } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (isLoading) return;

		if (isAuthenticated) {
			if (typeof window !== 'undefined') {
				const redirectPath = localStorage.getItem('redirectAfterLogin');
				if (redirectPath) {
					localStorage.removeItem('redirectAfterLogin');
					router.replace(redirectPath);
				} else {
					router.replace(redirectAuthenticatedTo);
				}
			} else {
				router.replace(redirectAuthenticatedTo);
			}
		}
	}, [isAuthenticated, isLoading, router, redirectAuthenticatedTo]);

	if (isLoading || isAuthenticated) return null;
	return children;
} 
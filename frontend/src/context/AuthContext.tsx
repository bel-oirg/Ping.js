'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { AuthService } from '@/lib/api/AuthService';
import { TokenManager } from '@/lib/api/TokenManager';
import { LoginRequest, RegisterRequest } from '@/types/Auth';
import { clearProfileData, storeProfileData } from '@/utils/profileStorage';
import { DashboardService } from '@/lib/api/DashboardService';
import { disconnectSocket } from '@/lib/socket';

export interface User {
	id: string;
	username: string;
	email: string;
	firstName: string;
	lastName: string;
	avatar: string;
	bio: string;
	background: string;
}

interface AuthContextState {
	user: User | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	error: string | null;
	login: (data: LoginRequest) => Promise<void>;
	loginWithToken: (token: string) => Promise<void>;
	verifyTwoFactor: (code: string) => Promise<void>;
	register: (data: RegisterRequest) => Promise<void>;
	logout: () => Promise<void>;
	getOTP: (email: string) => Promise<boolean>;
	changePassword: (email: string, code: string, newPassword: string) => Promise<void>;
	clearError: () => void;
}

const AuthContext = createContext<AuthContextState | undefined>(undefined);
const authService = new AuthService();
const dashboardService = new DashboardService();

export function AuthProvider({ children }: { children: ReactNode }): React.ReactElement {
	const [user, setUser] = useState<User | null>(null);
	const [isLoading, setIsLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const router = useRouter();

	const createUserFromToken = async (token: string) => {
		try {
			const payload = JSON.parse(atob(token.split('.')[1]));
			const userId = payload.id || '1';

			return {
				id: userId,
				username: payload.username || '',
				email: payload.email || '',
				firstName: '',
				lastName: '',
				avatar: '',
				bio: '',
				background: '',
			};
		} catch (err) {
			return {
				id: '1',
				username: '',
				email: '',
				firstName: '',
				lastName: '',
				avatar: '',
				bio: '',
				background: '',
			};
		}
	};

	useEffect(() => {
		const handleTokenExpired = () => {
			setUser(null);
			clearProfileData();
			router.push('/login');
		};

		TokenManager.initTokenExpirationCheck();
		
		window.addEventListener('auth:expired', handleTokenExpired);
		
		return () => {
			window.removeEventListener('auth:expired', handleTokenExpired);
		};
	}, [router]);

	useEffect(() => {
		const initAuth = async () => {
			try {
				if (TokenManager.isAuthenticated()) {
					const token = TokenManager.getToken();
					if (token) {
						authService.setAuthToken(token);
						const userData = await createUserFromToken(token);
						setUser(userData);
					}
				}
			} catch (err) {
				TokenManager.clearTokens();
				clearProfileData();
			} finally {
				setIsLoading(false);
			}
		};

		initAuth();
	}, []);

	const fetchAndStoreProfileData = async () => {
		try {
			const response = await dashboardService.getCard();
			if (response.status.success && response.data) {
				storeProfileData(response.data);
			}
		} catch (err) {
			// silent error
		}
	};

	const loginWithToken = async (token: string): Promise<void> => {
		setIsLoading(true);
		setError(null);

		try {
			TokenManager.updateToken(token);
			authService.setAuthToken(token);
			const userData = await createUserFromToken(token);
			setUser(userData);
			await fetchAndStoreProfileData();
			router.replace('/dashboard');
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Authentication failed');
		} finally {
			setIsLoading(false);
		}
	};

	const login = async (data: LoginRequest): Promise<void> => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await authService.login(data);
			if (response.status.success && response.data) {
				if (response.data.token) {
					await loginWithToken(response.data.token);
				} 
				else if (response.data.otp_token) {
					localStorage.setItem('otp_token', response.data.otp_token);
					// router.replace('/login/2fa');
					window.location.href = '/login/2fa'
				} else {
					throw new Error('Invalid response from server');
					window.location.href = '/login'
				}
			} else {
				setError(response.status.message || 'Login failed');
				window.location.href = '/login'
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Login failed');
			setIsLoading(false);
			throw err;
		}
	};

	const verifyTwoFactor = async (code: string): Promise<void> => {
		setIsLoading(true);
		setError(null);
		try {
			const otpToken = localStorage.getItem('otp_token');
			
			if (!otpToken) {
				throw new Error('OTP session expired. Please login again.');
			}
			
			const response = await authService.verifyTwoFactor(otpToken, code);
			
			if (response.status.success && response.data?.token) {
				localStorage.removeItem('otp_token');
				await loginWithToken(response.data.token);
			} else {
				throw new Error(response.status.message || 'Verification failed');
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Verification failed');
			setIsLoading(false);
			throw err;
		}
	};

	const register = async (data: RegisterRequest): Promise<void> => {
		setIsLoading(true);
		setError(null);
		try {
			const response = await authService.register(data);
			if (response.status.success) {
				router.push('/login');
			} else {
				throw new Error(response.status.message);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Registration failed');
		} finally {
			setIsLoading(false);
		}
	};

	const logout = async (): Promise<void> => {
		setIsLoading(true);
		try {
			TokenManager.clearTokens();
			authService.removeAuthToken();
			clearProfileData();
			setUser(null);
			disconnectSocket();
		} catch (err) {
		} finally {
			setIsLoading(false);
			router.push('/login');
		}
	};

	const getOTP = async (email: string): Promise<boolean> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await authService.sendResetEmail(email);
			return response.status.success;
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to get OTP');
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	const changePassword = async (email: string, code: string, newPassword: string): Promise<void> => {
		setIsLoading(true);
		setError(null);

		try {
			const response = await authService.resetPassword({
				email,
				code,
				password: newPassword,
				repassword: newPassword
			});

			if (response.status.success) {
				router.push('/dashboard');
			} else {
				throw new Error(response.status.message);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to change password');
			throw err;
		} finally {
			setIsLoading(false);
		}
	};

	const clearError = () => setError(null);

	const value: AuthContextState = {
		user,
		isLoading,
		isAuthenticated: !!user,
		error,
		login,
		loginWithToken,
		verifyTwoFactor,
		register,
		logout,
		getOTP,
		changePassword,
		clearError
	};

	return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextState {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
} 
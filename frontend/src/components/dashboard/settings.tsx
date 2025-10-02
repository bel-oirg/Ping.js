'use client'

import React, { useState, useEffect } from 'react'
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from "@/components/ui/card"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLang } from '@/context/langContext'

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	User,
	Save,
	Loader2,
	KeyRound
} from "lucide-react"
import { useSettings } from '@/hooks/useSettings'
import {
	PersonalInfoProps,
	PasswordProps,
	PersonalInfoFormValues,
	PasswordFormValues,
	personalInfoSchema,
	passwordSchema
} from '@/types/Dashboard'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import en from '@/i18n/en'
import fr from '@/i18n/fr'
import { TwoFactorSettings } from './TwoFactorSettings'
import { CliTokenSettings } from './CliTokenSettings'

function PersonalInfoForm({ initialData, onSubmit, isLoading, error }: PersonalInfoProps) {
	const { lang } = useLang()
	const t = lang === 'en' ? en.settings : fr.settings
	const form = useForm<PersonalInfoFormValues>({
		resolver: zodResolver(personalInfoSchema),
		defaultValues: {
			first_name: initialData.first_name,
			last_name: initialData.last_name,
			username: initialData.username,
			email: initialData.email || ''
		},
		mode: "onChange"
	})

	const handleSubmit = async (data: PersonalInfoFormValues) => {
		await onSubmit({
			first_name: data.first_name,
			last_name: data.last_name
		});
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<User className="h-5 w-5 text-primary" />
					{t.personalInfo}
				</CardTitle>
				<CardDescription>
					{t.updatePersonal}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				{error && (
					<div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive mb-4">
						{error}
					</div>
				)}
				<Form {...form}>
					<form className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t.firstName}</FormLabel>
										<FormControl>
											<Input 
												className="text-white selection:bg-foreground" 
												placeholder={t.firstName} 
												{...field} 
												maxLength={20}
											/>
										</FormControl>
										<FormMessage />
										<p className="text-xs text-muted-foreground mt-1">
											{t.anyCharsAllowed}
										</p>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="last_name"
								render={({ field }) => (
									<FormItem>
										<FormLabel>{t.lastName}</FormLabel>
										<FormControl>
											<Input 
												className="text-white selection:bg-foreground" 
												placeholder={t.lastName} 
												{...field} 
												maxLength={20}
											/>
										</FormControl>
										<FormMessage />
										<p className="text-xs text-muted-foreground mt-1">
											{t.anyCharsAllowed}
										</p>
									</FormItem>
								)}
							/>
						</div>
						<FormField
							control={form.control}
							name="username"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t.username}</FormLabel>
									<FormControl>
										<Input
											className="text-white selection:bg-foreground bg-muted/40"
											placeholder={t.username}
											{...field}
											disabled
											readOnly
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t.email}</FormLabel>
									<FormControl>
										<Input
											type="email"
											className="text-white selection:bg-foreground bg-muted/40"
											placeholder="email@example.com"
											{...field}
											disabled
											readOnly
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="mt-auto bg-card text-white">
				<Button
					onClick={form.handleSubmit(handleSubmit)}
					disabled={isLoading || !form.formState.isValid}
					className="flex items-center gap-2 ml-auto bg-card text-white"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					{t.saveProfile}
				</Button>
			</CardFooter>
		</Card>
	)
}

function PasswordChangeForm({ onSubmit, isLoading, error }: PasswordProps) {
	const { lang } = useLang()
	const t = lang === 'en' ? en.settings : fr.settings
	const form = useForm<PasswordFormValues>({
		resolver: zodResolver(passwordSchema),
		defaultValues: {
			old_pass: "",
			new_pass: "",
			re_pass: ""
		}
	})

	const handleSubmit = async (data: PasswordFormValues) => {
		try {
			await onSubmit(data);
			form.reset();
		} catch (err) {
			// console.log(err);
		}
	}

	return (
		<Card className="flex flex-col h-full">
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<KeyRound className="h-5 w-5 text-primary" />
					{t.changePassword}
				</CardTitle>
				<CardDescription>
					{t.updatePassword}
				</CardDescription>
			</CardHeader>
			<CardContent className="flex-1">
				{error && (
					<div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive mb-4">
						{error}
					</div>
				)}
				<Form {...form}>
					<form className="space-y-4">
						<FormField
							control={form.control}
							name="old_pass"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t.currentPassword}</FormLabel>
									<FormControl>
										<Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="new_pass"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t.newPassword}</FormLabel>
									<FormControl>
										<Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="re_pass"
							render={({ field }) => (
								<FormItem>
									<FormLabel>{t.confirmNewPassword}</FormLabel>
									<FormControl>
										<Input type="password" className="text-white selection:bg-foreground" placeholder="••••••••" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</form>
				</Form>
			</CardContent>
			<CardFooter className="mt-auto">
				<Button
					onClick={form.handleSubmit(handleSubmit)}
					disabled={isLoading}
					className="flex items-center gap-2 ml-auto bg-card text-white"
				>
					{isLoading ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Save className="h-4 w-4" />
					)}
					{t.update}
				</Button>
			</CardFooter>
		</Card>
	)
}

export function SettingsComponent() {
	const { lang } = useLang()
	const t = lang === 'en' ? en.settings : fr.settings
	const {
		userData,
		isLoading,
		error,
		updateProfile,
		changePassword,
		fetchUserData
	} = useSettings();

	const { logout } = useAuth();
	const router = useRouter();

	useEffect(() => {
		fetchUserData();
	}, [fetchUserData]);

	if (isLoading && !userData) {
		return (
			<div className="flex justify-center items-center h-64">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		)
	}

	if (error || !userData) {
		return (
			<div className="bg-destructive/10 border border-destructive rounded-xl p-4 text-destructive">
				{error || t.failedToLoadUser}
			</div>
		)
	}

	return (
		<div className="container mt-8 mx-auto w-full h-full">
			<div className="space-y-8">
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<PersonalInfoForm
						initialData={userData}
						onSubmit={updateProfile}
						isLoading={isLoading}
						error={error}
					/>

					{!userData.is_oauth && (
						<PasswordChangeForm
							onSubmit={async (data) => {
								try {
									await changePassword({
										oldPassword: data.old_pass,
										newPassword: data.new_pass
									});
									await logout();
									router.push('/dashboard');
								} catch (err) {
									// console.log(err);
								}
							}}
							isLoading={isLoading}
							error={error}
						/>
					)}

					{userData.is_oauth && (
						<Card className="flex flex-col h-full">
							<CardHeader>
								<CardTitle className="flex items-center gap-2">
									<KeyRound className="h-5 w-5 text-primary" />
									{t.changePassword}
								</CardTitle>
							</CardHeader>
							<CardContent className="flex-1">
								<div className="p-4 bg-muted/50 rounded-md text-sm text-muted-foreground">
									{t.oauthPassword}
								</div>
							</CardContent>
						</Card>
					)}
				</div>
				
				<div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
					<TwoFactorSettings 
						isEnabled={userData.is_otp_active || false}
						// isOAuthAccount={userData.is_oauth || false}
					/>
					<CliTokenSettings />
				</div>
			</div>
		</div>
	)
}

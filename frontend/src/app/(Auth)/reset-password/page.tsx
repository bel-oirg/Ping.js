'use client'

import { useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useLang } from "@/context/langContext"
import en from "@/i18n/en/auth"
import fr from "@/i18n/fr/auth"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form"
import { passwordResetSchema, PasswordResetFormValues } from "@/utils/validation"

// Loading component for Suspense
function LoadingFallback() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center">
      <div className="animate-pulse text-center">
        <div className="h-8 w-32 bg-gray-300 dark:bg-gray-700 rounded mb-4 mx-auto"></div>
        <div className="h-4 w-48 bg-gray-300 dark:bg-gray-700 rounded mx-auto"></div>
      </div>
    </div>
  )
}

function ResetPasswordContent() {
	const { changePassword, isLoading, error } = useAuth()
	const router = useRouter()
	const searchParams = useSearchParams()
	const email = searchParams.get('email') || ''
	const otpCode = searchParams.get('code') || ''
	const { lang } = useLang()
	const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword

	const form = useForm<PasswordResetFormValues>({
		resolver: zodResolver(passwordResetSchema),
		defaultValues: {
			password: "",
			confirmPassword: "",
		},
	})

	// Redirect if no email or OTP code is provided
	useEffect(() => {
		if (!email || !otpCode) {
			router.push('/forgot-password')
		}
	}, [email, otpCode, router])

	// Handle API errors
	useEffect(() => {
		if (error) {
			form.setError("root", { message: error })
		}
	}, [error, form])

	// Don't render anything if no email or OTP code is provided
	if (!email || !otpCode) return null

	const onSubmit = async (values: PasswordResetFormValues) => {
		if (values.password !== values.confirmPassword) {
			form.setError("confirmPassword", { message: "Passwords do not match" })
			return
		}

		try {
			await changePassword(email, otpCode, values.password)
			return true
		} catch (err) {
			const errorMessage = err instanceof Error ? err.message : "Failed to reset password"
			form.setError("root", { message: errorMessage })
			return false
		}
	}

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center">
			<div className="w-full max-w-md">
				<Card className="w-full shadow-md border-0">
					<CardHeader className="pb-2 sm:pb-4 space-y-1">
						<CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
							{content?.passwordTitle || "Reset Your Password"}
						</CardTitle>
						<CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
							{content?.passwordSubtitle || "Enter your new password below"}
						</CardDescription>
					</CardHeader>
					<CardContent className="px-4 sm:px-6">
						<Form {...form}>
							<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
								<PasswordField
									form={form}
									content={content}
									name="password"
									label={content?.passwordLabel || "New Password"}
									placeholder={content?.passwordPlaceholder || "Enter new password"}
								/>
								<PasswordField
									form={form}
									content={content}
									name="confirmPassword"
									label={content?.confirmPasswordLabel || "Confirm Password"}
									placeholder={content?.confirmPasswordPlaceholder || "Confirm new password"}
								/>
								<SubmitButton isLoading={isLoading} content={content} />
								{form.formState.errors.root && (
									<p className="text-destructive text-xs text-center">
										{form.formState.errors.root.message}
									</p>
								)}
							</form>
						</Form>
					</CardContent>
					<CardFooter className="pt-0 pb-4 sm:pb-5 flex flex-col justify-center items-center space-y-2">
						<Button
							variant="link"
							className="text-xs sm:text-sm"
							onClick={() => router.push('/dashboard')}
						>
							{content?.backToLogin || "Back to Login"}
						</Button>
					</CardFooter>
				</Card>
			</div>
		</div>
	)
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordContent />
    </Suspense>
  )
}

// Password field component
function PasswordField({ form, content, name, label, placeholder }: {
	form: any,
	content: any,
	name: "password" | "confirmPassword",
	label: string,
	placeholder: string
}) {
	return (
		<FormField
			control={form.control}
			name={name}
			render={({ field }) => (
				<FormItem>
					<FormLabel className="text-xs sm:text-sm">{label}</FormLabel>
					<FormControl>
						<Input
							type="password"
							placeholder={placeholder}
							{...field}
						/>
					</FormControl>
					<FormMessage className="text-xs" />
				</FormItem>
			)}
		/>
	)
}

function SubmitButton({ isLoading, content }: { isLoading: boolean, content: any }) {
	return (
		<div className="flex justify-center w-full">
			<Button
				type="submit"
				className="w-full bg-foreground text-background"
				disabled={isLoading}
			>
				{isLoading ? (
					<span className="flex items-center justify-center bg-foreground text-background">
						<span className="mr-2">Resetting</span>
						<span className="animate-spin">...</span>
					</span>
				) : (
					content?.resetPasswordButton || "Reset Password"
				)}
			</Button>
		</div>
	)
} 
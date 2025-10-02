'use client'

import { useState, useEffect } from "react"
import { cn } from "@/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp"
import { otpSchema, passwordResetSchema, OtpFormValues, PasswordResetFormValues } from "@/utils/validation"

interface OtpVerificationFormProps extends React.ComponentProps<"div"> {
  email: string
  handleVerifyOtp: (otp: string) => Promise<boolean>
  handleResetPassword: (password: string) => Promise<boolean>
  handleBackToEmail: () => void
  verificationStep: 'otp' | 'password'
  isLoading?: boolean
  error?: string | null
}

export function OtpVerificationForm({
  className,
  email,
  handleVerifyOtp,
  handleResetPassword,
  handleBackToEmail,
  verificationStep = 'otp',
  isLoading,
  error,
  ...props
}: OtpVerificationFormProps) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.forgotPassword : en.forgotPassword
  
  return (
    <div className={cn("flex justify-center items-center min-h-screen w-full px-4 py-6", className)} {...props}>
      <div className="w-full max-w-md">
        {verificationStep === 'otp' ? (
          <OtpStep 
            content={content} 
            email={email}
            handleVerifyOtp={handleVerifyOtp}
            onBack={handleBackToEmail}
            isLoading={isLoading}
            error={error}
          />
        ) : (
          <PasswordStep
            content={content}
            handleResetPassword={handleResetPassword}
            isLoading={isLoading}
            error={error}
          />
        )}
      </div>
    </div>
  )
}

// OTP Step Component
function OtpStep({ 
  content, 
  email, 
  handleVerifyOtp, 
  onBack, 
  isLoading, 
  error 
}: { 
  content: typeof en.forgotPassword
  email: string
  handleVerifyOtp: (otp: string) => Promise<boolean>
  onBack: () => void
  isLoading?: boolean
  error?: string | null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const actualLoading = isLoading || isSubmitting
  
  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { otp: "" },
  })

  // Handle API errors
  useEffect(() => {
    if (!error) return
    
    if (error.includes('code expired') || error.includes('verification code has expired')) {
      form.setError("root", { message: "Verification code has expired. Please request a new code." })
    } else if (error.includes('invalid') || error.includes('incorrect')) {
      form.setError("root", { message: "Invalid verification code. Please check and try again." })
    } else {
      form.setError("root", { message: error })
    }
  }, [error, form])

  const onSubmit = async (values: OtpFormValues) => {
    if (values.otp.length !== 6) {
      form.setError("otp", { message: "Verification code must be 6 characters" })
      return
    }
    
    try {
      setIsSubmitting(true)
      await handleVerifyOtp(values.otp)
    } catch {
      form.setError("root", { message: "Failed to verify code. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-2 sm:pb-4 space-y-1">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
          {content?.otpTitle || "Verify Your Email"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.otpSubtitle || `Enter the verification code sent to ${email}`}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col space-y-4 justify-center">
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-center">
                    <FormLabel className="text-xs sm:text-sm text-center">
                      {content?.otpLabel || "Verification Code"}
                    </FormLabel>
                    <FormControl>
                      <InputOTP maxLength={6} className="flex justify-center" {...field}>
                        <InputOTPGroup className="gap-0">
                          {[...Array(6)].map((_, i) => (
                            <InputOTPSlot key={i} index={i} />
                          ))}
                        </InputOTPGroup>
                      </InputOTP>
                    </FormControl>
                    <FormMessage className="text-xs text-center" />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                className="w-full bg-foreground text-background" 
                disabled={actualLoading}
              >
                {actualLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">Verifying</span>
                    <span className="animate-spin">...</span>
                  </span>
                ) : (
                  content?.verifyButton || "Verify Code"
                )}
              </Button>

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="pt-0 pb-4 sm:pb-5 flex flex-col justify-center items-center space-y-2">
        <Button 
          variant="link" 
          className="text-xs sm:text-sm" 
          onClick={onBack}
        >
          {content?.backToEmail || "Back to Email"}
        </Button>
        <Button 
          variant="link" 
          className="text-xs sm:text-sm" 
          onClick={onBack}
        >
          {content?.resendCode || "Didn't receive a code? Request a new one"}
        </Button>
      </CardFooter>
    </Card>
  )
}

// Password Step Component
function PasswordStep({ 
  content, 
  handleResetPassword, 
  isLoading, 
  error 
}: { 
  content: typeof en.forgotPassword
  handleResetPassword: (password: string) => Promise<boolean>
  isLoading?: boolean
  error?: string | null
}) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const actualLoading = isLoading || isSubmitting
  
  const form = useForm<PasswordResetFormValues>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  useEffect(() => {
    if (error) {
      form.setError("root", { message: error })
    }
  }, [error, form])

  const onSubmit = async (values: PasswordResetFormValues) => {
    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords don't match" })
      return
    }
    
    try {
      setIsSubmitting(true)
      await handleResetPassword(values.password)
    } catch {
      form.setError("root", { message: "Failed to reset password. Please try again." })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card className="w-full shadow-md border-0">
      <CardHeader className="pb-2 sm:pb-4 space-y-1">
        <CardTitle className="text-lg sm:text-xl font-bold text-foreground text-center">
          {content?.passwordTitle || "Reset Your Password"}
        </CardTitle>
        <CardDescription className="text-center text-muted-foreground text-xs sm:text-sm">
          {content?.passwordSubtitle || "Enter your new password"}
        </CardDescription>
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
            <div className="flex flex-col space-y-4">
              <PasswordField
                form={form}
                name="password"
                label={content?.passwordLabel || "New Password"}
                placeholder={content?.passwordPlaceholder || "Enter your new password"}
              />
              
              <PasswordField
                form={form}
                name="confirmPassword"
                label={content?.confirmPasswordLabel || "Confirm Password"}
                placeholder={content?.confirmPasswordPlaceholder || "Confirm your new password"}
              />

              <Button 
                type="submit" 
                className="w-full bg-foreground text-background" 
                disabled={actualLoading}
              >
                {actualLoading ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2">Resetting</span>
                    <span className="animate-spin">...</span>
                  </span>
                ) : (
                  content?.resetPasswordButton || "Reset Password"
                )}
              </Button>

              {form.formState.errors.root && (
                <p className="text-destructive text-xs text-center">
                  {form.formState.errors.root.message}
                </p>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}

function PasswordField({ 
  form, 
  name, 
  label, 
  placeholder 
}: { 
  form: any
  name: "password" | "confirmPassword"
  label: string
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
              className="text-sm sm:text-base h-9 sm:h-10"
              {...field}
            />
          </FormControl>
          <FormMessage className="text-xs" />
        </FormItem>
      )}
    />
  )
} 
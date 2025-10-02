// @ts-nocheck
'use client'

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useLang } from "@/context/langContext"
import en from "@/i18n/en/auth"
import fr from "@/i18n/fr/auth"
import Link from "next/link"
import { toast } from 'sonner';

export function RegisterForm({
  className = "",
  handleRegister,
  isLoading: externalIsLoading,
  error: externalError,
  ...props
}) {
  const { lang } = useLang()
  const content = lang === 'fr' ? fr.register : en.register
  const [internalIsLoading, setInternalIsLoading] = useState(false)
  const isLoading = externalIsLoading !== undefined ? externalIsLoading : internalIsLoading
  
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    repassword: "",
    first_name: "",
    last_name: ""
  })
  
  const [errors, setErrors] = useState({})

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    // Username validation
    if (!formData.username) {
      newErrors.username = "Username is required"
    } else if (formData.username.length < 4 || formData.username.length > 15) {
      newErrors.username = "Username must be between 4 and 15 characters"
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }    
    if (!formData.password) {
      newErrors.password = "Password is required"
    } else if (formData.password.length < 10) {
      newErrors.password = "Password must be at least 10 characters"
    } else {
      if (!/[a-z]/.test(formData.password)) {
        newErrors.password = "Password must contain lowercase letters"
      } else if (!/[A-Z]/.test(formData.password)) {
        newErrors.password = "Password must contain uppercase letters"
      } else if (!/[0-9]/.test(formData.password)) {
        newErrors.password = "Password must contain numbers"
      }
    }
    
    // Confirm password validation
    if (formData.password !== formData.repassword) {
      newErrors.repassword = "Passwords do not match"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    if (!handleRegister) return
    
    try {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(true)
      }
      await handleRegister(formData)
    } catch (error) {
      toast.error('Registration failed');
      
      if (error.message?.includes('Email does not comply')) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      } else if (error.message?.includes('Passwords do not match')) {
        setErrors(prev => ({ ...prev, repassword: "Passwords do not match" }))
      } else if (error.message?.includes('Password must contain')) {
        setErrors(prev => ({ ...prev, password: error.message }))
      } else {
        setErrors(prev => ({ ...prev, general: error.message || "Registration failed" }))
      }
    } finally {
      if (externalIsLoading === undefined) {
        setInternalIsLoading(false)
      }
    }
  }
  
  // Handle external errors
  useState(() => {
    if (externalError) {
      if (externalError.includes('Email already exists') || 
          externalError.includes('email already in use')) {
        setErrors(prev => ({ ...prev, email: "Email already in use" }))
      } else if (externalError.includes('Username already exists') || 
                externalError.includes('username already in use')) {
        setErrors(prev => ({ ...prev, username: "Username already in use" }))
      } else if (externalError.includes('Password must contain')) {
        setErrors(prev => ({ ...prev, password: externalError }))
      } else if (externalError.includes('Email does not comply')) {
        setErrors(prev => ({ ...prev, email: "Please enter a valid email address" }))
      } else if (externalError.includes('Passwords do not match')) {
        setErrors(prev => ({ ...prev, repassword: "Passwords do not match" }))
      } else {
        setErrors(prev => ({ ...prev, general: externalError }))
      }
    }
  }, [externalError])
  
  return (
    <div className={`flex justify-center items-center min-h-screen w-full px-4 py-6 ${className}`} {...props}>
      <div className="w-full max-w-md mx-auto">
        <Card className="w-full shadow-md border-0">
          <CardHeader className="pb-2 space-y-1">
            <CardTitle className="text-xl font-bold text-foreground text-center">
              {content?.title || "Create Account"}
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              {content?.subtitle || "Enter your details to create your account"}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="px-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Username field */}
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium block mb-1">
                  Username
                </label>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  className={errors.username ? "border-red-500" : ""}
                />
                {errors.username && (
                  <p className="text-xs text-red-500 mt-1">{errors.username}</p>
                )}
              </div>
              
              {/* Email field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium block mb-1">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? "border-red-500" : ""}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email}</p>
                )}
              </div>
              
              {/* First and Last name fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="first_name" className="text-sm font-medium block mb-1">
                    First Name
                  </label>
                  <Input
                    id="first_name"
                    name="first_name"
                    type="text"
                    placeholder="First name"
                    value={formData.first_name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="last_name" className="text-sm font-medium block mb-1">
                    Last Name
                  </label>
                  <Input
                    id="last_name"
                    name="last_name"
                    type="text"
                    placeholder="Last name"
                    value={formData.last_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              {/* Password field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium block mb-1">
                  Password
                </label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "border-red-500" : ""}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password}</p>
                )}
                
                {/* Simple password strength indicator */}
                {formData.password && (
                  <div className="space-y-1 pt-2">
                    <div className="h-1 flex gap-1">
                      <div className={`h-full flex-1 rounded-sm transition-colors ${
                        formData.password.length > 0 ? 'bg-red-500' : 'bg-muted'
                      }`}></div>
                      <div className={`h-full flex-1 rounded-sm transition-colors ${
                        formData.password.length >= 8 ? 'bg-orange-500' : 'bg-muted'
                      }`}></div>
                      <div className={`h-full flex-1 rounded-sm transition-colors ${
                        formData.password.length >= 8 && 
                        /[A-Z]/.test(formData.password) && 
                        /[a-z]/.test(formData.password) ? 'bg-yellow-500' : 'bg-muted'
                      }`}></div>
                      <div className={`h-full flex-1 rounded-sm transition-colors ${
                        formData.password.length >= 10 && 
                        /[A-Z]/.test(formData.password) && 
                        /[a-z]/.test(formData.password) && 
                        /[0-9]/.test(formData.password) ? 'bg-green-500' : 'bg-muted'
                      }`}></div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Confirm Password field */}
              <div className="space-y-2">
                <label htmlFor="repassword" className="text-sm font-medium block mb-1">
                  Confirm Password
                </label>
                <Input
                  id="repassword"
                  name="repassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.repassword}
                  onChange={handleChange}
                  className={errors.repassword ? "border-red-500" : ""}
                />
                {errors.repassword && (
                  <p className="text-xs text-red-500 mt-1">{errors.repassword}</p>
                )}
              </div>
              
              {errors.general && (
                <p className="text-xs text-red-500 text-center">{errors.general}</p>
              )}
              
              {/* Submit button */}
              <Button 
                type="submit" 
                className="w-full bg-foreground text-background hover:bg-primary/90" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle 
                        className="opacity-25" 
                        cx="12" 
                        cy="12" 
                        r="10" 
                        stroke="currentColor" 
                        strokeWidth="4"
                      />
                      <path 
                        className="opacity-75" 
                        fill="currentColor" 
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    {content?.registerButton || "Registering..."}
                  </span>
                ) : content?.registerButton || "Sign Up"}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm font-medium">
              {content?.haveAccount || "Already have an account?"}{" "}
              <Link href="/login" className="text-foreground underline underline-offset-2 hover:text-primary/80 transition-colors">
                {content?.signIn || "Sign in"}
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
} 
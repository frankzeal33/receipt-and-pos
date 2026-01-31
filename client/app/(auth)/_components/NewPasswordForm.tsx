"use client"

export const dynamic = "force-dynamic"; // disables static rendering for this route

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Eye, EyeOff } from "lucide-react"
import { FormEvent, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { z } from "zod"
import { debounce } from "lodash"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"

const passwordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8,  "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirmNewPassword: z.string().min(1, "Invalid confirm password")
  })
  .refine(
    data => data.confirmNewPassword === data.newPassword,
    {
      path: ["confirmNewPassword"],   // put the error on this field
      message: "Confirm Password does not match"
    }
  )

type PasswordFormValues = z.infer<typeof passwordSchema>

export function NewPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter()

  const [form, setForm] = useState<PasswordFormValues>({
    newPassword: '',
    confirmNewPassword: ''
  })
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({})
  const [touched, setTouched] = useState<Partial<Record<keyof PasswordFormValues, boolean>>>({})
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    if (!token) {
      router.replace("/login")
    }
  }, [token])

  // Validation checks for live feedback
  const passwordChecks = {
    minLength: form.newPassword.length >= 8,
    hasUppercase: /[A-Z]/.test(form.newPassword),
    hasLowercase: /[a-z]/.test(form.newPassword),
    hasNumber: /[0-9]/.test(form.newPassword),
    hasSpecialChar: /[^A-Za-z0-9]/.test(form.newPassword),
  }

  const validateForm = debounce((updatedForm: PasswordFormValues) => {
    const result = passwordSchema.safeParse(updatedForm)
    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PasswordFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
    } else {
      setErrors({})
    }
  }, 300)

  useEffect(() => {
    validateForm(form)
    return () => validateForm.cancel()
  }, [form])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const result = passwordSchema.safeParse(form)

    if (!result.success) {
      const fieldErrors: typeof errors = {}
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof PasswordFormValues
        fieldErrors[field] = err.message
      })
      setErrors(fieldErrors)
      setTouched({
        newPassword: true,
        confirmNewPassword: true,
      })
      return
    }

    setErrors({})

    try {

      setIsSubmitting(true)
      
      const data = {
        newPassword: form.newPassword,
        resetToken: token
      }

      const result = await axiosClient.post("/users/forgot-password/reset", data)

      toast.success(result.data.message);

      router.push('/reset-password/reset-successful')
      setForm({
        newPassword: '',
        confirmNewPassword: ''
      })

    } catch (error: any) {
      toast.error(error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    } 
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Create new password</h1>
        <p className="text-balance text-sm font-normal">
          One more step to go and you’re back into your account
        </p>
      </div>

      <div className="grid gap-6">
        {/* New Password */}
        <div className="grid gap-2">
          <Label htmlFor="newPassword">New Password</Label>
          <div className="relative">
            <Input
              id="newPassword"
              type={showNewPassword ? "text" : "password"}
              value={form.newPassword}
              onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
              onBlur={() => setTouched(prev => ({ ...prev, newPassword: true }))}
              placeholder="*********************"
              className="pr-12"
            />
            <button
              type="button"
              className="absolute top-2 right-3 text-ring"
              onClick={() => setShowNewPassword(!showNewPassword)}
            >
              {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.newPassword && errors.newPassword && (
            <p className="text-xs text-red-500">{errors.newPassword}</p>
          )}
        </div>

        {/* Confirm New Password */}
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Confirm New Password</Label>
          <div className="relative">
            <Input
              id="confirmPassword"
              type={showConfirmNewPassword ? "text" : "password"}
              value={form.confirmNewPassword}
              onChange={(e) => setForm({ ...form, confirmNewPassword: e.target.value })}
              onBlur={() => setTouched(prev => ({ ...prev, confirmNewPassword: true }))}
              placeholder="*********************"
              className="pr-12"
            />
            <button
              type="button"
              className="absolute top-2 right-3 text-ring"
              onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
            >
              {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.confirmNewPassword && errors.confirmNewPassword && (
            <p className="text-xs text-red-500">{errors.confirmNewPassword}</p>
          )}
        </div>

        {/* Dynamic Password Checklist */}
        <div className="flex gap-x-4 gap-y-2 items-center flex-wrap">
          <div className="space-y-1">
            <ValidationItem label="Minimum of 8 characters long" isValid={passwordChecks.minLength} />
            <ValidationItem label="At least one capital letter" isValid={passwordChecks.hasUppercase} />
          </div>
          <div className="space-y-1">
            <ValidationItem label="At least one number" isValid={passwordChecks.hasNumber} />
            <ValidationItem label="At least one symbol" isValid={passwordChecks.hasSpecialChar} />
          </div>
        </div>

        <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className="w-full" variant="primary">
          {isSubmitting ? "Reseting..." : "Reset password"}
        </Button>
      </div>
    </form>
  )
}

const ValidationItem = ({ label, isValid }: { label: string; isValid: boolean }) => (
  <div className="flex items-center space-x-1">
    <CheckCircle size={13} className={isValid ? "text-green" : "text-gray-400"} />
    <Label className={`text-[10px] ${isValid ? "text-black" : "text-gray-400"}`}>
      {label}
    </Label>
  </div>
)

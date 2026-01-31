"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { z } from "zod"
import { debounce } from "lodash"
import { toast } from "react-toastify"
import { axiosClient } from "@/GlobalApi"
import { useAuthStore } from "@/store/AuthStore"
import { Checkbox } from "@/components/ui/checkbox"

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
  rememberMe: z.boolean()
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  
    const router = useRouter()
    const [errors, setErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof LoginFormValues, boolean>>>({})
    const [form, setForm] = useState<LoginFormValues>({
      email: '',
      password: '',
      rememberMe: false
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
     const [showPassword, setShowPassword] = useState(false)
     
     const userInfo = useAuthStore((state) => state.setUserInfo)

    // Debounced validation
      const validateForm = debounce((updatedForm: LoginFormValues) => {
        const result = loginSchema.safeParse(updatedForm)
        if (!result.success) {
          const fieldErrors: typeof errors = {}
          result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof LoginFormValues
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
      
      const result = loginSchema.safeParse(form)

      if (!result.success) {
        const fieldErrors: typeof errors = {}
        result.error.errors.forEach((err) => {
          const field = err.path[0] as keyof LoginFormValues
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        setTouched({
          email: true,
          password: true,
        })
        return
      }

      setErrors({})

        try {

        setIsSubmitting(true)
        
        const response = await axiosClient.post("/users/login", form)
        toast.success(response.data.message);

        userInfo({
          first_name: response.data.result.firstName,
          last_name: response.data.result.lastName,
          email: response.data.result.email,
          role: response.data.result.role
        });

        router.replace("/dashboard")
        
        setForm({
          email: '',
          password: '',
          rememberMe: false
        })

      } catch (error: any) {
        toast.error(error.response?.data?.error || error.response?.data?.message);

        if(error.response.status === 403 && error.response.data.message === "Please verify your email to log in"){
          try {
            const response = await axiosClient.post("/users/register/resend-otp", { email: form.email })
  
            toast.success(response.data.message)
            router.push(`/verify-email?email=${encodeURIComponent(response.data.result.email)}`)
          } catch (error: any) {
            toast.error(error.response?.data?.message)
          }
          
        }

      } finally {
        setIsSubmitting(false)
      } 
      
    }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Welcome Back!<span className="text-lg ml-1">👋</span></h1>
        <p className="text-balance text-sm font-normal">
          Kindly enter your details to log back in
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} placeholder="Enter email address here" />
          {touched.email && errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input id="password" type={showPassword ? "text" : "password"} value={form.password} onChange={(e: any) => setForm({ ...form, password: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, password: true }))} placeholder="*********************" className="pr-12" />
            <button
              type="button"
              className="absolute top-2 right-3 text-ring"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          {touched.password && errors.password && (
            <p className="text-xs text-red-500">{errors.password}</p>
          )}
        </div>
        <div className="flex items-center gap-2 -mt-3">
          <div className="flex items-center space-x-1">
            <Checkbox id="terms" checked={form.rememberMe} onCheckedChange={(checked) => setForm({ ...form, rememberMe: checked === true })} />
            <label
              htmlFor="terms"
              className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Remember me
            </label>
          </div>
          <Link
            href="/forgot-password"
            className="ml-auto text-xs underline-offset-4 text-green text-right font-medium underline hover:no-underline"
          >
            Forgot your password?
          </Link>
        </div>
        <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className="w-full" variant="primary">
          {isSubmitting ? "Signing In..." : "Sign In"}
        </Button>
      </div>
      <div className="text-sm">
        Don&apos;t have an account?{" "}
        <Link href={"/register"} className="underline underline-offset-4 text-green font-medium hover:no-underline">
          Sign up
        </Link>
      </div>
    </form>
  )
}

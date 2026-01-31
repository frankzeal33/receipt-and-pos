"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FormEvent, useEffect, useState } from "react"
import { z } from "zod"
import { debounce } from "lodash"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"

const emailSchema = z.object({
  email: z.string().email("Invalid email address")
})

type EmailFormValues = z.infer<typeof emailSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const router = useRouter()
    const [errors, setErrors] = useState<Partial<Record<keyof EmailFormValues, string>>>({})
    const [touched, setTouched] = useState<Partial<Record<keyof EmailFormValues, boolean>>>({})
    const [form, setForm] = useState<EmailFormValues>({
      email: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)

      // Debounced validation
      const validateForm = debounce((updatedForm: EmailFormValues) => {
        const result = emailSchema.safeParse(updatedForm)
        if (!result.success) {
          const fieldErrors: typeof errors = {}
          result.error.errors.forEach((err) => {
            const field = err.path[0] as keyof EmailFormValues
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

      const result = emailSchema.safeParse(form)

      if (!result.success) {
        const fieldErrors: typeof errors = {}
        result.error.errors.forEach((err) => {
          const field = err.path[0] as keyof EmailFormValues
          fieldErrors[field] = err.message
        })
        setErrors(fieldErrors)
        setTouched({
          email: true
        })
        return
      }

      setErrors({})

      try {
      
        setIsSubmitting(true)
        
        const response = await axiosClient.post("/users/forgot-password", form)
        console.log("email=",response.data)
        toast.success(response.data.message);
        router.push('/reset-password')
        setForm({
          email: ''
        })
  
      } catch (error: any) {
        toast.error(error.response?.data?.message);
  
      } finally {
        setIsSubmitting(false)
      } 
  
    }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} onSubmit={handleSubmit}>
      <Link href={'/login'} className="text-sm -mt-4 flex gap-1 items-center">
        <ArrowLeft size={16} className="text-normal"/>
        Back
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Reset password</h1>
        <p className="text-balance text-sm font-normal">
          Kindly enter your email to reset your password. Don’t worry, it happens to the best of us. 
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} onBlur={() => setTouched((prev) => ({ ...prev, email: true }))} placeholder="Enter email address" />
          {touched.email && errors.email && (
            <p className="text-xs text-red-500">{errors.email}</p>
          )}
        </div>
        <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className="w-full" variant="primary">
          {isSubmitting ? "Sending Link..." : "Send recovery link"}
        </Button>
      </div>
    </form>
  )
}

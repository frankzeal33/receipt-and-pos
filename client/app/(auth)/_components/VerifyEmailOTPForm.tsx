"use client"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { FormEvent, useCallback, useEffect, useState } from "react"
import { z } from "zod"
import debounce from "lodash/debounce"
import { axiosClient } from "@/GlobalApi"
import { toast } from "react-toastify"
import Countdown from "react-countdown"
import { useAuthStore } from "@/store/AuthStore"

const otpSchema = z.object({
  otp: z.string().min(6, "OTP must be 6 digits"),
})

export function VerifyEmailOTPForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const [otp, setOtp] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string>("")
  const [touched, setTouched] = useState(false)

  const [otpExpiry, setOtpExpiry] = useState<number | null>(null)
  const [resendKey, setResendKey] = useState(0)
  const [loadResend, setLoadResend] = useState(false)

   const userInfo = useAuthStore((state) => state.setUserInfo)

  // Redirect if no email
  useEffect(() => {
    if (!email) {
      router.replace("/register")
    }
  }, [email])

  // Set or get OTP timestamp from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("otp_sent_at")
    const sentTime = stored ? Number(stored) : Date.now()

    if (!stored) {
      localStorage.setItem("otp_sent_at", sentTime.toString())
    }

    setOtpExpiry(sentTime + 30 * 60 * 1000) // 30 mins
  }, [])

  // Debounced validation
  const validateOtp = useCallback(
    debounce((value: string) => {
      const result = otpSchema.safeParse({ otp: value })
      if (!result.success) {
        const message = result.error.formErrors.fieldErrors.otp?.[0] || "Invalid input"
        setError(message)
      } else {
        setError("")
      }
    }, 1000),
    []
  )

  useEffect(() => {
    if (touched) {
      validateOtp(otp)
    }
  }, [otp, touched, validateOtp])

  const handleChange = (value: string) => {
    if (!touched) setTouched(true)
    setOtp(value)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    const result = otpSchema.safeParse({ otp })

    if (!result.success) {
      const message = result.error.formErrors.fieldErrors.otp?.[0] || "Invalid input"
      setError(message)
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const response = await axiosClient.post("/users/register/verify-otp", {
        email,
        otp,
      })

      userInfo({
        first_name: response.data.result.firstName,
        last_name: response.data.result.lastName,
        email: response.data.result.email,
        role: response.data.result.role
      });
      toast.success(response.data.message)

      localStorage.removeItem("otp_sent_at")
      router.replace("/dashboard")
      setOtp("")
    } catch (error: any) {
      toast.error(error.response?.data?.message)
      setOtp("")
      if(error.response?.status === 403 && error.response.data?.message === "Email already verified, Please Login"){
        router.push("/login")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleResend = async () => {
    setLoadResend(true)
    try {
      const response = await axiosClient.post("/users/register/resend-otp", { email })

      console.log("otp=",response.data)
      // Only proceed if resend was successful
      const now = Date.now()
      localStorage.setItem("otp_sent_at", now.toString())
      setOtpExpiry(now + 30 * 60 * 1000)
      setResendKey(prev => prev + 1)

      toast.success(response.data.message)
      setOtp("")
    } catch (error: any) {
      if(error.response?.status === 403 && error.response.data?.message === "Email already verified, Please Login"){
        router.push("/login")
      }
    } finally {
      setLoadResend(false)
    }
 }

  const renderer = ({ minutes, seconds, completed }: any) => {
    if(loadResend){
      return (
        <div className="flex gap-2 items-center">
          <Loader2 className="animate-spin size-6 text-primary" />
          <span className="text-primary font-medium text-sm">Resending...</span>
        </div>
      )
    }else{
      if (completed) {
        return (
          <button
            onClick={handleResend}
            className="text-primary font-medium hover:underline text-sm"
            type="button"
          >
            Resend OTP
          </button>
        )
      } else {
        return (
          <span className="font-medium text-sm">
            Resend in <span className="text-primary">{minutes}:{seconds < 10 ? `0${seconds}` : seconds}</span>
          </span>
        )
      }
    }
    
  }

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      {...props}
      onSubmit={handleSubmit}
    >
      <Link href={"/register"} className="text-sm -mt-4 flex gap-1 items-center">
        <ArrowLeft size={16} className="text-normal" />
        Back
      </Link>

      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Verify your email</h1>
        <p className="text-balance text-sm font-normal">
          We sent a mail to your preferred email address. Kindly enter the OTP to verify your account.
        </p>
      </div>

      <div className="grid gap-6">
        <div className="grid gap-2">
          <InputOTP maxLength={6} value={otp} onChange={handleChange}>
            <InputOTPGroup className="w-full flex gap-3 justify-between">
              {[...Array(6)].map((_, index) => (
                <InputOTPSlot key={index} index={index} inputMode="numeric" className="rounded-md border size-10 bg-light" />
              ))}
            </InputOTPGroup>
          </InputOTP>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <Button loading={isSubmitting} type="submit" className="w-full" disabled={otp.length < 6 || isSubmitting} variant={"primary"}>
          {isSubmitting ? "Verifying..." : "Confirm"}
        </Button>
      </div>

      <div className="text-sm -mt-4">
        {otpExpiry && (
          <Countdown key={resendKey} date={otpExpiry} renderer={renderer} />
        )}
      </div>
    </form>
  )
}

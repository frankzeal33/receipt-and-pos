"use client"
import { axiosClient } from "@/GlobalApi"
import { cn } from "@/lib/utils"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

export function VerifyRecoveryLink({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      router.replace("/login")
      return
    }
    handleSubmit()
  }, [token])

  const handleSubmit = async () => {

    setLoading(true)

    try {
      const response = await axiosClient.get(`/users/forgot-password/verify?token=${token}`)

      router.replace(`/new-password?token=${encodeURIComponent(response.data.result.resetToken)}`)
    } catch (error: any) {
      setMessage(error.response?.data?.message)
      toast.error(error.response?.data?.message)
      setLoading(false)
    }
  }

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex items-center justify-center">
        {loading && <Loader2 className="animate-spin size-10 text-green" />}
      </div>
      {message && 
        <div className="flex flex-col gap-6">
          <Link href={"/forgot-password"} replace className="text-sm -mt-4 flex gap-1 items-center">
            <ArrowLeft size={16} className="text-normal" />
            Back
          </Link>
          <h2 className="font-semibold text-xl">{message}</h2>
        </div>
      }
    </form>
  )
}

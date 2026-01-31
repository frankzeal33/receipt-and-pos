import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function RecoveryLinkForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <Link href={'/forgot-password'} className="text-sm -mt-4 flex gap-1 items-center">
        <ArrowLeft size={16} className="text-normal"/>
        Back
      </Link>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Recovery link sent!</h1>
        <p className="text-balance text-sm font-normal">
            We sent a mail to your email preferred address. Kindly click on the link or button in your mail to verify your account. 
        </p>
      </div>
      <div className="grid gap-6">
        <a href="mailto:">
          <Button type="button" className="w-full" variant="primary">
            Go to mail
          </Button>
        </a>
      </div>
    </form>
  )
}

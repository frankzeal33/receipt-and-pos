import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function ResetSuccessfulForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Reset Successful</h1>
        <p className="text-balance text-sm font-normal">
            You’ve successfully Reset your password. Let’s start a memorable journey together. 
        </p>
      </div>
      <div className="grid gap-6">
        <Link href="/login">
            <Button type="button" variant={"primary"} className="w-full">
              Sign in
            </Button>
        </Link>
      </div>
    </form>
  )
}

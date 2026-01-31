"use client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  const router = useRouter()

  return (
    <div className="flex p-4 flex-col items-center justify-center h-screen">
      <h2 className="text-2xl font-bold mb-4 text-center">Page Not Found</h2>
      <p className="text-gray-500 mb-6 text-center">
        The page you’re looking for doesn’t exist or has been moved.
      </p>
      <Button onClick={() => router.back()}>Go Back</Button>
    </div>
  )
}

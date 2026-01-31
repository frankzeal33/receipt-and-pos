"use client"
import { FormEvent, useState } from 'react'
import { z } from 'zod'
import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { PaystackButton } from "react-paystack"
import { pricing } from '@/constants/data'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import AuthPricingCard from '@/components/AuthPricingCard'

const priceSchema = z.object({
  email: z.string().email("Invalid email address"),
  amount: z.number().min(100, "Minimum amount is 100").max(1000000, "Maximum amount is 1000000")
})

type priceFormValues = z.infer<typeof priceSchema>

const page = () => {

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  return (
    <div>
      <div>
        <Tabs defaultValue={billing} value={billing} onValueChange={(v) => setBilling(v as "monthly" | "yearly")}>
          <div className="flex justify-center mb-10">
            <TabsList className="bg-light border gap-1 shadow-none">
              <TabsTrigger value="monthly" className='bg-background data-[state=active]:bg-green data-[state=active]:text-white'>Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className='bg-background data-[state=active]:bg-green data-[state=active]:text-white'>Yearly</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={billing}>
            <div className="grid grid-cols-4 gap-4">
              {pricing.map((priceInfo) => (
                <AuthPricingCard
                  key={priceInfo.id}
                  priceInfo={priceInfo}
                  billing={billing}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default page
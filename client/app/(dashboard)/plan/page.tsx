"use client"
import { useState } from 'react'
import { pricing } from '@/constants/data'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import AuthPricingCard from '@/components/AuthPricingCard'

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
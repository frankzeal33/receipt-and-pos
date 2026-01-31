"use client"
import React, { FormEvent, useState } from 'react'
import Banner from '../_components/Banner'
import { pricing } from '@/constants/data'
import PricingCard from '@/components/landing/PricingCard'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

const page = () => {

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")

  return (
    <section className='min-h-[85vh]'>
      <Banner title='Choose Your Plan' desc='We’ve developed transparent and flexible plans to cover the needs of your business.'/>
        
      <div className='mycontainer'>
        <Tabs defaultValue={billing} value={billing} onValueChange={(v) => setBilling(v as "monthly" | "yearly")}>
          <div className="flex justify-center mb-10">
            <TabsList className="bg-light border gap-1 shadow-none">
              <TabsTrigger value="monthly" className='bg-background data-[state=active]:bg-green data-[state=active]:text-white'>Monthly</TabsTrigger>
              <TabsTrigger value="yearly" className='bg-background data-[state=active]:bg-green data-[state=active]:text-white'>Yearly</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={billing}>
            <div className="grid grid-cols-4 gap-6">
              {pricing.map((priceInfo) => (
                <PricingCard
                  key={priceInfo.id}
                  priceInfo={priceInfo}
                  billing={billing}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

    </section>
  )
}

export default page
"use client"
import { useEffect, useState } from 'react'
import { pricing } from '@/constants/data'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { axiosClient } from '@/GlobalApi'
import UpgradePricingCard from '@/components/UpgradePricingCard'
import { SubscriptionType } from '@/types/General'
import { toast } from 'react-toastify'
import PricingSkeleton from '@/components/PricingSkeleton'

const page = () => {

  const [billing, setBilling] = useState<"monthly" | "yearly">("monthly")
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionType | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  const getSubscription = async () => {
    setLoadingSubscription(true)
    try {
      const result = await axiosClient.get("/subscription/get-subscription")

      console.log(result.data)
      setSubscriptionStatus(result.data?.result)
    } catch (error: any) {
      toast.error(error.response?.data?.message)
    } finally {
      setLoadingSubscription(false)
    }
  }

  useEffect(() => {
    getSubscription()
  }, [])

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
            {loadingSubscription ? (
              <PricingSkeleton/>
            ): (
              <div className="grid grid-cols-4 gap-4">
                {pricing.map((priceInfo) => (
                  <UpgradePricingCard
                    key={priceInfo.id}
                    priceInfo={priceInfo}
                    billing={billing}
                    currentSubscription={subscriptionStatus}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default page
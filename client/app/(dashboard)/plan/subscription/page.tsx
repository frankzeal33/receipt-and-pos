"use client"
import { ActiveStatus } from "@/components/ActiveStatus"
import DashboardSkeleton from "@/components/DashboardSkeleton"
import Title from "@/components/Title"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { axiosClient } from "@/GlobalApi"
import { SubscriptionType } from "@/types/General"
import { formatEnums } from "@/utils/formatEnums"
import { getDaysUntilRenewal } from "@/utils/getDaysUntilRenewal"
import { format } from "date-fns"
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

const page = () => {

  const [subscriptionPlan, setSubscriptionPlan] = useState<SubscriptionType | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)

  const getSubscription = async () => {
    setLoadingSubscription(true)
    try {
      const result = await axiosClient.get("/subscription/get-subscription")

      console.log(result.data)
      setSubscriptionPlan(result.data?.result)
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
    <div className="my-container">
        <Title title='Subscription & Usage'/>

        {loadingSubscription ? (
            <DashboardSkeleton/>
        ) : (
            <div className='bg-light p-3 rounded-xl border w-full'>
                <div>
                    <div className="mb-4 flex flex-row justify-between items-start">
                        <div>
                            {subscriptionPlan?.plan && <h2 className="font-semibold text-2xl">{`${formatEnums(subscriptionPlan?.plan)} Plan`}</h2>}
                            {subscriptionPlan?.billing && <p>{`${formatEnums(subscriptionPlan?.billing)} billing`}</p>}
                        </div>
                        {subscriptionPlan?.active && <ActiveStatus status={"ACTIVE"}/>}
                    </div>
                    <div className="grid grid-cols-3 gap-6">
                        <Card className="px-4 py-6">
                            <p className="text-sm">Current Period</p>
                            <h2 className="font-semibold text-lg">
                                {subscriptionPlan?.subscribedAt && subscriptionPlan?.expiresAt && subscriptionPlan?.plan !== "FREE"
                                    ? `${format(
                                        new Date(subscriptionPlan.subscribedAt),
                                        "MMM dd"
                                    )} - ${format(
                                        new Date(subscriptionPlan.expiresAt),
                                        "MMM dd yyyy"
                                    )}`
                                    : "Free Forever"}
                            </h2>
                        </Card>
                        <Card className="px-4 py-6">
                            <p className="text-sm">Next Billing Date</p>
                            <h2 className="font-semibold text-lg">
                                {subscriptionPlan?.expiresAt && subscriptionPlan?.plan !== "FREE"
                                    ? format(new Date(subscriptionPlan.expiresAt), "MMM dd yyyy")
                                    : "Free Forever"}
                            </h2>
                        </Card>
                        <Card className="px-4 py-6">
                            <p className="text-sm">Days Until Renewal</p>
                            <h2 className="font-semibold text-lg">
                                {subscriptionPlan?.plan === "FREE"
                                    ? "Free Forever"
                                    : getDaysUntilRenewal(subscriptionPlan?.expiresAt)}
                            </h2>
                        </Card>
                    </div>
                </div>
                <div className="my-6 flex flex-row gap-2 justify-between">
                    <Link href={"/plan"}>
                        <Button variant={"primary"}>Change Plan</Button>
                    </Link>
                    <Link href={"/plan/payment-history"}>
                        <Button variant={"outline"}>Payment History</Button>
                    </Link>
                </div>
                <div>
                    <Card className="h-[50vh] px-4 py-6">
                        <h2 className="font-semibold text-xl">Current Usage</h2>
                    </Card>
                </div>
            </div>
        )}
    </div>
  )
}

export default page
import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Billing, PricingPlan } from "@/types/General";
import { Button } from "./ui/button";
import { useState } from "react";
import { PaystackButton } from "react-paystack";
import { axiosClient } from "@/GlobalApi";

const AuthPricingCard = ({
  priceInfo,
  billing,
}: {
  priceInfo: PricingPlan
  billing: Billing
}) => {

  const price = priceInfo.prices[billing]
   const amount = price * 100 // Paystack uses kobo
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    const [email, setEmail] = useState("frank@gmail.com")
    const [name, setName] = useState("frank")
    const [phone, setPhone] = useState("08043546565")
    const [isSubmitting, setIsSubmitting] = useState(false)
  
    if (!publicKey) {
      throw new Error("Paystack public key is missing")
    }
  
    const componentProps: any = {
      email,
      amount,
      metadata: {
        plan: priceInfo.name,
        billing,
        price,
      },
      publicKey,
      text: `Upgrade to ${priceInfo.name}`,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer", "opay"],
      onSuccess: async (res: any) => {
        
            try {   
                setIsSubmitting(true)

                const { data } = await axiosClient.post("/payments/paystack/verify",
                    {
                        reference: res.reference,
                    }
                )

                if (data.status === "success") {
                    alert("Payment success")
                } else {
                    alert("Verification failed")
                }
            } catch (error: any) {
                console.error("Verification error:", error)

                alert(
                    error.response?.data?.message ??
                    "Payment verification failed"
                )
            } finally {
                setIsSubmitting(false)
            }
      },
      onError: () => alert("Payment failed"),
    }

  return (
    <Card className={`relative p-6 grid gap-3 ${priceInfo.bestValue && 'border-green'}`}>
      {priceInfo.bestValue && (
        <div className="absolute top-0 right-0 overflow-hidden w-24 h-24 text-center">
          <span className="absolute top-2 -right-10 rotate-45 bg-green text-white text-xs font-semibold text-center px-10 py-1">
            BEST VALUE
          </span>
        </div>
      )}
      <h3 className="font-bold text-3xl">{priceInfo.name}</h3>
      <h2>{priceInfo.desc}</h2>
      <div className="flex items-end">
        <h1 className="font-bold text-4xl">{`$${price}`}</h1><h2>/{billing === "monthly" ? "monthly" : "yearly"}</h2>
      </div>
      {/* <Button variant={priceInfo.bestValue ? "primary" : "default"}>{`Upgrade to ${priceInfo.name}`}</Button> */}
      <PaystackButton disabled={isSubmitting} className='bg-green text-white shadow-sm hover:bg-foreground/90 dark:hover:bg-white dark:hover:text-black inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2' {...componentProps}/>
      <h4 className="text-lg font-semibold">Features</h4>
      {
      priceInfo.features.map(({feature, available}: {feature: string, available: boolean}, index: number) => {
          return (
            <div key={index} className="flex items-center gap-2">
              <CheckCircle size={16} className="text-green"/>
              <p key={index} className={!available ? 'disabled' : ''}>{feature}</p>
            </div>
          )
      })
      }
    </Card>
  );
}

export default AuthPricingCard;
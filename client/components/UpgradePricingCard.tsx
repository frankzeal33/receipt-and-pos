import { Card } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { Billing, PricingPlan, SubscriptionPlan, SubscriptionType } from "@/types/General";
import { useState } from "react";
import { PaystackButton } from "react-paystack";
import { axiosClient } from "@/GlobalApi";
import { toast } from "react-toastify";
import { formatEnums } from "@/utils/formatEnums";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";

const PLAN_ORDER: Record<SubscriptionPlan, number> = {
  FREE: 0,
  BASIC: 1,
  BUSINESS: 2,
  ENTERPRISE: 3,
};

const UpgradePricingCard = ({
  priceInfo,
  billing,
  currentSubscription
}: {
  priceInfo: PricingPlan
  billing: Billing
  currentSubscription: SubscriptionType | null
}) => {

    const price = priceInfo.prices[billing]
    const amount = price * 100 // Paystack uses kobo
    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY
    const [email, setEmail] = useState("frank@gmail.com")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const router = useRouter()

    const currentPlan: SubscriptionPlan | null = currentSubscription?.plan ?? null;
    const targetPlan: SubscriptionPlan = priceInfo.name;

    const isCurrentPlan = currentPlan === targetPlan

    const isUpgrade =
      currentPlan &&
      PLAN_ORDER[targetPlan] > PLAN_ORDER[currentPlan]

    const isDowngrade =
      currentPlan &&
      PLAN_ORDER[targetPlan] < PLAN_ORDER[currentPlan]

    if (!publicKey) {
      throw new Error("Paystack public key is missing")
    }

    const renewPaystack = () => {

      const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount,
        currency: "NGN",

        metadata: {
          plan: priceInfo.name,
          billing: billing.toUpperCase(),
          price,
          title: "RENEW",
        },

        callback: function (response: any) {
          verifyPayment(response.reference);
        },

        onClose: () => {
          toast.info("Payment cancelled");
        },
      });

      handler.openIframe();
    };

    const downgradePaystack = async () => {
      if(priceInfo.name === "FREE"){
        setIsSubmitting(true)
        try {
          const response = await axiosClient.post("/subscription/downgrade-freeplan")
          toast.success(response.data?.message)
        } catch (error: any) {
          toast.error(error.response?.data?.message)
        } finally {
          setIsSubmitting(false)
        }
      }else{
        const handler = (window as any).PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email,
        amount,
        currency: "NGN",

        metadata: {
          plan: priceInfo.name,
          billing: billing.toUpperCase(),
          price,
          title: "DOWNGRADE",
        },

        callback: function (response: any) {
          verifyPayment(response.reference);
        },

        onClose: () => {
          toast.info("Payment cancelled");
        }
      });

      handler.openIframe();
      }
    };

    const verifyPayment = async (reference: string) => {
      try {
        setIsSubmitting(true);

        const { data } = await axiosClient.post(
          "/payment/paystack/verify",
          { reference }
        );

        if (data.success) {
          toast.success("Payment Successful");
          router.push("plan/subscription")
        } else {
          toast.error("Verification Failed, Contact Support");
        }
      } catch(error: any) {
        toast.error(error.response?.data?.message || "Verification Failed, Contact Support");
      } finally {
        setIsSubmitting(false);
      }
    };
  
    const componentProps: any = {
      email,
      amount,
      metadata: {
        plan: priceInfo.name,
        billing: billing.toUpperCase(),
        price,
        title: "UPGRADE"
      },
      publicKey,
      text: `Upgrade to ${formatEnums(priceInfo.name)}`,
      currency: "NGN",
      channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer", "pos"],
      onSuccess: async (res: any) => {
        
        try {   
            setIsSubmitting(true)

            const { data } = await axiosClient.post("/payment/paystack/verify",
              {
                reference: res.reference,
              }
            )

            console.log(data)

            if (data.success) {
              toast.success("Payment Successful");
              router.push("plan/subscription")
            } else {
              toast.error("Verification Failed, Contact Support")
            }
        } catch (error: any) {
          toast.error(error.response?.data?.message || "Verification Failed, Contact Support");
        } finally {
          setIsSubmitting(false)
        }
      },
      onError: () => alert("Payment failed"),
      onClose: () => {
        toast.info("Payment cancelled");
      }
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
      <h3 className="font-bold text-3xl">{formatEnums(priceInfo.name)}</h3>
      <h2>{priceInfo.desc}</h2>
      <div className="flex items-end">
        <h1 className="font-bold text-4xl">{`$${price}`}</h1><h2>/{billing === "monthly" ? "monthly" : "yearly"}</h2>
      </div>
      {isCurrentPlan && (
        <Button 
          variant={"outline"}
          onClick={renewPaystack}
          disabled={currentSubscription?.plan === "FREE"}
        >Current Plan</Button>
      )}

      {isUpgrade && (
        <PaystackButton disabled={isSubmitting} className='bg-green text-white shadow-sm hover:bg-foreground/90 dark:hover:bg-white dark:hover:text-black inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 h-9 px-4 py-2' {...componentProps}/>
      )}

      {isDowngrade && (
        <Button
          variant="secondary"
          onClick={downgradePaystack}
          disabled={isSubmitting}
        >
          {`Downgrade to ${formatEnums(priceInfo.name)}`}
        </Button>
      )} 

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

export default UpgradePricingCard
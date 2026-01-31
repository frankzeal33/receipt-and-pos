import { Card } from "@/components/ui/card";
import { Button } from "../ui/button";
import { CheckCircle } from "lucide-react";
import { Billing, PricingPlan } from "@/types/General";

const PricingCard = ({
  priceInfo,
  billing,
}: {
  priceInfo: PricingPlan
  billing: Billing
}) => {

  const price = priceInfo.prices[billing]

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
      <Button variant={priceInfo.bestValue ? "primary" : "default"}>Get Started</Button>
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

export default PricingCard;
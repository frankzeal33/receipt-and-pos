import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ProductCardType, productItemType } from "@/types/General"
import displayCurrency from "@/utils/displayCurrency"
import ReduceTextLength from "@/utils/ReduceTextLength"
import Image from "next/image"

export function CardBox({ id, productName, image, price, productDesc, category, brand, handleClick }: ProductCardType ) {
  return (
    <Card onClick={handleClick} className="w-full rounded-lg py-2 cursor-pointer">
      <CardHeader className="px-2 py-0">
        <div className="w-full h-16 relative rounded-md overflow-hidden">
            <Image
              src={image}
              alt="product"
              fill
              className="object-cover dark:hidden"
            />
            <Image
              src="/image-placeholder-dark.svg"
              alt="product"
              fill
              className="object-cover hidden dark:block"
            />
        </div>
      </CardHeader>
      <CardContent className="px-2 py-0">
        <CardTitle className="text-sm">{ReduceTextLength(productName, 25)}</CardTitle>
        <CardDescription className="text-xs">
            {ReduceTextLength(productDesc, 25)}
        </CardDescription>
      </CardContent>
      <div className="flex flex-col flex-start px-2 py-0">
        <CardTitle className="text-green">{displayCurrency(Number(price), "NGN")}</CardTitle>
        <div className="justify-between gap-1">
          <CardDescription className="text-[10px]">
            {ReduceTextLength(brand, 15)}
          </CardDescription>
          <CardDescription className="text-[10px]">
            {ReduceTextLength(category, 15)}
          </CardDescription> 
        </div>
      </div>
    </Card>
  )
}

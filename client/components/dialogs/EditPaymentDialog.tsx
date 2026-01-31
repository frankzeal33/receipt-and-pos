import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { axiosClient } from "@/GlobalApi"
import { PaymentDialogProps } from "@/types/General"
import displayCurrency from "@/utils/displayCurrency"
import { formatEnums } from "@/utils/formatEnums"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-toastify"

const payment = [
  {
    id: "1",
    type: "CASH",
    image: "/cash.png"
  },
  {
    id: "2",
    type: "CARD",
    image: "/card.png"
  },
  {
    id: "3",
    type: "BANK_TRANSFER",
    image: "/transfer.png"
  },
  {
    id: "4",
    type: "OTHER",
    image: "/cash.png"
  },
]

export function EditPaymentDialog({ total, cart, discount, taxRate, saleId, customer }: PaymentDialogProps) {

  const [orderText, setOrderText] = useState("Thank you for your patronage")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentType, setPaymentType] = useState("CASH")

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cart.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    try {
      setIsSubmitting(true)

      const payload: Record<string, any> = {
        items: cart.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
        })),
        discount: Number(discount) || 0,
        taxRate: Number(taxRate) || 0,
        paymentType,
        customerName: customer?.customerName || "Walk-in Customer",
        note: orderText,
        status: "CORRECTED"
      }

      if (customer?.customerId) payload.customerId = customer.customerId
      if (customer?.customerIdentifier) payload.customerIdentifier = customer.customerIdentifier

      const response = await axiosClient.post(`/sales/correct-sale/${saleId}`, payload)

      toast.success(response.data?.message)
      setTimeout(() => window.location.reload(), 1200)


    } catch (error: any) {
      toast.error(error.response?.data?.message)
    } finally {
      setIsSubmitting(false)
    }
  }
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
            <Button variant="primary">
              Process Payment
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <div>
                <DialogTitle className="mb-2">Payment</DialogTitle>
                <h2 className="text-green font-bold text-2xl text-center">{displayCurrency(Number(total), "NGN")}</h2>
                <DialogDescription className="text-center">
                  Amount to be Paid
                </DialogDescription>
            </div>
          </DialogHeader>
          <div className="grid gap-4">
            <RadioGroup value={paymentType} onValueChange={setPaymentType} className="grid gap-2">
                {payment.map((item) => (
                  <div key={item.id}>
                      <RadioGroupItem value={item.type} id={item.id} className="peer sr-only" />
                      <Label
                        htmlFor={item.id}
                        className="flex gap-1 items-center rounded-md border border-muted p-2 cursor-pointer peer-data-[state=checked]:bg-green peer-data-[state=checked]:text-white peer-data-[state=checked]:border-green transition"
                      >
                        <Image
                          src={item.image}
                          alt={item.type}
                          width="20"
                          height="20"
                        />
                        {formatEnums(item.type)}
                      </Label>
                  </div>
                ))}
            </RadioGroup>
            <div className="grid gap-3">
              <Label htmlFor="username-1">Order Note</Label>
              <Textarea placeholder="Type your order message here." value={orderText} onChange={(e) => setOrderText(e.target.value)} className="resize-none"/>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} onClick={handlePayment}>{isSubmitting ? "Adding..." : "Complete Payment"}</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}

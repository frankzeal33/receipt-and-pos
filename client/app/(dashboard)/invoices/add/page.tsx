"use client"
import Title from '@/components/Title'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { addDays, format } from "date-fns"
import { Calendar as CalendarIcon, Minus, Plus, Trash2 } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import CurrencyPicker, { currencyOptions } from '@/utils/CurrencyPicker'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import displayCurrency from '@/utils/displayCurrency'
import { z } from "zod";
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { v4 as uuidv4 } from "uuid";

export const invoiceSchema = z.object({
  invoiceName: z.string().min(1, "Invoice name is required"),
  currency: z.string().min(1, "Currency is required"),
  date: z.string().min(1, "Invoice date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  billFrom: z.object({
    businessName: z.string().min(1, "Business name is required"),
    email: z.string().email("Invalid business email"),
    address: z.string().min(1, "Address required"),
    phone: z.string().min(5, "Phone number required"),
  }),
  billTo: z.object({
    customerName: z.string().min(1, "Client name required"),
    customerEmail: z.string().email("Invalid client email"),
    customerAddress: z.string().min(1, "Client address required"),
    customerPhone: z.string().min(5, "Client phone required"),
  }),
  invoiceItems: z.array(
    z.object({
      itemTitle: z.string().min(1, "Item name required"),
      itemQuantity: z.number().int().positive("Quantity must be at least 1"),
      itemAmount: z.string()
        .regex(/^\d+(\.\d{1,2})?$/, "Input correct price")
        .transform((val) => parseFloat(val)),
      tax: z
        .number()
        .min(0, "Tax rate must be between 0 and 100")
        .max(100, "Tax rate must be between 0 and 100")
        .default(0)
        .optional(),
    })
  ).min(1, "At least one item required"),
  note: z.string().optional(),
  paymentTerm: z.string().optional(),
  extraChargeName: z.string().optional(),
  extraCharge: z.number().nonnegative("Extra charge cannot be negative").default(0),
  discountName: z.string().optional(),
  discount: z.number().nonnegative("Discount cannot be negative").default(0),
}).refine((data) => {
  // Extra Charge Name required if extraCharge > 0
  if (data.extraCharge > 0) {
    return data.extraChargeName?.trim() !== "";
  }
  return true;
}, {
  message: "Extra charge name is required when extra charge is provided",
  path: ["extraChargeName"],
})
.refine((data) => {
  // Discount Name required if discount > 0
  if (data.discount > 0) {
    return data.discountName?.trim() !== "";
  }
  return true;
}, {
  message: "Discount name is required when discount is provided",
  path: ["discountName"],
});

type invoiceFormValues = z.infer<typeof invoiceSchema>

type itemType = {
  id: string;
  itemTitle: string;
  itemQuantity: string;
  itemAmount: string;
  tax: string;
  itemTotal: number;
}

const page = () => {

  const [currency, setCurrency] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState({
    invoiceName: "",
    date: "",
    due_date: "",
    business_name: "",
    email: "",
    address: "",
    phone: "",
    client_name: "",
    client_email: "",
    client_address: "",
    client_phone: "",
    note: "",
    paymentTerm: "",
    extraChargeName: "",
    extraCharge: "",
    discountName: "",
    discount: "",
  })
  const [items, setItems] = useState([
    { id: uuidv4(), itemTitle: "", itemQuantity: "", itemAmount: "", tax: "", itemTotal: 0 },
  ])

  const handleSave = async () => {

    const invoiceItems = items.map((item) => ({
      ...item,
      itemQuantity: Number(item.itemQuantity),
      itemTotal: item.itemTotal.toString(),
      tax: Number(item.tax)
    }));

    const invoiceData = {
      currency,
      invoiceName: form.invoiceName,
      date: form.date,
      dueDate: form.due_date,
      billFrom: {
        businessName: form.business_name || "",
        email: form.email || "",
        address: form.address || "",
        phone: form.phone || "",
      },
      billTo: {
        customerName: form.client_name || "",
        customerEmail: form.client_email || "",
        customerAddress: form.client_address || "",
        customerPhone: form.client_phone || "",
      },
      invoiceItems,
      note: form.note || "",
      paymentTerm: form.paymentTerm || "",
      extraChargeName: form.extraChargeName || "",
      extraCharge: Number(form.extraCharge),
      discountName: form.discountName || "",
      discount: Number(form.discount)
    };

    const result = invoiceSchema.safeParse(invoiceData);

    if (!result.success) {
      const fieldErrors: Partial<Record<keyof invoiceFormValues, string>> = {};

      result.error.errors.forEach((err) => {
        const field = err.path[err.path.length - 1] as keyof invoiceFormValues;
        fieldErrors[field] = err.message;
      });

      toast.error(Object.values(fieldErrors)[0]);
      return;
    }

    // Save to localStorage
    localStorage.setItem("invoiceForm", JSON.stringify(result.data));

    try {
    
      setIsSubmitting(true)

      const invoiceApiData = {
        currency,
        invoiceName: form.invoiceName,
        date: form.date,
        dueDate: form.due_date,
        businessName: form.business_name || "",
        email: form.email || "",
        address: form.address || "",
        phone: form.phone || "",
        customerName: form.client_name || "",
        customerEmail: form.client_email || "",
        customerAddress: form.client_address || "",
        customerPhone: form.client_phone || "",
        invoiceItems,
        note: form.note || "",
        paymentTerm: form.paymentTerm || "",
        extraChargeName: form.extraChargeName || "",
        extraCharge: Number(form.extraCharge),
        discountName: form.discountName || "",
        discount: Number(form.discount),
        status: "UNPAID",
        subTotal: totals.subtotal,
        totalTaxAmount: totals.taxTotal.toString(),
        totalAmount: (
          totals.grandTotal +
          Number(form.extraCharge || 0) -
          Number(form.discount || 0)
        ).toString()
      };
      
      const result = await axiosClient.post("/staffs/add-invoice", invoiceApiData)

      toast.success(result.data.message);

      setForm({
        invoiceName: "",
        date: "",
        due_date: "",
        business_name: "",
        email: "",
        address: "",
        phone: "",
        client_name: "",
        client_email: "",
        client_address: "",
        client_phone: "",
        note: "",
        paymentTerm: "",
        extraChargeName: "",
        extraCharge: "",
        discountName: "",
        discount: ""
      })
      setItems([
        { id: uuidv4(), itemTitle: "", itemQuantity: "", itemAmount: "", tax: "", itemTotal: 0 },
      ])
      
    } catch (error: any) {
      toast.error(error.response?.data?.message);

    } finally {
      setIsSubmitting(false)
    } 

  };

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: uuidv4(), itemTitle: "", itemQuantity: "", itemAmount: "", tax: "", itemTotal: 0 },
    ])
  }

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleChange = (id: string, field: string, value: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          const qty = parseFloat(updatedItem.itemQuantity) || 0;
          const price = parseFloat(updatedItem.itemAmount) || 0;
          const tax = parseFloat(updatedItem.tax) || 0;
          const subtotal = qty * price;
          const total = subtotal + (subtotal * tax) / 100;
          updatedItem.itemTotal = total;
          return updatedItem;
        }
        return item;
      })
    );
  };

  const calculateTotal = (item: itemType) => {
    const qty = parseFloat(item.itemQuantity) || 0
    const price = parseFloat(item.itemAmount) || 0
    const tax = parseFloat(item.tax) || 0
    const subtotal = qty * price
    const total = subtotal + (subtotal * tax) / 100
    return total
  }

  const totals = items.reduce(
    (acc, item) => {
      const qty = parseFloat(item.itemQuantity) || 0
      const price = parseFloat(item.itemAmount) || 0
      const tax = parseFloat(item.tax) || 0
      const subtotal = qty * price
      const taxAmount = (subtotal * tax) / 100

      acc.subtotal += subtotal
      acc.taxTotal += taxAmount
      acc.grandTotal += subtotal + taxAmount

      return acc
    },
    { subtotal: 0, taxTotal: 0, grandTotal: 0 }
  )

  useEffect(() => {
    const saved = localStorage.getItem("invoiceForm");
    if (saved) {
      const parsed = JSON.parse(saved);
      setCurrency(parsed.currency || "");
      setForm((prev) => ({
        ...prev,
        date: parsed.date || "",
        due_date: parsed.due_date || "",
        // add billFrom / billTo if needed
      }));
      setItems(parsed.items || []);
    }
  }, []);

  return (
    <div className='my-container'>
      <Title title='Create Invoice'/>
      <div className='grid gap-6'>
        <Card className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
          <div className="grid gap-2">
            <Label htmlFor="email">Invoice Name</Label>
            <Input id="invoice-name" value={form.invoiceName} onChange={(e: any) => setForm({ ...form, invoiceName: e.target.value})} placeholder="Invoice name"/>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Currency</Label>
            <CurrencyPicker
              defaultValue={currencyOptions[0]}
              onChange={(selectedCurrency) => {
                console.log("Selected:", selectedCurrency);
                if (selectedCurrency) {
                  setCurrency(selectedCurrency.value);
                } else {
                  setCurrency("");
                }
              }}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Invoice Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                  <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal bg-light"
                  )}
                  >
                  <CalendarIcon />
                  {form.date ? format(new Date(form.date), "PPP") : <span>Pick a date</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                  <Select
                      onValueChange={(value) => {
                          const newDate = addDays(new Date(), parseInt(value));
                          setForm((prev) => ({
                              ...prev,
                              date: newDate.toISOString(),
                          }));
                      }}
                  >
                  <SelectTrigger className='w-full'>
                      <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                      <SelectItem value="-1">Yesterday</SelectItem>
                      <SelectItem value="0">Today</SelectItem>
                      <SelectItem value="1">Tomorrow</SelectItem>
                  </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                      <Calendar mode="single" selected={form.date ? new Date(form.date) : undefined} onSelect={(date) => {
                          setForm((prev) => ({
                            ...prev,
                            date: date?.toISOString() ?? "",
                      }))}}/>
                  </div>
              </PopoverContent>
            </Popover>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                  <Button
                  variant={"outline"}
                  className={cn(
                    "justify-start text-left font-normal bg-light"
                  )}
                  >
                  <CalendarIcon />
                  {form.due_date ? format(new Date(form.due_date), "PPP") : <span>Pick a date</span>}
                  </Button>
              </PopoverTrigger>
              <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                  <Select
                      onValueChange={(value) => {
                          const newDate = addDays(new Date(), parseInt(value));
                          setForm((prev) => ({
                              ...prev,
                              due_date: newDate.toISOString(),
                          }));
                      }}
                  >
                  <SelectTrigger className='w-full'>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    <SelectItem value="-1">Yesterday</SelectItem>
                    <SelectItem value="0">Today</SelectItem>
                    <SelectItem value="1">Tomorrow</SelectItem>
                  </SelectContent>
                  </Select>
                  <div className="rounded-md border">
                      <Calendar mode="single" selected={form.due_date ? new Date(form.due_date) : undefined} onSelect={(date) => {
                          setForm((prev) => ({
                            ...prev,
                            due_date: date?.toISOString() ?? "",
                      }))}}/>
                  </div>
              </PopoverContent>
            </Popover>
          </div>
        </Card>

        <div className="grid grid-col-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <h2 className='font-bold'>Bill From</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Business Name</Label>
                  <Input id="name" value={form.business_name} onChange={(e: any) => setForm({ ...form, business_name: e.target.value})} placeholder="Business name"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="email"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="address" className='text-accent-foreground'>Address</Label>
                  <Textarea value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value})} placeholder="Enter address here" className='resize-none h-20 scrollbar-rounded' />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Phone</Label>
                  <Input value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value})} placeholder="e.g +2348345986982"/>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <h2 className='font-bold'>Bill To</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="c-name">Client Name</Label>
                  <Input id="c-name" value={form.client_name} onChange={(e: any) => setForm({ ...form, client_name: e.target.value})} placeholder="Client name"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-email">Client Email</Label>
                  <Input id="c-email" value={form.client_email} onChange={(e: any) => setForm({ ...form, client_email: e.target.value})} type='email' placeholder="email"/>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="C-address" className='text-accent-foreground'>Client Address</Label>
                  <Textarea value={form.client_address} onChange={(e: any) => setForm({ ...form, client_address: e.target.value})} placeholder="Enter address here" className='resize-none h-20 scrollbar-rounded' />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="c-phone">Client Phone</Label>
                  <Input id='c-phone' value={form.client_phone} onChange={(e: any) => setForm({ ...form, client_phone: e.target.value})} placeholder="e.g +2348345986982"/>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='bg-light p-3 rounded-xl border w-full'>
          <div className='flex items-center gap-2 mb-4'>
              <p className="text-lg font-medium leading-none">Items ({items.length})</p>
          </div>

          <div className="w-full flex flex-col items-center justify-between overflow-x-auto">
            <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="rounded-tl-lg capitalize">Item</TableHead>
                    <TableHead className='capitalize'>Qty</TableHead>
                    <TableHead className='capitalize'>Price</TableHead>
                    <TableHead className='capitalize'>Tax(%)</TableHead>
                    <TableHead className='capitalize'>Total</TableHead>
                  <TableHead className="rounded-tr-lg capitalize"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input
                          placeholder="item name"
                          value={item.itemTitle}
                          onChange={(e) => handleChange(item.id, "itemTitle", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          min={1}
                          placeholder="qty"
                          className="w-20"
                          value={item.itemQuantity}
                          onChange={(e) => handleChange(item.id, "itemQuantity", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="price"
                          className="w-28 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.itemAmount}
                          onChange={(e) => handleChange(item.id, "itemAmount", e.target.value)}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="tax(%)"
                          className="w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          value={item.tax}
                          onChange={(e) => handleChange(item.id, "tax", e.target.value)}
                        />
                      </TableCell>
                      <TableCell className="font-semibold">
                        {displayCurrency(calculateTotal(item), "NGN")}
                      </TableCell>
                      <TableCell className="bg-muted/30">
                        <button className="p-1" onClick={() => removeItem(item.id)}>
                          <Trash2 size={18} className="text-red-500 hover:text-red-600" />
                        </button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody> 
              </Table>
          </div>

          <div className='w-full my-4 mx-2'>
            <Button onClick={addItem}><Plus/> Add Item</Button>
          </div>

        </div>

        <div className="grid grid-col-1 lg:grid-cols-2 gap-5">
          <Card>
            <CardHeader>
              <h2 className='font-bold'>Note & Term</h2>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="name">Note</Label>
                  <Textarea placeholder="Enter note here" value={form.note} onChange={(e: any) => setForm({ ...form, note: e.target.value})} className='h-36 scrollbar-rounded' />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="payment">Payment Term</Label>
                  <Select onValueChange={(value) =>
                    setForm((prev) => ({ ...prev, paymentTerm: value }))
                  }>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select term" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Payment due days after invoice date</SelectLabel>
                        <SelectItem value="due_on_receipt">Due on Receipt (due immediately)</SelectItem>
                        <SelectItem value="net_7">Net 7 (7 days)</SelectItem>
                        <SelectItem value="net_14">Net 14 (14 days)</SelectItem>
                        <SelectItem value="net_30">Net 30 (30 days)</SelectItem>
                        <SelectItem value="net_60">Net 60 (60 days)</SelectItem>
                        <SelectItem value="net_90">Net 90 (90 days)</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-col gap-5">
              {/* Extra Charge and Discount Inputs */}
              <div className="w-full flex flex-col gap-4">
                <div className="w-full flex flex-row justify-between items-end gap-2">
                  <div>
                    <Label htmlFor="extraName">Extra Charge Name</Label>
                    <Input
                      id="extraName"
                      placeholder="e.g. Delivery Fee"
                      value={form.extraChargeName}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, extraChargeName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="extraAmount">Extra Charge Amount</Label>
                    <Input
                      id="extraAmount"
                      type="number"
                      min={0}
                      placeholder="e.g. 1000"
                      value={form.extraCharge}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          extraCharge: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <div className="flex flex-row justify-between items-end gap-2">
                  <div>
                    <Label htmlFor="discountName">Discount Name</Label>
                    <Input
                      id="discountName"
                      placeholder="e.g. Promotional Discount"
                      value={form.discountName}
                      onChange={(e) =>
                        setForm((prev) => ({ ...prev, discountName: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <Label htmlFor="discountAmount">Discount Amount</Label>
                    <Input
                      id="discountAmount"
                      type="number"
                      min={0}
                      placeholder="e.g. 500"
                      value={form.discount}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          discount: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Summary Totals */}
              <div className="grid gap-3 border-t pt-4">
                <div className="flex justify-between items-center">
                  <h2>Subtotal:</h2>
                  <h2 className="font-bold text-xl">
                    {displayCurrency(totals.subtotal, "NGN")}
                  </h2>
                </div>
                <div className="flex justify-between items-center">
                  <h2>Tax Total:</h2>
                  <h2 className="font-bold text-xl">
                    {displayCurrency(totals.taxTotal, "NGN")}
                  </h2>
                </div>
                <div className="flex justify-between items-center">
                  <h2>Extra Charge:</h2>
                  <h2 className="font-bold text-xl text-green-600">
                    +{displayCurrency(Number(form.extraCharge || 0), "NGN")}
                  </h2>
                </div>
                <div className="flex justify-between items-center">
                  <h2>Discount:</h2>
                  <h2 className="font-bold text-xl text-red-600">
                    -{displayCurrency(Number(form.discount || 0), "NGN")}
                  </h2>
                </div>
                <div className="flex justify-between items-center border-t pt-3">
                  <h2>Total:</h2>
                  <h2 className="font-bold text-2xl">
                    {displayCurrency(
                      totals.grandTotal +
                        Number(form.extraCharge || 0) -
                        Number(form.discount || 0),
                      "NGN"
                    )}
                  </h2>
                </div>
              </div>
            </CardHeader>
          </Card>
        </div>

        <div>
          <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" onClick={handleSave}>
            {isSubmitting ? "Saving..." : "Save Invoice"}
          </Button>
        </div>

      </div>

    </div>
  )
}

export default page
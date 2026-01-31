import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog"
import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarIcon, Eye, EyeOff, X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { ExpenseCategory, ExpensePaymentType, Roles } from '@/types/General'
import { formatEnums } from '@/utils/formatEnums'
import { Textarea } from '@/components/ui/textarea'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { addDays, format } from 'date-fns'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'

const expenseSchema = z.object({
    title: z.string().min(1, "Expense title is missing"), 
    description: z.string().optional(), 
    category: z.enum([ "UTILITIES", "SUPPLIES", "MAINTENANCE", "MARKETING", "TAXES", "OTHER"], {
      message: "Select Category",
    }),
    amount: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")  // e.g. 123 or 123.45
      .transform((val) => parseFloat(val)) // convert to number
      .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
    paymentType: z.enum([ "CASH", "CARD", "BANK_TRANSFER", "OTHER" ], {
      message: "Select payment type",
    }), 
    expenseDate: z.string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Select expense date",
      })
      .transform((val) => new Date(val)),
})

type expenseFormValues = z.infer<typeof expenseSchema>

const AddExpense = ({getProducts}: {getProducts: () => void}) => {

    const [form, setForm] = useState({
        title: '',
        description: '',
        category: '',
        amount: '',
        paymentType: '',
        expenseDate: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = expenseSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof expenseFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof expenseFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/staffs/add-expense", form)

            toast.success(result.data.message);
            getProducts()

            setForm({
                title: '',
                description: '',
                category: '',
                amount: '',
                paymentType: '',
                expenseDate: ''
            })

            setOpen(false)

        } catch (error: any) {
            toast.error(error.response?.data?.message);

        } finally {
            setIsSubmitting(false)
        } 
    }


  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant={"primary"}>Add Expense</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                    <AlertDialogTitle className="text-sm">Add an Expense</AlertDialogTitle>
                    <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogDescription className="w-full bg-light px-4 pb-4 flex flex-col items-center justify-center gap-3">
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="title">Expense Title</Label>
                        <Input id="title" type="text" value={form.title} onChange={(e: any) => setForm({ ...form, title: e.target.value})} placeholder="Enter title here"/>
                    </span>
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="desc">Expense Description</Label>
                        <Textarea placeholder="Enter description here" value={form.description} onChange={(e: any) => setForm({ ...form, description: e.target.value})} className='h-20 scrollbar-rounded' />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="category">Category</Label>
                        <Select value={form.category} onValueChange={(value: string) => setForm({ ...form, category: value as expenseFormValues['category'] })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Category" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Expense Caegory</SelectLabel>
                                    {Object.values(ExpenseCategory).map((category) => (
                                        <SelectItem key={category} value={category}>
                                            {formatEnums(category)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="amount">Amount</Label>
                        <Input id="amount" type="number" value={form.amount} onChange={(e: any) => setForm({ ...form, amount: e.target.value})} placeholder="Enter amount here" />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="email">Payment Type</Label>
                        <Select value={form.paymentType} onValueChange={(value: string) => setForm({ ...form, paymentType: value as expenseFormValues['paymentType'] })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Payment Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Payment Type</SelectLabel>
                                    {Object.values(ExpensePaymentType).map((paymentType) => (
                                        <SelectItem key={paymentType} value={paymentType}>
                                            {formatEnums(paymentType)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="date">Expense Date</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className={cn(
                                    "justify-start text-left font-normal bg-light"
                                )}
                                >
                                <CalendarIcon />
                                {form.expenseDate ? format(new Date(form.expenseDate), "PPP") : <span>Pick a date</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="flex w-auto flex-col space-y-2 p-2">
                                <Select
                                    onValueChange={(value) => {
                                        const newDate = addDays(new Date(), parseInt(value));
                                        setForm((prev) => ({
                                            ...prev,
                                            expenseDate: newDate.toISOString(),
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
                                    <Calendar mode="single" selected={form.expenseDate ? new Date(form.expenseDate) : undefined} onSelect={(date) => {
                                        setForm((prev) => ({
                                            ...prev,
                                            expenseDate: date?.toISOString() ?? "",
                                    }))}}/>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" className='w-full' onClick={handleSubmit}>
                        {isSubmitting ? "Adding..." : "Add Expense"}
                    </Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddExpense
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
import { Eye, EyeOff, X } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'

export const addCustomerSchema = z
  .object({
    name: z.string().min(1, "Customer name is required"),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  })
  .refine(
    (data) => data.email || data.phone,
    {
      message: "Either email or phone must be provided",
      path: ["email"],
    }
);

type customerFormValues = z.infer<typeof addCustomerSchema>

const AddCustomers = ({getCustomers}: {getCustomers: () => void}) => {

    const [form, setForm] = useState<customerFormValues>({
        name: '',
        email: '',
        phone: '',
        address: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = addCustomerSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof customerFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof customerFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/sales/add-customer", form)

            toast.success(result.data.message);
            getCustomers()

            setForm({
                name: '',
                email: '',
                phone: '',
                address: ''
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
            <Button variant={"primary"}>Add Customer</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                    <AlertDialogTitle className="text-sm">Add a Customer</AlertDialogTitle>
                    <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogDescription className="w-full bg-light px-4 pb-4 flex flex-col items-center justify-center gap-3">
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="firstname">Customer Name</Label>
                        <Input id="firstname" type="text" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})} placeholder="Enter name here"/>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="email">Customer Email</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="Enter email address here" />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="phone">Customer Phone No.</Label>
                        <Input id="phone" type="number" value={form.phone} onChange={(e: any) => setForm({ ...form, phone: e.target.value})} placeholder="Enter phone no here" />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="address">Customer Address</Label>
                        <Input id="address" type="text" value={form.address} onChange={(e: any) => setForm({ ...form, address: e.target.value})} placeholder="Enter address here" />
                    </span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" className='w-full' onClick={handleSubmit}>
                        {isSubmitting ? "Adding..." : "Add Customer"}
                    </Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddCustomers
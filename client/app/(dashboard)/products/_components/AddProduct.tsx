import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
    AlertDialog,
    AlertDialogAction,
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
import { X } from 'lucide-react'
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

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDesc: z.string().optional(),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format") // format only
    .transform((val) => parseFloat(val)) // convert to number
    .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
  quantity: z.string()
    .regex(/^\d+$/, "Quantity must be a whole number") // only digits
    .transform((val) => parseInt(val, 10)), // convert to number
  status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"])
});

type productFormValues = z.infer<typeof productSchema>

const AddProduct = ({getProducts}: {getProducts: () => void}) => {

    const [productForm, setProductForm] = useState({
        productName: "",
        productDesc: "",
        price: "", 
        quantity: "", 
        status: "IN_STOCK"
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = productSchema.safeParse(productForm)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof productFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof productFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        const data = {
            ...productForm,
            quantity: Number(productForm.quantity)
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/staffs/add-product", data)

            toast.success(result.data.message);
            getProducts()

            setProductForm({
                productName: "",
                productDesc: "",
                price: "", 
                quantity: "", 
                status: "IN_STOCK"
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
            <Button variant={"primary"}>Add Product</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                    <AlertDialogTitle className="text-sm">Add Product</AlertDialogTitle>
                    <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogDescription className="w-full bg-light px-4 pb-4 flex flex-col items-center justify-center gap-3">
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="p-name" className='text-accent-foreground'>Product Name</Label>
                        <Input id="p-name" value={productForm.productName} onChange={(e: any) => setProductForm({ ...productForm, productName: e.target.value})} placeholder="Enter here"/>
                    </span>
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="Product description" className='text-accent-foreground'>Product Description</Label>
                        <Textarea value={productForm.productDesc} onChange={(e: any) => setProductForm({ ...productForm, productDesc: e.target.value})} placeholder="Enter very short description here" className='resize-none h-16 scrollbar-rounded' />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="price" className='text-accent-foreground'>Product Price</Label>
                        <Input id="price" value={productForm.price} type="number" min={0} onChange={(e: any) => setProductForm({ ...productForm, price: e.target.value})} placeholder="Enter here" />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="quantity" className='text-accent-foreground'>Product Quantity</Label>
                        <Input id="quantity" value={productForm.quantity} type="number" min={0}  onChange={(e: any) => setProductForm({ ...productForm, quantity: e.target.value})} placeholder="Enter here"/>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="rooms" className='text-accent-foreground'>Product Status</Label>
                        <Select value={productForm.status} onValueChange={(value) => setProductForm({ ...productForm, status: value })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                <SelectLabel>Product status</SelectLabel>
                                <SelectItem value="IN_STOCK">In Stock</SelectItem>
                                <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                                <SelectItem value="LOW_STOCK">Low Stock</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" className='w-full' onClick={handleSubmit}>
                        {isSubmitting ? "Adding..." : "Add Product"}
                    </Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddProduct
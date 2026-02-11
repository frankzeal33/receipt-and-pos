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
import { X } from 'lucide-react'
import { z } from 'zod'
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { Textarea } from '@/components/ui/textarea'

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  location: z.string().min(1, "Branch Address is required")
})

type branchFormValues = z.infer<typeof branchSchema>

const AddBranch = ({getProducts}: {getProducts: () => void}) => {

    const [form, setForm] = useState<branchFormValues>({
        name: '',
        location: ''
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = branchSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof branchFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof branchFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/branches/add-branch", form)

            toast.success(result.data.message);
            getProducts()

            setForm({
                name: "",
                location: ""
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
            <Button variant={"primary"}>Add Branch</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                    <AlertDialogTitle className="text-sm">Add a Branch</AlertDialogTitle>
                    <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogDescription className="w-full bg-light px-4 pb-4 flex flex-col items-center justify-center gap-3">
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="name" className='text-accent-foreground'>Branch Name</Label>
                        <Input id="name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})} placeholder="Enter here"/>
                    </span>
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="Product description" className='text-accent-foreground'>Branch Address</Label>
                        <Textarea value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value})} placeholder="Enter here" className='resize-none h-16 scrollbar-rounded' />
                    </span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" className='w-full' onClick={handleSubmit}>
                        {isSubmitting ? "Adding..." : "Add Branch"}
                    </Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddBranch
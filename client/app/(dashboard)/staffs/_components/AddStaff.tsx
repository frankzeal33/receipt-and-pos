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
import { Roles } from '@/types/General'
import { generateStrongPassword } from '@/utils/generateStrongPassword'
import { formatEnums } from '@/utils/formatEnums'

const staffSchema = z.object({
  firstName: z.string().min(1, "first name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["CO_CEO", "GENERAL_MANAGER", "GENERAL_ACCOUNTANT", "MANAGER", "ACCOUNTANT", "SALES_PERSON"], {
    message: "Role must be CO_CEO, GENERAL_MANAGER, GENERAL_ACCOUNTANT, MANAGER, ACCOUNTANT or SALES_PERSON"
  }),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
})

type staffFormValues = z.infer<typeof staffSchema>

const AddStaff = ({getProducts}: {getProducts: () => void}) => {

    const [form, setForm] = useState<staffFormValues>({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'SALES_PERSON'
    })
    const [showPassword, setShowPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const result = staffSchema.safeParse(form)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof staffFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof staffFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        try {

            setIsSubmitting(true)
            
            const result = await axiosClient.post("/staffs/add-staff", form)

            toast.success(result.data.message);
            getProducts()

            setForm({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                role: 'SALES_PERSON'
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
            <Button variant={"primary"}>Add Staff</Button>
        </AlertDialogTrigger>
        <AlertDialogContent className="rounded-2xl p-0 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
                <AlertDialogHeader className="bg-background-light rounded-t-2xl p-4 flex flex-row items-center justify-between gap-2">
                    <AlertDialogTitle className="text-sm">Add a Staff</AlertDialogTitle>
                    <AlertDialogCancel className='bg-background-light border-0 shadow-none'><X className='text-2xl'/></AlertDialogCancel>
                </AlertDialogHeader>
                <AlertDialogDescription className="w-full bg-light px-4 pb-4 flex flex-col items-center justify-center gap-3">
                    <span className="grid grid-cols-2 items-start gap-2 w-full">
                        <span className="grid gap-2">
                            <Label htmlFor="firstname">First Name</Label>
                            <Input id="firstname" type="text" value={form.firstName} onChange={(e: any) => setForm({ ...form, firstName: e.target.value})} placeholder="Enter name here"/>
                        </span>
                        <span className="grid gap-2">
                            <Label htmlFor="lastname">Last Name</Label>
                            <Input id="lastname" type="text" value={form.lastName} onChange={(e: any) => setForm({ ...form, lastName: e.target.value})} placeholder="Enter last name here" />
                        </span>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="Enter email address here" />
                    </span>
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="password">Password</Label>
                        <span className="relative w-full">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={form.password}
                                onChange={(e: any) =>
                                    setForm({ ...form, password: e.target.value })
                                }
                                placeholder="*********************"
                                className="w-full pr-20"
                            />
                            {/* Toggle visibility */}
                            <button
                                type="button"
                                className="absolute top-2 right-3 text-ring"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>

                            {/* Generate password */}
                            <button
                                type="button"
                                className="absolute top-2 right-10 text-sm font-medium text-green hover:underline"
                                onClick={() => {
                                    setForm({ ...form, password: generateStrongPassword() })
                                    setShowPassword(true)
                                }}
                            >
                                Gen
                            </button>
                        </span>
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="rooms" className='text-accent-foreground'>Staff Role</Label>
                        <Select value={form.role} onValueChange={(value: string) => setForm({ ...form, role: value as staffFormValues['role'] })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Staff Roles</SelectLabel>
                                    {Object.values(Roles).map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {formatEnums(role)}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </span>
                </AlertDialogDescription>
                <AlertDialogFooter className='flex items-center justify-center w-full gap-2 rounded-b-2xl bg-light border-t p-4'>
                    <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} type="button" className='w-full' onClick={handleSubmit}>
                        {isSubmitting ? "Adding..." : "Add Staff"}
                    </Button>
                </AlertDialogFooter>
            </form>
        </AlertDialogContent>
    </AlertDialog>
  )
}

export default AddStaff
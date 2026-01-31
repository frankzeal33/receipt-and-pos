"use client"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { FormEvent, useEffect, useState } from 'react'
import {
  Card
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { toast } from 'react-toastify'
import { axiosClient } from '@/GlobalApi'
import { z } from 'zod'
import SkeletonFull from '@/components/SkeletonFull'

type profileType = {
    first_name: string,
    email: string,
    last_name: string
    role: string,
    status: string
}

const profileSchema = z.object({
  first_name: z.string().min(1, "first name is required"),
  last_name: z.string().min(1, "Last name is required")
});

const newPasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required"),
    newPassword: z
      .string()
      .min(8,  "New Password must be at least 8 characters")
      .regex(/[A-Z]/, "New Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "New Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "New Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "New Password must contain at least one special character"),
    confirmNewPassword: z.string().min(1, "Invalid confirm new password")
  })
  .refine(
    data => data.confirmNewPassword === data.newPassword,
    {
      path: ["confirmNewPassword"],   // put the error on this field
      message: "Confirm Password does not match"
    }
  )

  
type ProfileFormValues = z.infer<typeof profileSchema>

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

const Page = () => {

    const [activeTab, setActiveTab] = useState("Personal information");

    const [isGetting, setIsGetting] = useState(false)
    const [profile, setProfile] = useState<profileType>({
        first_name: "",
        email: "",
        last_name: "",
        role: "",
        status: ""
    })
    const [originalProfile, setOriginalProfile] = useState<profileType>({
        first_name: "",
        email: "",
        last_name: "",
        role: "",
        status: ""
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmittingPassword, setIsSubmittingPassword] = useState(false)
     const [passwords, setPasswords] = useState({
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: ""
    })
    const arrayList = new Array(1).fill(null)

    const getProfile = async () => {

        try {

            setIsGetting(true)
            
            const response = await axiosClient.get("/profile/user")
            
            setProfile({
                first_name: response.data.result.firstName,
                last_name: response.data.result.lastName,
                email: response.data.result.email,
                role: response.data.result.role,
                status: response.data.result.status
            })

            setOriginalProfile({
                first_name: response.data.result.firstName,
                last_name: response.data.result.lastName,
                email: response.data.result.email,
                role: response.data.result.role,
                status: response.data.result.status
            })

        } catch (error: any) {
            toast.error(error.response?.data?.error);

        } finally {
            setIsGetting(false)
        } 
    }

    useEffect(() => {
        getProfile()
    }, [])

    const hasChanges = () => {
        if (!originalProfile) return true;

        const current = JSON.stringify(profile);
        const original = JSON.stringify(originalProfile);

        return current !== original;
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const result = profileSchema.safeParse(profile)
        
        if (!result.success) {
            const fieldErrors: Partial<Record<keyof ProfileFormValues, string>> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof ProfileFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }
            
        const profileData = {
            firstName: profile.first_name,
            lastName: profile.last_name
        }

        if (!hasChanges()) {
            return toast.error("No changes detected.")
        }

        try {
    
            setIsSubmitting(true)
            const result = await axiosClient.patch("/profile/update-user", profileData)
            toast.success(result.data.message);
            getProfile()
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
    
        } finally {
            setIsSubmitting(false)
        } 

    }

    const handleNewPassword = async (e: FormEvent) => {
        e.preventDefault()
        const result = newPasswordSchema.safeParse(passwords)

         if (!result.success) {
           const fieldErrors: Partial<{
            oldPassword: string;
            newPassword: string;
            confirmNewPassword: string;
            }> = {};
            result.error.errors.forEach((err) => {
                const field = err.path[0] as keyof NewPasswordFormValues
                fieldErrors[field] = err.message
            })
            toast.error(Object.values(fieldErrors)[0]);
            return
        }

        try {
    
            setIsSubmittingPassword(true)
            
            const result = await axiosClient.patch("/profile/change-password/", passwords)
            toast.success(result.data.message);

            setPasswords({
                oldPassword: "",
                newPassword: "",
                confirmNewPassword: ""
            })
    
        } catch (error: any) {
            toast.error(error.response?.data?.message);
    
        } finally {
            setIsSubmittingPassword(false)
        } 
    }

  return (
    <div className='my-container space-y-4'>
        
        {isGetting ? (
            <div className='bg-light p-3 rounded-xl border w-full'>
                <div className="grid grid-col-1 gap-6">
                    {arrayList.map((_, index) => (
                        <SkeletonFull key={index} />
                    ))}
                </div>
            </div>
        ) : (
            <div className='bg-light p-3 rounded-xl border w-full'>
                <Tabs defaultValue={activeTab} value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="bg-light border gap-1 shadow-none">
                        <TabsTrigger value="Personal information" className='bg-background data-[state=active]:bg-muted'>Personal info</TabsTrigger>
                        <TabsTrigger value="Change password" className='bg-background data-[state=active]:bg-muted'>Change password</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Personal information">
                        <Card className='w-full shadow-none mt-4 p-4'>
                            <form onSubmit={handleSubmit}>
                                <div className="grid gap-6">
                                    <div className="flex flex-row gap-2 justify-between items-start">
                                        <div>
                                            <Label htmlFor="email">Role</Label>
                                            <h3 className='rounded-md bg-green-100 text-green-500 px-2 font-medium py-0.5 w-fit'>{originalProfile?.role}</h3>
                                        </div>
                                        <div className="text-right">
                                            <Label htmlFor="email" className='text-right'>Status</Label>
                                            <h3 className={`rounded-md px-2 font-medium py-0.5 w-fit ${originalProfile?.status === "ACTIVE" ? "bg-green-100 text-green-500" : "bg-red-100 text-red-500"}`}>{originalProfile?.status}</h3>
                                        </div>
                                    </div>
                                    <div className='grid gap-6 md:grid-cols-2'>
                                        <div className="grid gap-2">
                                            <Label htmlFor="firstname">First name</Label>
                                            <Input id="firstname" value={profile.first_name} type="text" onChange={(e: any) => setProfile({ ...profile, first_name: e.target.value})} placeholder="Enter first name here" />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="lastname">Last name</Label>
                                            <Input id="lastname" value={profile.last_name} type="text" onChange={(e: any) => setProfile({ ...profile, last_name: e.target.value})} placeholder="Enter last name here" />
                                        </div>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="email">Email address</Label>
                                        <Input id="email" value={profile.email} type="email" placeholder="Email address" disabled className='bg-muted' />
                                    </div>
                            
                                    <Button loading={isSubmitting} disabled={isSubmitting} type="submit" className='max-w-40' variant={"primary"}>
                                        {isSubmitting ? "Updating..." : "Update profile"}
                                    </Button>
                                    
                                </div>
                            </form>
                        </Card>
                    </TabsContent>
                    <TabsContent value="Change password">
                        <Card className='w-full shadow-none mt-4 p-4'>
                            <form onSubmit={handleNewPassword}>
                                <div className="grid gap-6">
                                    <div className="grid gap-2">
                                        <Label htmlFor="old-password">Old password</Label>
                                        <Input id="old-password" value={passwords.oldPassword} onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })} type="password" placeholder="Enter old password" required/>
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="new-password">New password</Label>
                                        <Input id="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} type="password" placeholder="Enter new password" required />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="cnew-password">Confirm new password</Label>
                                        <Input id="cnew-password" value={passwords.confirmNewPassword} onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })} type="password" placeholder="Confirm password" required />
                                    </div>
                                
                            
                                    <Button loading={isSubmittingPassword} disabled={isSubmittingPassword} type="submit" className='max-w-40' variant={"primary"} onClick={handleNewPassword}>
                                        {isSubmittingPassword ? "Updating..." : "Change password"}
                                    </Button>
                                    
                                </div>
                            </form>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        )}

    </div>
  )
}

export default Page
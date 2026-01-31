import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical, Eye, EyeOff } from "lucide-react";
import { Roles, StaffType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReduceTextLength from "@/utils/ReduceTextLength";
import { formatEnums } from "@/utils/formatEnums";
import { generateStrongPassword } from "@/utils/generateStrongPassword";

const staffSchema = z.object({
  firstName: z.string().min(1, "first name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["CO_CEO", "GENERAL_MANAGER", "GENERAL_ACCOUNTANT", "MANAGER", "ACCOUNTANT", "SALES_PERSON"], {
    message: "Role must be CO_CEO, GENERAL_MANAGER, GENERAL_ACCOUNTANT, MANAGER, ACCOUNTANT or SALES_PERSON"
  })
})

type StaffProps = {
  staff: StaffType;
  getStaffs: () => void;
};

const StaffMore = ({ staff, getStaffs }: StaffProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const [form, setForm] = useState({
    firstName: staff.firstName || "",
    lastName: staff.lastName || "",
    email: staff.email || "",
    role: staff.role || 'SALES_PERSON'
  });

  const hasChanges =
    form.firstName !== (staff?.firstName || "") ||
    form.lastName !== (staff?.lastName || "") ||
    form.email !== (staff?.email || "") ||
    form.role !== (staff?.role || "");

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();

    const result = staffSchema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        ...form,
        staffId: staff.id
      }

      const response = await axiosClient.patch(`/staffs/edit-staff`, data);
      toast.success(response.data?.message);
      setOpenConfirmModal(false)
      setOpenEditModal(false);
      
      getStaffs();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteStaff = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/staffs/delete-staff/${staff.id}`);
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getStaffs();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm"><EllipsisVertical /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-28" align="end">

        <Dialog open={openViewModal} onOpenChange={setOpenViewModal}>
          <DialogTrigger asChild>
            <button className="w-full text-start px-2 py-1">View</button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl p-4 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
              <DialogHeader>
                <DialogTitle>View Staff</DialogTitle>
                <DialogDescription>Details of this staff</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>First name:</strong> {staff.firstName}</p>
                <p><strong>Last name:</strong> {staff.lastName}</p>
                <p><strong>Email:</strong> {staff.email}</p>
                <p><strong>Role:</strong>  {formatEnums(staff?.role)}</p>
                <p><strong>Status:</strong>  {formatEnums(staff?.status)}</p>
                <p><strong>Branch added to:</strong> {staff.branch ? staff.branch?.name : "General"}</p>
                <p><strong>Date added:</strong> {format(new Date(staff?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(staff?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
              </div>

              <DialogFooter>
                <Button onClick={() => setOpenViewModal(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openEditModal} onOpenChange={setOpenEditModal}>
          <DialogTrigger asChild>
            <button className="w-full text-start px-2 py-1">Edit</button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl p-4 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
            <form>
              <DialogHeader>
                <DialogTitle>Edit Staff</DialogTitle>
                <DialogDescription>Update the details of this staff below.</DialogDescription>
              </DialogHeader>

              <div className="w-full bg-light py-4 flex flex-col items-center justify-center gap-3">
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="p-name" className='text-accent-foreground'>First Name</Label>
                        <Input id="p-name" value={form.firstName} onChange={(e: any) => setForm({ ...form, firstName: e.target.value})} placeholder="Enter here"/>
                    </span>
                    <span className="grid gap-2 w-full">
                        <Label htmlFor="Product description" className='text-accent-foreground'>Last Name</Label>
                        <Textarea value={form.lastName} onChange={(e: any) => setForm({ ...form, lastName: e.target.value})} placeholder="Enter very short description here" className='resize-none h-16 scrollbar-rounded' />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e: any) => setForm({ ...form, email: e.target.value})} placeholder="Enter email address here" />
                    </span>
                    <span className='grid gap-2 w-full'>
                        <Label htmlFor="rooms" className='text-accent-foreground'>Staff Role</Label>
                        <Select value={form.role} onValueChange={(value) => setForm({ ...form, role: value as Roles })}>
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
                </div>

              <DialogFooter>
                <Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
                  <DialogTrigger asChild>
                    <Button variant={"primary"} disabled={isSubmitting || !hasChanges} type="button" className="w-full">
                      {!hasChanges
                        ? "No changes"
                        : "Confirm"}
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="rounded-2xl p-4 w-[350px] max-w-[90vw] gap-0">
                    {/* Header */}
                    <DialogHeader className="bg-background-light rounded-t-2xl pb-4 flex flex-row items-center justify-between gap-2">
                      <DialogTitle className="text-sm font-semibold">Confirm Edit</DialogTitle>
                    </DialogHeader>

                    {/* Description */}
                    <DialogDescription className="bg-light pb-4 flex flex-col items-center justify-center gap-3 text-sm leading-relaxed">
                      <span>You are about to submit an updated infomation of this staff. Please ensure that the new edited fields are correct before proceeding.</span>
                    </DialogDescription>

                    {/* Footer */}
                    <DialogFooter className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setOpenConfirmModal(false)}
                      >
                        Cancel
                      </Button>
                      <Button variant={"primary"} loading={isSubmitting} disabled={isSubmitting} onClick={handleSubmitEdit} type="button">
                        {isSubmitting ? "Updating..." : "Update Staff"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={openDeleteModal} onOpenChange={setOpenDeleteModal}>
          <DialogTrigger asChild>
            <button className="w-full text-start px-2 py-1">Delete</button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl p-4 w-[350px] max-w-[90vw] gap-0">
            {/* Header */}
            <DialogHeader className="bg-background-light rounded-t-2xl pb-4 flex flex-row items-center justify-between gap-2">
              <DialogTitle className="text-sm font-semibold">Confirm Delete</DialogTitle>
            </DialogHeader>

            {/* Description */}
            <DialogDescription className="bg-light pb-4 flex flex-col items-center justify-center gap-3 text-sm leading-relaxed">
              <span className="break-words">
                Are you sure you want to delete this staff:{" "}
                <strong className="break-all">{`${ReduceTextLength(staff?.firstName, 50)} ${ReduceTextLength(staff?.lastName, 50)}`}</strong>?  
                This action cannot be undone.
              </span>
            </DialogDescription>

            {/* Footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenDeleteModal(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                loading={isDeleting}
                disabled={isDeleting}
                onClick={deleteStaff}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default StaffMore;

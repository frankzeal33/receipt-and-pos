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
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { EllipsisVertical } from "lucide-react";
import { CustomerType, Roles, StaffType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReduceTextLength from "@/utils/ReduceTextLength";

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

type CustomerProps = {
  customer: CustomerType;
  getCustomers: () => void;
};

const CustomerMore = ({ customer, getCustomers }: CustomerProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const [form, setForm] = useState({
    name: customer.name || "",
    email: customer.email || "",
    phone: customer.phone || "",
    address: customer.address || "",
  });

  const hasChanges =
    form.name !== (customer?.name || "") ||
    form.email !== (customer?.email || "") ||
    form.phone !== (customer?.phone || "") ||
    form.address !== (customer?.address || "");

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();

    const result = addCustomerSchema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axiosClient.patch(`/sales/edit-customer/${customer.id}`, form);
      toast.success(response.data?.message);
      setOpenConfirmModal(false)
      setOpenEditModal(false);
      
      getCustomers();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteCustomer = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/sales/delete-customer/${customer.id}`);
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getCustomers();
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
                <DialogTitle>View Customer</DialogTitle>
                <DialogDescription>Details of this customer</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Name:</strong> {customer?.name}</p>
                <p><strong>Email:</strong> {customer?.email ? customer?.email : "Not set"}</p>
                <p><strong>Phone:</strong>  {customer?.phone ? customer?.phone : "Not set"}</p>
                <p><strong>Address:</strong>  {customer?.address ? customer?.address : "Not set"}</p>
                {/* <p><strong>Branch added to:</strong> {customer.branch ? customer.branch?.name : "General"}</p> */}
                <p><strong>Date added:</strong> {format(new Date(customer?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(customer?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
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
                <DialogTitle>Edit Customer</DialogTitle>
                <DialogDescription>Update the details of this customer below.</DialogDescription>
              </DialogHeader>

              <div className="w-full bg-light py-4 flex flex-col items-center justify-center gap-3">
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
                      <span>You are about to submit an updated infomation of this customer. Please ensure that the new edited fields are correct before proceeding.</span>
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
                          {isSubmitting ? "Updating..." : "Update Customer"}
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
                Are you sure you want to delete this customer:{" "}
                <strong className="break-all">{ReduceTextLength(customer?.name, 100)}</strong>?  
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
                onClick={deleteCustomer}
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

export default CustomerMore;

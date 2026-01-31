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
import { CalendarIcon, EllipsisVertical, Eye, EyeOff } from "lucide-react";
import { ExpenseCategory, ExpensePaymentType, expenseType, Roles, StaffType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import ReduceTextLength from "@/utils/ReduceTextLength";
import { formatEnums } from "@/utils/formatEnums";
import displayCurrency from "@/utils/displayCurrency";
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
      message: "Invalid category",
    }),
    amount: z.string()
      .regex(/^\d+(\.\d{1,2})?$/, "Invalid amount format")  // e.g. 123 or 123.45
      .transform((val) => parseFloat(val)) // convert to number
      .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
    paymentType: z.enum([ "CASH", "CARD", "BANK_TRANSFER", "OTHER" ], {
      message: "Invalid payment type",
    }), 
    expenseDate: z.string()
      .refine((val) => !isNaN(Date.parse(val)), {
        message: "Invalid ISO date format",
      })
      .transform((val) => new Date(val)),
})

type expenseFormValues = z.infer<typeof expenseSchema>

type StaffProps = {
  expense: expenseType;
  getExpenses: () => void;
};

const ExpenseMore = ({ expense, getExpenses }: StaffProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showPassword, setShowPassword] = useState(false)

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const [form, setForm] = useState({
    title: expense.title || '',
    description: expense.description || '',
    category: expense.category || '',
    amount: expense.amount || '',
    paymentType: expense.paymentType || '',
    expenseDate: expense.expenseDate.split("T")[0] || ''
  })

  const hasChanges =
    form.title !== (expense?.title || "") ||
    form.description !== (expense?.description || "") ||
    form.category !== (expense?.category || "") ||
    form.amount !== (expense?.amount || "") ||
    form.paymentType !== (expense?.paymentType || "") ||
    form.expenseDate !== (expense?.expenseDate || "");

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();

    const result = expenseSchema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await axiosClient.patch(`/staffs/edit-expense/${expense.id}`, form);
      toast.success(response.data?.message);
      setOpenConfirmModal(false)
      setOpenEditModal(false);
      
      getExpenses();

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
      const response = await axiosClient.delete(`/staffs/delete-expense/${expense.id}`, {
        data: {}
      });
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getExpenses();
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
                <DialogTitle>View Expense</DialogTitle>
                <DialogDescription>Details of this expense</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Expense date:</strong> {format(new Date(expense?.expenseDate), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Expense title:</strong> {expense?.title}</p>
                <p><strong>Expense description:</strong> {expense?.description ? expense?.description : "-----"}</p>
                <p><strong>Category:</strong> {formatEnums(expense?.category)}</p>
                <p><strong>Amount:</strong>  {displayCurrency(Number(expense?.amount))}</p>
                <p><strong>Payment Type:</strong>  {formatEnums(expense?.paymentType)}</p>
                <p><strong>Date added:</strong> {format(new Date(expense?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(expense?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
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
                <DialogTitle>Edit Expense</DialogTitle>
                <DialogDescription>Update the details of this expense below.</DialogDescription>
              </DialogHeader>

              <div className="w-full bg-light py-4 flex flex-col items-center justify-center gap-3">
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
                  <Input id="date" type="date" value={form.expenseDate} onClick={(e) => (e.target as HTMLInputElement).showPicker?.()} onChange={(e: any) => setForm({ ...form, expenseDate: e.target.value})} />
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
                      <span>You are about to submit an updated infomation of this expense. Please ensure that the new edited fields are correct before proceeding.</span>
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
                        {isSubmitting ? "Updating..." : "Update Expense"}
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
                Are you sure you want to delete this expense:{" "}
                <strong className="break-all">{`${ReduceTextLength(expense?.title, 50)}`}</strong>?  
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

export default ExpenseMore

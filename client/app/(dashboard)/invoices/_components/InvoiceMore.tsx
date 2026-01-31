import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
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
import { InvoiceType, ProductType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import Link from "next/link";

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

type InvoiceProps = {
  invoice: InvoiceType;
  getInvoices: () => void;
};

const InvoiceMore = ({ invoice, getInvoices }: InvoiceProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/staffs/delete-invoice/${invoice.id}`, {
        data: {
          branchId: invoice.branchId || "",
        },
      });
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false);

      getInvoices();
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
                <DialogTitle>View Product</DialogTitle>
                <DialogDescription>Details of this product</DialogDescription>
              </DialogHeader>

              
          </DialogContent>
        </Dialog>

        <Link href={`/invoices/edit/${invoice.id}`}>
          <button className="w-full text-start px-2 py-1">Edit</button>
        </Link>

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
                Are you sure you want to delete this product:{" "}
                {/* <strong className="break-all">{ReduceTextLength(product?.productName, 50)}</strong>?   */}
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
                onClick={deleteProduct}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <button className="w-full text-start px-2 py-1">Mark as read</button>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default InvoiceMore

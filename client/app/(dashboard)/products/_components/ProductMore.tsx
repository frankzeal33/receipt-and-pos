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
import { EllipsisVertical } from "lucide-react";
import { ProductType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReduceTextLength from "@/utils/ReduceTextLength";
import { formatEnums } from "@/utils/formatEnums";

const productSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  productDesc: z.string().optional(),
  price: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, "Invalid price format") // format only
    .transform((val) => parseFloat(val)) // convert to number
    .refine((val) => val >= 0.01, { message: "Price must be at least 0.01" }),
  quantity: z.string()
    .regex(/^\d+$/, "Quantity must be a whole number")
    .transform((val) => parseInt(val, 10)),
  status: z.enum(["IN_STOCK", "OUT_OF_STOCK", "LOW_STOCK"])
});

type ProductProps = {
  product: ProductType;
  getProducts: () => void;
};

const ProductMore = ({ product, getProducts }: ProductProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const [productForm, setProductForm] = useState({
    productName: product.productName || "",
    productDesc: product.productDesc || "",
    price: product.price.toString() || "",
    quantity: product.quantity.toString() || "",
    status: product.status || "IN_STOCK",
  });

   // Check if form values differ from original product
  const hasChanges =
    productForm.productName !== (product?.productName || "") ||
    productForm.productDesc !== (product?.productDesc || "") ||
    productForm.price.toString() !== (product?.price?.toString() || "") ||
    productForm.quantity.toString() !== (product?.quantity?.toString() || "") ||
    productForm.status !== (product?.status || "");

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();

    const result = productSchema.safeParse(productForm);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    const data = {
      ...productForm,
      quantity: Number(productForm.quantity),
      productId: product.id
    }

    try {
      setIsSubmitting(true);

      const response = await axiosClient.patch(`/staffs/edit-product`, data);
      toast.success(response.data?.message);
      setOpenConfirmModal(false)
      setOpenEditModal(false);
      
      getProducts();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/staffs/delete-product/${product.id}`);
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false);

      getProducts();
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

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Name:</strong> {product.productName}</p>
                <p><strong>Description:</strong> {product.productDesc}</p>
                <p><strong>Price:</strong> {product.price}</p>
                <p><strong>Quantity available:</strong> {product.quantity}</p>
                <p><strong>Category:</strong> {product.category}</p>
                <p><strong>Brand:</strong> {product.brand}</p>
                <p><strong>Status:</strong> {formatEnums(product?.status)}</p>
                <p><strong>Branch added to:</strong> {product.branch ? product.branch?.name : "General"}</p>
                <p><strong>Date added:</strong> {format(new Date(product?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(product?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Added by:</strong> {product.addedBy} ({formatEnums(product?.role)})</p>
                <p><strong>Edited last by:</strong> {product.currentlyEditedBy} ({formatEnums(product?.editedRole)})</p>
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
                <DialogTitle>Edit Product</DialogTitle>
                <DialogDescription>Update the details of this product below.</DialogDescription>
              </DialogHeader>

              <div className="w-full bg-light py-4 flex flex-col items-center justify-center gap-3">
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
                        <Select value={productForm.status} onValueChange={(value) => setProductForm({ ...productForm, status: value as "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK" })}>
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
                      <span>You are about to submit an updated infomation of this product. Please ensure that the new edited fields are correct before proceeding.</span>
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
                          {isSubmitting ? "Updating..." : "Update Product"}
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
                Are you sure you want to delete this product:{" "}
                <strong className="break-all">{ReduceTextLength(product?.productName, 50)}</strong>?  
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

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProductMore;

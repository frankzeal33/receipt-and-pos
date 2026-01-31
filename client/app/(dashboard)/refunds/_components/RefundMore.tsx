import { useState } from "react";
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
import { OrderType } from "@/types/General";
import { format } from "date-fns";
import { formatEnums } from "@/utils/formatEnums";
import displayCurrency from "@/utils/displayCurrency";

type ProductProps = {
  order: OrderType;
  getOrders: () => void;
};

const RefundMore = ({ order, getOrders }: ProductProps) => {

  const [openViewModal, setOpenViewModal] = useState(false);

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
                <p><strong>Customer Name:</strong> {order.customerName}</p>
                <p><strong>Receipt No:</strong> {order.receiptNo}</p>
                <p><strong>Discount:</strong> {displayCurrency(Number(order?.discount), "NGN")}</p>
                <p><strong>Tax:</strong> {displayCurrency(Number(order?.tax), "NGN")}</p>
                <p><strong>Total Amount:</strong> {displayCurrency(Number(order?.totalAmount), "NGN")}</p>
                <p><strong>Payment Type:</strong> {formatEnums(order?.paymentType)}</p>
                <p><strong>Status:</strong> {formatEnums(order?.status)}</p>
                {/* <p><strong>Branch added to:</strong> {order.branch ? order.branch?.name : "General"}</p> */}
                <p><strong>Date added:</strong> {format(new Date(order?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(order?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Sold By:</strong> {order?.sellerEmail}</p>
                <p><strong>Corrected With:</strong> {order?.correctedWith ? order?.correctedWith : "-----"}</p>
              </div>

              <DialogFooter>
                <Button onClick={() => setOpenViewModal(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default RefundMore;

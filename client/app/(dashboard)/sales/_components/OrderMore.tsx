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
import { OrderType } from "@/types/General";
import { format } from "date-fns";
import { formatEnums } from "@/utils/formatEnums";
import displayCurrency from "@/utils/displayCurrency";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "react-toastify";
import { axiosClient } from "@/GlobalApi";
import ReduceTextLength from "@/utils/ReduceTextLength";

type ProductProps = {
  order: OrderType;
  getOrders: () => void;
};

const OrderMore = ({ order, getOrders }: ProductProps) => {

  const [openViewModal, setOpenViewModal] = useState(false);
  const [openSaleItemModal, setOpenSaleItemModal] = useState(false);
  const [openRefundModal, setOpenRefundModal] = useState(false);

  const [isRefunding, setIsRefunding] = useState(false);

   const refundSale = async (e: FormEvent) => {
      e.preventDefault();
      try {
        setIsRefunding(true);
        const response = await axiosClient.post(`/sales/refund-sale/${order.id}`);
      
        toast.success(response.data?.message);
        setOpenRefundModal(false)
        getOrders();
      } catch (err: any) {
        toast.error(err.response?.data?.message || "Something went wrong");
      } finally {
        setIsRefunding(false);
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
            <button className="w-full text-start px-2 py-1">Sale info</button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl p-4 w-[300px] md:w-[500px] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
              <DialogHeader>
                <DialogTitle>Sale info</DialogTitle>
                <DialogDescription>Details of this product</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Customer Name:</strong> {order.customerName}</p>
                <p><strong>Receipt No:</strong> {order.receiptNo}</p>
                <p><strong>Subtotal:</strong> {displayCurrency(Number(order?.subtotal), "NGN")}</p>
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

        <Dialog open={openSaleItemModal} onOpenChange={setOpenSaleItemModal}>
          <DialogTrigger asChild>
            <button className="w-full text-start px-2 py-1">Sale items</button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl p-4 w-[90%] md:min-w-[70%] gap-0 max-h-[95%] overflow-y-auto scrollbar-rounded">
              <DialogHeader>
                <DialogTitle>Sale items</DialogTitle>
                <DialogDescription>Items sold for this sale</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <Table>
                  <TableHeader>
                      <TableRow className="bg-muted">
                        <TableHead className="rounded-tl-lg capitalize">#</TableHead>
                        <TableHead className='capitalize'>Item</TableHead>
                        <TableHead className='capitalize'>Qty</TableHead>
                        <TableHead className='capitalize'>Price</TableHead>
                        <TableHead className="rounded-tr-lg capitalize">Total</TableHead>
                      </TableRow>
                  </TableHeader>
                  {
                      order.saleItems.length !== 0 &&
                          (
                          <TableBody>
                              {order.saleItems.map((order, index) => (
                              <TableRow key={order?.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell className="font-medium">{order?.product?.productName}</TableCell>
                                <TableCell className="font-medium">{order?.quantity}</TableCell>
                                <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(order?.price), "NGN")}</TableCell>
                                <TableCell className={`capitalize font-semibold`}>{displayCurrency(Number(order?.total), "NGN")}</TableCell>
                              </TableRow>
                              ))}
                          </TableBody>
                      )
                  }  
                </Table>

                <p><strong>Subtotal:</strong> {displayCurrency(Number(order?.subtotal), "NGN")}</p>
                <p><strong>Discount:</strong> {displayCurrency(Number(order?.discount), "NGN")}</p>
                <p><strong>Tax:</strong> {displayCurrency(Number(order?.tax), "NGN")}</p>
                <p><strong>Total Amount:</strong> {displayCurrency(Number(order?.totalAmount), "NGN")}</p>

              </div>

              <DialogFooter>
                <Button onClick={() => setOpenSaleItemModal(false)}>Close</Button>
              </DialogFooter>
          </DialogContent>
        </Dialog>

        {order?.status === "PAID" && (
          <Link href={`/sales/edit/${order.id}`}>
            <button className="w-full text-start px-2 py-1">Correct sale</button>
          </Link>
        )}         

        {order?.status === "PAID" && (
          <Dialog open={openRefundModal} onOpenChange={setOpenRefundModal}>
            <DialogTrigger asChild>
              <button className="w-full text-start px-2 py-1">Refund sale</button>
            </DialogTrigger>
            <DialogContent className="rounded-2xl p-4 w-[350px] max-w-[90vw] gap-0">
              {/* Header */}
              <DialogHeader className="bg-background-light rounded-t-2xl pb-4 flex flex-row items-center justify-between gap-2">
                <DialogTitle className="text-sm font-semibold">Confirm Refund</DialogTitle>
              </DialogHeader>

              {/* Description */}
              <DialogDescription className="bg-light pb-4 flex flex-col items-center justify-center gap-3 text-sm leading-relaxed">
                <span className="break-words">
                  Are you sure you want to refund customer:{" "}
                  <strong className="break-all">Receipt No: {`${order?.receiptNo}, Customer: ${ReduceTextLength(order?.customerName, 50)}`}</strong>? 
                  This action cannot be undone.
                </span>
              </DialogDescription>

              {/* Footer */}
              <DialogFooter className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenRefundModal(false)}
                >
                  Cancel
                </Button>

                <Button
                  loading={isRefunding}
                  disabled={isRefunding}
                  onClick={refundSale}
                >
                  {isRefunding ? "Submitting..." : "Refund"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default OrderMore;

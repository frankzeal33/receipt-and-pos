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
import { HistoryType } from "@/types/General";
import { format } from "date-fns";
import { formatEnums } from "@/utils/formatEnums";
import displayCurrency from "@/utils/displayCurrency";

type HistoryProps = {
  history: HistoryType;
  getHistories: () => void;
};

const HistoryMore = ({ history, getHistories }: HistoryProps) => {

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
                <DialogTitle>View Payment</DialogTitle>
                <DialogDescription>Details of this payment</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Reference No:</strong> {history?.reference}</p>
                <p><strong>Subscription Plan:</strong> {formatEnums(history?.plan)}</p>
                <p><strong>Amount:</strong> {displayCurrency(Number(history?.amount), "NGN")}</p>
                <p><strong>Billing:</strong> {formatEnums(history?.billing)}</p>
                <p><strong>Payment Status:</strong> {formatEnums(history?.status)}</p>
                <p><strong>Paid by:</strong> {history?.user?.email}</p>
                <p><strong>User Role:</strong> {formatEnums(history?.user?.role)}</p>
                <p><strong>Date added:</strong> {format(new Date(history.createdAt), "dd MMM yyyy hh:mm a")}</p>
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

export default HistoryMore;

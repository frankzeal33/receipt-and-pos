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
import { NotificationType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReduceTextLength from "@/utils/ReduceTextLength";
import { formatEnums } from "@/utils/formatEnums";

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
  notification: NotificationType;
  getNotifications: () => void;
};

const NotificationMore = ({ notification, getNotifications }: CustomerProps) => {

  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteNotification = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/staffs/delete-notification/${notification.id}`);
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getNotifications();
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
                <DialogTitle>View Notification</DialogTitle>
                <DialogDescription>Details of this notification</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Title:</strong> {notification?.title}</p>
                <p><strong>Desc:</strong> {notification?.description}</p>
                <p><strong>Role:</strong>  {formatEnums(notification?.role)}</p>
                {/* <p><strong>Branch added to:</strong> {customer.branch ? customer.branch?.name : "General"}</p> */}
                <p><strong>Date:</strong> {format(new Date(notification?.createdAt), "dd MMM yyyy hh:mm a")}</p>
              </div>

              <DialogFooter>
                <Button onClick={() => setOpenViewModal(false)}>Close</Button>
              </DialogFooter>
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
                Are you sure you want to delete this notification:{" "}
                <strong className="break-all">{ReduceTextLength(notification?.title, 100)}</strong>?  
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
                onClick={deleteNotification}
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

export default NotificationMore;

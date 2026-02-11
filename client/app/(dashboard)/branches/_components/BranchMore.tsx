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
import { BranchType } from "@/types/General";
import { axiosClient } from "@/GlobalApi";
import { z } from "zod";
import { toast } from "react-toastify";
import { format } from "date-fns";
import ReduceTextLength from "@/utils/ReduceTextLength";
import { formatEnums } from "@/utils/formatEnums";

const branchSchema = z.object({
  name: z.string().min(1, "Branch name is required"),
  location: z.string().min(1, "Branch Address is required")
})

type BranchProps = {
  branch: BranchType;
  getBranches: () => void;
};

const BranchMore = ({ branch, getBranches }: BranchProps) => {

  const [openEditModal, setOpenEditModal] = useState(false);
  const [openViewModal, setOpenViewModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [openDisableModal, setOpenDisableModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);

  const isActive = branch.status === "ACTIVE";
  const nextStatus = isActive ? "INACTIVE" : "ACTIVE";


  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openConfirmModal, setOpenConfirmModal] = useState(false)

  const [form, setForm] = useState({
    name: branch.name || "",
    location: branch.location || ""
  });

  const hasChanges =
    form.name !== (branch?.name || "") ||
    form.location !== (branch?.location|| "")

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();

    const result = branchSchema.safeParse(form);

    if (!result.success) {
      toast.error(result.error.errors[0].message);
      return;
    }

    try {
      setIsSubmitting(true);

      const data = {
        ...form,
        branchId: branch.id
      }

      const response = await axiosClient.patch(`/branches/edit-branch`, data);
      toast.success(response.data?.message);
      setOpenConfirmModal(false)
      setOpenEditModal(false);
      
      getBranches();

    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteBranch = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDeleting(true);
      const response = await axiosClient.delete(`/branches/delete-branch/${branch.id}`);
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  }

  const disableBranch = async (e: FormEvent) => {
    e.preventDefault();
    try {
      setIsDisabling(true);
      const response = await axiosClient.patch(`/branches/disable-branch/${branch.id}`,{
        status: nextStatus
      });
    
      toast.success(response.data?.message);
      setOpenDeleteModal(false)
      getBranches();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsDisabling(false);
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
                <DialogTitle>View Branch</DialogTitle>
                <DialogDescription>Details of this Branch</DialogDescription>
              </DialogHeader>

              <div className="w-full flex flex-col gap-3 py-4">
                <p><strong>Branch name:</strong> {branch.name}</p>
                <p><strong>Branch address:</strong> {branch?.location ? branch.location : "Not set"}</p>
                <p><strong>Branch status:</strong>  {formatEnums(branch?.status)}</p>
                <p><strong>Date added:</strong> {format(new Date(branch?.createdAt), "dd MMM yyyy hh:mm a")}</p>
                <p><strong>Last updated:</strong> {format(new Date(branch?.updatedAt), "dd MMM yyyy hh:mm a")}</p>
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
                <DialogTitle>Edit Branch</DialogTitle>
                <DialogDescription>Update the details of this branch below.</DialogDescription>
              </DialogHeader>

              <div className="w-full bg-light py-4 flex flex-col items-center justify-center gap-3">
                <span className='grid gap-2 w-full'>
                  <Label htmlFor="name" className='text-accent-foreground'>Branch Name</Label>
                  <Input id="name" value={form.name} onChange={(e: any) => setForm({ ...form, name: e.target.value})} placeholder="Enter here"/>
                </span>
                <span className="grid gap-2 w-full">
                  <Label htmlFor="Product description" className='text-accent-foreground'>Branch Address</Label>
                  <Textarea value={form.location} onChange={(e: any) => setForm({ ...form, location: e.target.value})} placeholder="Enter here" className='resize-none h-16 scrollbar-rounded' />
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
                      <span>You are about to submit an updated infomation of this branch. Please ensure that the new edited fields are correct before proceeding.</span>
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
                        {isSubmitting ? "Updating..." : "Update Branch"}
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
                Are you sure you want to delete this branch:{" "}
                <strong className="break-all">{ReduceTextLength(branch?.name, 50)}</strong>?  
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
                onClick={deleteBranch}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={openDisableModal} onOpenChange={setOpenDisableModal}>
          <DialogTrigger asChild>
            <button className="w-full text-start px-2 py-1">{isActive ? "Disable" : "Enable"}</button>
          </DialogTrigger>

          <DialogContent className="rounded-2xl p-4 w-[350px] max-w-[90vw] gap-0">
            {/* Header */}
            <DialogHeader className="bg-background-light rounded-t-2xl pb-4 flex flex-row items-center justify-between gap-2">
              <DialogTitle className="text-sm font-semibold">{isActive ? "Confirm Disable" : "Confirm Enable"}</DialogTitle>
            </DialogHeader>

            {/* Description */}
            <DialogDescription className="bg-light pb-4 flex flex-col items-center justify-center gap-3 text-sm leading-relaxed">
              {isActive ? (
                <span className="break-words">
                  Are you sure you want to disable this branch:{" "}
                  <strong>{ReduceTextLength(branch.name, 50)}</strong>?  
                  Disabling this branch will prevent all staff on this particular branch from logging in.
                </span>
              ) : (
                <span className="break-words">
                  Are you sure you want to enable this branch:{" "}
                  <strong>{ReduceTextLength(branch.name, 50)}</strong>?  
                  Staffs on this branch will regain access to the system.
                </span>
              )}
            </DialogDescription>

            {/* Footer */}
            <DialogFooter className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setOpenDisableModal(false)}
              >
                Cancel
              </Button>

              <Button
                variant="destructive"
                loading={isDisabling}
                disabled={isDisabling}
                onClick={disableBranch}
              >
                {isDisabling
                  ? isActive ? "Disabling..." : "Enabling..."
                  : isActive ? "Disable" : "Enable"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default BranchMore;

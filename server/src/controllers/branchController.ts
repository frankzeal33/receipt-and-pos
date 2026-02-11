import { Request, Response } from "express";
import expressAsyncHandler from "express-async-handler";
import prisma from "../utils/db.ts";
import { addBranchInput, deleteBranchInput, editBranchInput, enableDisableBranchInput, paginationInput } from "../types/zodtypes/branchType.ts";

export const addBranch = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    const { name, location } = (req.validated as addBranchInput).body;

    const nameExists = await prisma.branch.findFirst({
        where: {
            companyId: req.user.companyId,
            name: {
                equals: name,
                mode: "insensitive",
            },
        },
    });

    if (nameExists) {
        res.status(400);
        throw new Error('This branch name already exists');
    }

    const newBranch = await prisma.branch.create({
        data: {
            name,
            location,
            companyId: req.user.companyId
        },
    });

    res.status(201).json({
        success: true,
        message: `New branch "${newBranch.name}" added successfully`
    });
    
});

export const editBranch = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    const { branchId, name, location } = (req.validated as editBranchInput).body;

    const dataToUpdate: any = {};

    if (name) dataToUpdate.name = name;
    if (location) dataToUpdate.location = location;

    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });

    if(!branchIdExists){
      res.status(404);
      throw new Error('This branch does not exist in your company')
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: branchId, companyId: req.user.companyId },
      data: dataToUpdate
    });

    res.status(200).json({
      success: true,
      message: `Branch ${updatedBranch.name} updated successfully`
    });
    
});

export const disableEnableBranch = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    const { status } = (req.validated as enableDisableBranchInput).body;
    const { branchId } = (req.validated as enableDisableBranchInput).params;

    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });

    if(!branchIdExists){
      res.status(404);
      throw new Error('This branch does not exist in your company')
    }

    const updatedBranch = await prisma.branch.update({
      where: { id: branchId, companyId: req.user.companyId },
      data: {
        status
      }
    });

    res.status(200).json({
      success: true,
      message: `Branch ${updatedBranch.name} ${updatedBranch.status === "ACTIVE" ? "enabled": "disabled"} successfully`
    });
    
});

export const deleteBranch = expressAsyncHandler(async (req: Request, res: Response): Promise<void> => {

    const { branchId } = (req.validated as deleteBranchInput).params;

    const branchIdExists = await prisma.branch.findFirst({ where: { id: branchId, companyId: req.user.companyId } });

    if(!branchIdExists){
      res.status(404);
      throw new Error('This branch does not exist in your company')
    }

    const branchCount = await prisma.branch.count({
      where: { companyId: req.user.companyId },
    });

    // Prevent deleting the last branch
    if (branchCount <= 1) {
      res.status(400);
      throw new Error("You cannot delete the only branch in your company");
    }

    const deleteBranch = await prisma.branch.delete({
        where: { id: branchId, companyId: req.user.companyId },
    });

    res.status(200).json({
        success: true,
        message: `Branch "${deleteBranch.name}" deleted successfully`,
    });
    
});

export const getBranches = expressAsyncHandler(async (req: Request, res: Response) => {

  const { search, page, limit } = (req.validated as paginationInput).query;

  const skip = (page - 1) * limit;

  // filters
  const where: any = { companyId: req.user.companyId };

  if (search) {
    where.OR = [
      { name: { contains: search as string, mode: "insensitive" } },
      { location: { contains: search as string, mode: "insensitive" } },
    ];
  }

  // count
  const totalCount = await prisma.branch.count({ where });

  // fetch
  const branches = await prisma.branch.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: "desc" }
  });

  // calculate total pages
  const totalPages = Math.ceil(totalCount / limit);

  // response
  res.status(200).json({
    success: true,
    message: "Branches fetched successfully",
    pagination: { 
      totalCount,
      totalPages,
      currentPage: page,
      limit,
      count: branches.length,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      nextPage: page < totalPages ? page + 1 : null,
      prevPage: page > 1 ? page - 1 : null,
    },
    result: branches,
  });
});
import express from 'express'
import { validateMiddleware } from '../middlewares/validateMiddleware.ts';
import { addBranch, deleteBranch, disableEnableBranch, editBranch, getBranches } from '../controllers/branchController.ts';
import { addBranchSchema, deleteBranchSchema, editBranchSchema, enableDisableBranchSchema, paginationSchema } from '../validations/branch.ts';

const router = express.Router();

router.post('/add-branch', validateMiddleware(addBranchSchema), addBranch);
router.patch('/edit-branch', validateMiddleware(editBranchSchema), editBranch);
router.patch('/disable-branch/:branchId', validateMiddleware(enableDisableBranchSchema), disableEnableBranch);
router.delete('/delete-branch/:branchId', validateMiddleware(deleteBranchSchema), deleteBranch);

router.get('/get-branches', validateMiddleware(paginationSchema), getBranches);


export default router;
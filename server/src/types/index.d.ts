import User from '../models/userModel.ts';

declare global {
  namespace Express {
    interface Request {
      user?: User; // or whatever the type of your user object is
      validated?: unknown; // we’ll override this per middleware
    }
  }
}

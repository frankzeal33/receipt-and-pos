// validate.ts
import z, { ZodType, ZodError } from "zod";
import { Request, Response, NextFunction } from "express";

export const validateMiddleware =
  <T extends ZodType>(schema: T) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // infer type once
      (req as Request & { validated: z.infer<typeof schema> }).validated = parsed;

      return next();
    } catch (err) {

      if (err instanceof ZodError) {
        // Custom error formatting
        const formatted = err.issues.map((issue) => {
          return {
            field: issue.path.join("."),
            errors: issue.message
          };
        });

        return res.status(422).json({ 
          success: false,
          message: err.issues[0].message,
          errors: formatted 
        });
      }

      return res.status(500).json({ 
        success: false,
        message: "Internal Server Error" 
      });
    }
  };

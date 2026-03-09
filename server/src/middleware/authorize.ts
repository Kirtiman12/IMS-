import type { Request, Response, NextFunction } from "express";
import type { Role } from "@prisma/client";

export const authorize = (...roles: Role[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(401).json({ message: "Unauthenticated" });
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      res.status(403).json({ message: "Forbidden: insufficient permissions" });
      return;
    }
    next();
  };

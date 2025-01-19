import passport from 'passport';
import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/users';

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate('jwt', { session: false }, (err: any, user: IUser | false) => {
    if (err || !user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    req.user = user;
    next();
  })(req, res, next);
};


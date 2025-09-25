import { Request, Response, NextFunction } from 'express';
export class AuthMiddleware {
use(req: Request, _res: Response, next: NextFunction) {
// Demo only: in real life, decode JWT and load user/org
(req as any).user = { id: req.header('x-user-id') || 'demo-user' };
(req as any).org = { id: req.header('x-org-id') || 'demo-org' };
next();
}
}
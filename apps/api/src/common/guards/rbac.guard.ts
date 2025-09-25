import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
@Injectable()
export class RbacGuard implements CanActivate {
canActivate(context: ExecutionContext): boolean {
const req = context.switchToHttp().getRequest();
// Demo: always true; wire to Membership.role checks later
return Boolean(req.user && req.org);
}
}
import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { AuditService } from './audit.service.js';


@Injectable()
export class AuditInterceptor implements NestInterceptor {
constructor(private audit: AuditService) {}
intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
const req: any = context.switchToHttp().getRequest();
const { user, org, method, path, body } = req;
return next.handle().pipe(
tap(async (result) => {
// Minimal audit: record the route + entity keys if present
const entityType = result?.entityType || 'route';
const entityId = result?.id || result?.entityId || 'n/a';
await this.audit.log({
orgId: org?.id,
userId: user?.id,
action: `${method} ${path}`,
entityType,
entityId,
diff: { request: body }
});
})
);
}
}
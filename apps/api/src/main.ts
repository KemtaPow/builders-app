import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { json } from 'express';
import { AuditInterceptor } from './common/audit/audit.interceptor.js';
import { AuthMiddleware } from './common/auth/auth.middleware.js';


const PORT = Number(process.env.PORT || 4000);


async function bootstrap() {
const app = await NestFactory.create(AppModule);
// Enable CORS early so preflight OPTIONS succeed for POSTs from web dev server
app.enableCors({ origin: true, credentials: true });
app.use(json({ limit: '5mb' }));
app.use(new AuthMiddleware().use); // demo: reads x-user-id/x-org-id headers
app.useGlobalInterceptors(app.get(AuditInterceptor));
await app.listen(PORT);
console.log(`API listening on :${PORT}`);
}
bootstrap();

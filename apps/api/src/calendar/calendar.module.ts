import { Module, forwardRef } from '@nestjs/common';
import { CalendarService } from './calendar.service.js';
import { CalendarController } from './calendar.controller.js';
import { PrismaService } from '../prisma.service.js';
import { JobsModule } from '../jobs/jobs.module.js';
import { RbacGuard } from '../common/guards/rbac.guard.js';

@Module({
  imports: [forwardRef(() => JobsModule)],
  controllers: [CalendarController],
  providers: [CalendarService, PrismaService, RbacGuard],
})
export class CalendarModule {}


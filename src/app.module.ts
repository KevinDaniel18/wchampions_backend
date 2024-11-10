import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { MailService } from './mail/mail.service';

@Module({
  imports: [AuthModule],
  providers: [MailService],
})
export class AppModule {}

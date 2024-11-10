import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TwoFactorAuthService } from './two-factor-auth.service';
import { EncryptionService } from 'src/encryption/encryption.service';
import { MailService } from 'src/mail/mail.service';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '60m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    MailService,
    EncryptionService,
    TwoFactorAuthService,
  ],
})
export class AuthModule {}

import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'prisma/prisma.service';
import { MailService } from 'src/mail/mail.service';
import { TwoFactorAuthService } from './two-factor-auth.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { Verify2faDto } from './dto/verify-2fa.dto';
import { EncryptionService } from 'src/encryption/encryption.service';
import { SetupDto } from './dto/setup.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
    private readonly jwtService: JwtService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async register(createUserDto: CreateUserDto) {
    try {
      let secret: string;
      let qrCodeUrl: string;

      if (createUserDto.authMethod === 'google') {
        ({ secret, qrCodeUrl } =
          await this.twoFactorAuthService.generateTwoFactorSecret(
            createUserDto.email,
          ));
      }

      const existingUser = await this.prisma.user.findUnique({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        if (existingUser.isTwoFactorVerified) {
          throw new ConflictException('Email already exists');
        } else {
          throw new BadRequestException({
            message: 'Please verify your 2FA',
            userId: existingUser.id,
          });
        }
      }

      const user = await this.prisma.user.create({
        data: {
          userName: createUserDto.userName,
          email: createUserDto.email,
          password:
            createUserDto.authMethod === 'google'
              ? null
              : await bcrypt.hash(createUserDto.password, 10),
          twoFactorSecret: secret,
          isTwoFactorVerified: false,
        },
      });

      if (createUserDto.authMethod === 'google') {
        await this.mailService.send2FASetupEmail(user.email, qrCodeUrl);
      } else {
        await this.mailService.welcomeEmail(user.email, user.userName);
        await this.mailService.send2FASetupEmail(user.email, qrCodeUrl);
      }
      console.log('Usuario creado:', {
        id: user.id,
        userName: user.userName,
        email: user.email,
      });

      return { id: user.id, userName: user.userName, email: user.email };
    } catch (error) {
      throw error instanceof ConflictException || BadRequestException
        ? error
        : new InternalServerErrorException('An unknown error occurred');
    }
  }

  async verify2FA(verify2FADto: Verify2faDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: verify2FADto.userId },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const isValidToken = this.twoFactorAuthService.verifyToken(
        user.twoFactorSecret,
        verify2FADto.code,
      );

      if (!isValidToken) {
        throw new BadRequestException('Invalid 2FA token');
      }

      await this.prisma.user.update({
        where: { id: user.id },
        data: { isTwoFactorVerified: true },
      });

      return { message: '2FA verification successful' };
    } catch (error) {
      throw error instanceof NotFoundException || BadRequestException
        ? error
        : new InternalServerErrorException('An unknown error occurred');
    }
  }

  async markSetupAsComplete(userId: number, setupDto: SetupDto): Promise<void> {
    try {
      const { gender, age, weight, height, goals } = setupDto;
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          hasCompletedSetup: true,
          gender: gender,
          age: age,
          weight: weight,
          height: height,
        },
      });

      if (goals && goals.length > 0) {
        const goalData = goals.map((goal) => ({
          meta: goal.meta,
          userId: userId,
        }));
        await this.prisma.goal.createMany({
          data: goalData,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }

  async isSetupCompleted(userId: number) {
    if (!userId) {
      throw new Error('userId no proporcionado o es inválido');
    }
    try {
      const user = await this.prisma.user.findUnique({ where: { id: userId } });
      return { hasCompletedSetup: user?.hasCompletedSetup };
    } catch (error) {
      console.error(error);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: loginDto.email },
      });

      if (loginDto.authMethod === 'local') {
        if (
          !user ||
          !(await this.encryptionService.comparePasswords(
            loginDto.password,
            user.password,
          ))
        ) {
          throw new NotFoundException('User not found');
        }

        if (!user.isTwoFactorVerified) {
          throw new BadRequestException({
            message: 'Please verify your 2FA before logging in',
            userId: user.id,
          });
        }
      } else if (loginDto.authMethod === 'google') {
        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (!user.isTwoFactorVerified) {
          throw new BadRequestException({
            message: 'Please verify your 2FA before logging in',
            userId: user.id,
          });
        }
      }

      const payload = { userId: user.id, email: user.email };
      const token = this.jwtService.sign(payload);

      await this.prisma.sessions.create({
        data: {
          userId: user.id,
          accessToken: token,
          expiresAt: new Date(Date.now() + 3600000),
        },
      });

      console.log('Login successful', token);

      return { message: 'Login successful', accessToken: token };
    } catch (error) {
      throw error instanceof BadRequestException || NotFoundException
        ? error
        : new InternalServerErrorException('An unknown error occurred');
    }
  }
}

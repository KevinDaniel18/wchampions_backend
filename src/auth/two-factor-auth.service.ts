import { Injectable } from '@nestjs/common';
import * as speakeasy from 'speakeasy';
import * as QRCODE from 'qrcode';

@Injectable()
export class TwoFactorAuthService {
  async generateTwoFactorSecret(email: string) {
    const secret = speakeasy.generateSecret({
      name: `worldChampions (${email})`,
    });
    const qrCodeUrl = await QRCODE.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, qrCodeUrl };
  }

  verifyToken(secret: string, token: string) {
    return speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
    });
  }
}

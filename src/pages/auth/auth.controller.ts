import {
  Controller,
  Get,
  Res,
  Query,
  UnauthorizedException,
  Post,
  Req,
  Body,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { isEthereumAddress } from 'class-validator';
import { Response } from 'express';
import { SiweMessage, generateNonce } from 'siwe';
import { AuthService } from './auth.service';
import { Public } from 'src/decorators/public.decorator';
import { getErrorMsg, walletToLowercase } from 'src/helpers';
import { VerifyNonceDto } from './dto/verify-nonce.dto';
import { Cookies } from 'src/enums/cookie.enum';
import { CreateAuthDto } from './dto/create-auth.dto';
import { VerifyCaptchaDto } from './dto/verify-captcha.dto';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { catchError, lastValueFrom, map, throwError } from 'rxjs';
import { AxiosResponse } from 'axios';
import { createPublicClient, http } from 'viem';
import { Chain, baseSepolia } from 'viem/chains';
import { EmailService } from '../../email/email.service';
import { EmailEventEmitter } from 'src/email/email.emitter';
import { generateToken, tokenNumeric } from 'src/helpers/generate-id';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly http: HttpService,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private emailEv: EmailEventEmitter,
  ) {}

  @Public()
  @Post('register')
  async register(@Body() createAuthDto: CreateAuthDto) {
    try {
      const { wallet } = createAuthDto;
      const isEthAddr = isEthereumAddress(wallet);
      if (!isEthAddr) {
        return new UnauthorizedException('Unauthorized access');
      }

      const userAuth = await this.authService.findOne({
        wallet: walletToLowercase(wallet),
      });
      if (userAuth) {
        new ConflictException('User already exist');
      }

      const nonce = generateNonce();
      const newUserAuth = {
        wallet: walletToLowercase(wallet),
        nonce: nonce,
      };
      await this.authService.create(newUserAuth);

      return { nonce: nonce };
    } catch (error) {
      return getErrorMsg(error);
    }
  }

  @Public()
  @Post('captcha/verify')
  async verifyCaptcha(@Body() body: VerifyCaptchaDto) {
    try {
      const { token } = body;
      const secret = this.configService.get<string>('RECAPTCHA_KEY');
      const authResponse = await lastValueFrom(
        this.http
          .post(
            'https://www.google.com/recaptcha/api/siteverify',
            `secret=${secret}&response=${token}`,
            {
              headers: {
                'Content-Type':
                  'application/x-www-form-urlencoded; charset=utf-8',
              },
            },
          )
          .pipe(
            map((response: AxiosResponse) => {
              return response.data;
            }),
            catchError((error) => {
              return throwError(() => new Error(error));
            }),
          ),
      );

      if (!authResponse.success) {
        throw new UnauthorizedException();
      }

      return authResponse;
    } catch (error) {
      return getErrorMsg(error);
    }
  }

  @Public()
  @Get('nonce/generate')
  async generateNonce(@Query('wallet') wallet: string) {
    try {
      const isEthAddr = isEthereumAddress(wallet);
      if (!isEthAddr) {
        return new UnauthorizedException('Unauthorized access');
      }

      const userAuth = await this.authService.findOne({
        wallet: walletToLowercase(wallet),
      });
      if (!userAuth) {
        return new UnauthorizedException('Unauthorized access');
      }

      return { nonce: userAuth.nonce };
    } catch (error) {
      return getErrorMsg(error);
    }
  }

  @Public()
  @Post('nonce/verify')
  async verifyNonce(@Body() body: VerifyNonceDto) {
    try {
      const { message, signature, wallet } = body;
      console.log(body);
      const chain: any = baseSepolia;
      const client = createPublicClient({
        chain: chain,
        transport: http(chain.rpcUrls.default.http[0]),
      });
      const isValid = await client.verifySiweMessage({
        address: wallet,
        message: message,
        signature,
      });

      console.log(isValid);

      if (!isValid) throw new UnauthorizedException('Unauthorized user');

      const siweMessage = new SiweMessage(message);
      const [userAuth] = await Promise.all([
        this.authService.findOne({
          wallet: walletToLowercase(wallet),
        }),
      ]);

      if (!userAuth || userAuth.wallet == undefined)
        throw new UnauthorizedException('Unauthorized user');

      if (siweMessage.nonce !== userAuth.nonce)
        throw new NotFoundException('Incorrect nonce');

      const nonce = generateNonce();
      const accessToken = await this.authService.signIn(siweMessage, {
        wallet: userAuth.wallet,
        nonce: nonce,
      });

      await this.authService.update(
        {
          wallet: walletToLowercase(wallet),
        },
        { nonce: nonce },
      );

      const expire = 7 * 24 * 60 * 60;
      const payload = {
        ok: true,
        token: accessToken,
        expiresIn: expire,
      };

      return payload;
    } catch (error) {
      return getErrorMsg(error);
    }
  }

  @Get('session/verify')
  async verify(@Req() req: Request) {
    try {
      const authUser = req['user'];
      const user = await this.authService.findOne({ wallet: authUser.wallet });
      if (user) return { message: 'success' };
    } catch (error) {
      return getErrorMsg(error);
    }
  }

  @Get('transactions/count')
  async getTransactionsCount(@Req() req: Request) {
    const authUser = req['user'];
    const user = await this.authService.findOne({ wallet: authUser.wallet });
    if (!user) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const today = new Date().toISOString().split('T')[0];
    const lastTransactionDate = user.lastTxDate
      ? user.lastTxDate.toISOString().split('T')[0]
      : null;

    if (lastTransactionDate !== today) {
      user.txCount = 0;
      user.lastTxDate = new Date();
      user.save();
    }

    const remainingFreeTransactions = Math.max(0, 5 - user.txCount);
    return { count: remainingFreeTransactions };
  }

  @Get('logout')
  async logout(@Res() res: Response) {
    try {
      res.clearCookie(Cookies.ACCESS_TOKEN);
      return { ok: true };
    } catch (error: any) {
      return getErrorMsg(error);
    }
  }
}

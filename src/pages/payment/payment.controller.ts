import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  NotFoundException,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  ClaimPaymentByEmailDto,
  CreatePaymentDto,
  VerifyOtpDto,
} from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { EmailEventEmitter } from 'src/email/email.emitter';
import { Request } from 'express';
import { generateId, walletToLowercase } from 'src/helpers';
import { decodeBase64, hexlify, toUtf8Bytes, toUtf8String } from 'ethers';
import { Public } from 'src/decorators/public.decorator';
import { generateToken, tokenNumeric } from 'src/helpers/generate-id';
import { TwoFaService } from '../two-fa/two-fa.service';
import * as moment from 'moment';
import { baseSepolia } from 'viem/chains';
import { ConfigService } from '@nestjs/config';
import { DexaPayService } from '../contracts/dexa-pay/dexa-pay.service';

@Controller('payment')
export class PaymentController {
  constructor(
    private readonly paymentService: PaymentService,
    private readonly emailEv: EmailEventEmitter,
    private readonly twoFaService: TwoFaService,
    private readonly configService: ConfigService,
    private readonly dexaPayService: DexaPayService,
  ) {}

  @Post('email')
  async create(
    @Req() req: Request,
    @Body() createPaymentDto: CreatePaymentDto,
  ) {
    const { isRequest } = createPaymentDto;
    const authUser = req['user'];
    const paymentId = generateId(6).toLowerCase();
    const payload = {
      paymentId,
      from: walletToLowercase(authUser.wallet),
      isRequest: isRequest || false,
      paymentClaimHash: hexlify(toUtf8Bytes(paymentId)),
      ...createPaymentDto,
    };
    const payment = await this.paymentService.create(payload);
    console.log(payment);
    return payment;
  }

  @Public()
  @Post('verify-email')
  async claimByEmail(
    @Req() req: Request,
    @Body() body: ClaimPaymentByEmailDto,
  ) {
    console.log(body);
    const { email, paymentCode, ownerAddress } = body;
    const payment = await this.paymentService.findOne({
      paymentId: paymentCode.toLowerCase(),
      isClaimed: false,
      isOnChain: true,
      recipient_email: email.toLowerCase(),
    });
    if (!payment) {
      throw new NotFoundException('No payment found');
    }

    const token = generateToken(tokenNumeric, 6, true);
    const expiresAt = moment().add(10, 'minutes').toDate();
    const twoFactorEnabled = await this.twoFaService.findOne({
      email: email.toLowerCase(),
      senderWallet: ownerAddress.toLowerCase(),
    });
    if (!twoFactorEnabled) {
      await this.twoFaService.create({
        token,
        expiresAt,
        email,
        senderWallet: ownerAddress,
        isVerified: false,
      });
    } else {
      await this.twoFaService.updateOne(
        {
          email: email.toLowerCase(),
          senderWallet: ownerAddress.toLowerCase(),
        },
        { token, expiresAt, isVerified: false },
      );
    }

    const emailPayload = {
      to: email,
      sender: payment.senderName || '',
      amount: payment.amount.toString(),
      tokenSymbol: payment.tokenSymbol,
      date: moment().toDate().toUTCString(),
      wallet: ownerAddress,
      token: token,
      paymentId: payment.paymentId,
    };
    this.emailEv.sendClaimConfirmation(emailPayload);
    return body;
  }

  @Public()
  @Post('verify-otp')
  async verifyOtp(@Body() body: VerifyOtpDto) {
    const { email, paymentCode, otp, ownerAddress } = body;
    const payment = await this.paymentService.findOne({
      paymentId: paymentCode.toLowerCase(),
      isClaimed: false,
      isOnChain: true,
      recipient_email: email.toLowerCase(),
    });
    if (!payment) {
      throw new NotFoundException('No payment found');
    }

    const isOtp = await this.twoFaService.findOne({
      email: email.toLowerCase(),
      token: otp,
      senderWallet: ownerAddress.toLowerCase(),
      isVerified: false,
    });
    if (!isOtp) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const currentDate = new Date();
    if (isOtp.expiresAt < currentDate) {
      throw new UnauthorizedException('Invalid token');
    }

    isOtp.isVerified = true;
    isOtp.save();

    return { email, paymentCode, ownerAddress };
  }

  @Public()
  @Get('claim/:id')
  async findOne(@Param('id') id: string) {
    const paymentId = toUtf8String(decodeBase64(`${id}`));
    const payment = await this.paymentService.findOne({
      paymentId: paymentId,
      //isClaimed: false,
      isOnChain: true,
    });
    if (!payment) {
      throw new NotFoundException('No payment found');
    }
    return payment;
  }

  @Public()
  @Post('initialize-claim')
  async payWithEmail(@Req() req: Request, @Body() body: VerifyOtpDto) {
    const { email, paymentCode, ownerAddress, otp } = body;
    const payment = await this.paymentService.findOne({
      paymentId: paymentCode.toLowerCase(),
      isClaimed: false,
      isOnChain: true,
      recipient_email: email.toLowerCase(),
    });
    if (!payment) {
      throw new NotFoundException('No payment found');
    }

    const isOtp = await this.twoFaService.findOne({
      email: email.toLowerCase(),
      token: otp,
      senderWallet: ownerAddress.toLowerCase(),
      isVerified: true,
    });
    if (!isOtp) {
      throw new UnauthorizedException('Unauthorized access');
    }

    const payIdHash = hexlify(toUtf8Bytes(payment.paymentId));
    const emailHash = hexlify(toUtf8Bytes(payment.recipient_email));

    const domain = {
      name: 'DexaPay',
      version: '1',
      chainId: baseSepolia.id,
      verifyingContract: this.configService.get<string>('DEXA_PAY'),
    };

    const data = {
      email: emailHash,
      token: payment.tokenAddress,
      paymentCode: payIdHash,
      user: ownerAddress,
    };

    const types = {
      UserData: [
        { name: 'email', type: 'bytes' },
        { name: 'token', type: 'address' },
        { name: 'paymentCode', type: 'bytes' },
        { name: 'user', type: 'address' },
      ],
    };

    if (!payment.isLinked) {
      await this.dexaPayService.linkUserEmailBalance({
        email: emailHash,
        user: ownerAddress,
        paymentCode: payIdHash,
      });
      await this.paymentService.update(
        {
          paymentId: paymentCode.toLowerCase(),
          isClaimed: false,
          isOnChain: true,
          recipient_email: email.toLowerCase(),
        },
        { isLinked: true },
      );
    }

    const signature = await this.dexaPayService.signVerifyClaimEmailFunds(
      domain,
      types,
      data,
    );
    await this.paymentService.update(
      {
        paymentId: paymentCode.toLowerCase(),
        isClaimed: false,
        isOnChain: true,
        recipient_email: email.toLowerCase(),
      },
      { signature },
    );

    return {
      signature,
      email: emailHash,
      paymentCode: payIdHash,
      tokenAddress: payment.tokenAddress,
    };
  }

  @Get()
  findAll() {
    return this.paymentService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    //return this.paymentService.update(+id, updatePaymentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.paymentService.remove(+id);
  }
}

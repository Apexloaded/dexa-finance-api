import { OnModuleInit, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract, ContractEventPayload, verifyMessage } from 'ethers';
import DexaPayAbi from './abi/dexa-pay.abi';
import { PaymentEventEmitter } from 'src/pages/payment/payment.emitter';

@Injectable()
export class DexaPayService implements OnModuleInit {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private filter: Record<string, ethers.ContractEvent<any[]>>;

  constructor(
    private configService: ConfigService,
    private pmEvent: PaymentEventEmitter,
  ) {}

  async onModuleInit() {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('BASE_TESTNET'),
    );

    this.signer = new ethers.Wallet(
      this.configService.get<string>('ADMIN_PRIVATE'),
      this.provider,
    );

    this.contract = new Contract(
      this.configService.get<string>('DEXA_PAY'),
      DexaPayAbi,
      this.signer,
    );

    this.filter = this.contract.filters;
    this.listener();
  }

  private listener() {
    this.contract.on(
      this.filter.PaymentSent(),
      (event: ContractEventPayload) => {
        const { args } = event;
        this.pmEvent.emitPaymentSent({
          paymentCode: args[0],
          sender: args[1],
          email: args[2],
          amount: args[3],
        });
        event.removeListener();
      },
    );

    this.contract.on(
      this.filter.PaymentClaimed(),
      (event: ContractEventPayload) => {
        const { args } = event;
        this.pmEvent.emitPaymentClaimed({
          paymentCode: args[0],
          email: args[1],
          sender: args[2],
          amount: args[3],
        });
        event.removeListener();
      },
    );
  }

  // async findReqById(id: string) {
  //   return await this.contract.findCreator(wallet);
  // }

  async validateSignature(msg: string, signature: `0x${string}`) {
    verifyMessage(msg, signature);
  }

  async signVerifyClaimEmailFunds(
    domain: ethers.TypedDataDomain,
    types: Record<string, ethers.TypedDataField[]>,
    value: Record<string, any>,
  ) {
    const signature = await this.signer.signTypedData(domain, types, value);
    return signature;
  }

  async linkUserEmailBalance(value: {
    email: string;
    user: string;
    paymentCode: string;
  }) {
    const tx = await this.contract.linkUserEmailBalance(
      value.email,
      value.user,
      value.paymentCode,
    );
    await tx.wait(3);
  }
}

import { OnModuleInit, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ethers,
  Contract,
  ContractEventPayload,
  verifyMessage,
  WebSocketProvider,
} from 'ethers';
import DexaPayAbi from './abi/dexa-pay.abi';
import { PaymentEventEmitter } from 'src/pages/payment/payment.emitter';

@Injectable()
export class DexaPayListener implements OnModuleInit {
  private contract: ethers.Contract;
  private filter: Record<string, ethers.ContractEvent<any[]>>;
  private ws: WebSocketProvider;

  constructor(
    private configService: ConfigService,
    private pmEvent: PaymentEventEmitter,
  ) {}

  async onModuleInit() {
    this.ws = new ethers.WebSocketProvider(
      this.configService.get<string>('BASE_WSS'),
    );

    this.contract = new Contract(
      this.configService.get<string>('DEXA_PAY'),
      DexaPayAbi,
      this.ws,
    );

    this.filter = this.contract.filters;
    this.listener();
  }

  private listener() {
    this.listenToPaymentClaim();
    this.listenToPaymentSent();
  }

  listenToPaymentSent() {
    try {
      this.contract.on(
        this.filter.PaymentSent(),
        (event: ContractEventPayload) => {
          console.log(event);
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
    } catch (error) {
      console.log(error);
    }
  }

  listenToPaymentClaim() {
    try {
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
    } catch (error) {
      console.log(error);
    }
  }

  // async createFilter(eventName: string): Promise<string> {
  //   const existingFilterId = this.filter.get(eventName);
  //   if (existingFilterId) {
  //     return existingFilterId; // Reuse existing filter if available
  //   }

  //   try {
  //     const newFilter = await this.contract.filters[eventName](); // Get filter object
  //     const filterId = await newFilter.then((filter) => filter.filters[0]); // Extract filter ID
  //     this.filter.set(eventName, filterId);
  //     return filterId;
  //   } catch (error) {
  //     console.error('Error creating filter:', error);
  //     throw new Error('Failed to create filter for event');
  //   }
  // }

  // async removeFilter(eventName: string): Promise<void> {
  //   const filterId = this.filters.get(eventName);
  //   if (!filterId) {
  //     return; // No filter to remove
  //   }
  //   this.filters.delete(eventName);
  //   // Consider implementing logic to remove the filter on the Ethereum node (optional)
  // }
}

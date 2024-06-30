import { OnModuleInit, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract } from 'ethers';
import DexaBillsAbi from './abi/dexa-bills.abi';

@Injectable()
export class DexaBillsService implements OnModuleInit {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private filter: Record<string, ethers.ContractEvent<any[]>>;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('BASE_TESTNET'),
    );

    this.contract = new Contract(
      this.configService.get<string>('DEXA_BILL'),
      DexaBillsAbi,
      this.provider,
    );

    this.filter = this.contract.filters;
    this.listener();
  }

  private listener() {}
}

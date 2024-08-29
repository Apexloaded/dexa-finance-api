import { OnModuleInit, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers, Contract, verifyMessage, parseUnits } from 'ethers';
import DexaPayAbi from './abi/dexa-pay.abi';
import ERC20 from './abi/ERC20.abi';
import { createPublicClient, http } from 'viem';
import { bscTestnet } from 'viem/chains';

@Injectable()
export class DexaPayService implements OnModuleInit {
  private contract: ethers.Contract;
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    this.provider = new ethers.JsonRpcProvider(
      this.configService.get<string>('BSC_TESTNET'),
    );

    this.signer = new ethers.Wallet(
      this.configService.get<string>('ADMIN_PRIVATE'),
      this.provider,
    );

    this.contract = new Contract(
      this.configService.get<string>('DEXA_GATEWAY'),
      DexaPayAbi,
      this.signer,
    );
  }

  async validateSignature(
    msg: string,
    signature: `0x${string}`,
    wallet: `0x${string}`,
  ) {
    const chain: any = bscTestnet;
    const client = createPublicClient({
      chain: chain,
      transport: http(this.configService.get<string>('BSC_TESTNET')),
    });
    const isValid = await client.verifySiweMessage({
      address: wallet,
      message: msg,
      signature,
    });
    return isValid;
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

  async requestFaucet(wallet: string) {
    const tokenContract = new Contract(
      this.configService.get<string>('BNB_TESTNET'),
      ERC20,
      this.signer,
    );

    const amount = parseUnits('10', 'ether');
    const tx = await tokenContract.transfer(wallet, amount);
    return {
      txHash: tx.hash,
    };
  }
}

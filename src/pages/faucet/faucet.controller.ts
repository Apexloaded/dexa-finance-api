import { Controller, Get, Param } from '@nestjs/common';
import { FaucetService } from './faucet.service';
import { CreateFaucetDto } from './dto/create-faucet.dto';
import { UpdateFaucetDto } from './dto/update-faucet.dto';
import { DexaPayService } from '../contracts/dexa-pay/dexa-pay.service';
import { Public } from 'src/decorators/public.decorator';

@Controller('faucet')
export class FaucetController {
  constructor(
    private readonly faucetService: FaucetService,
    private readonly dexaPayService: DexaPayService,
  ) {}

  @Public()
  @Get(':id')
  async requestFaucet(@Param('id') id: string) {
    return await this.dexaPayService.requestFaucet(id);
  }
}

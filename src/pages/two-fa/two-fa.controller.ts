import { Controller } from '@nestjs/common';
import { TwoFaService } from './two-fa.service';

@Controller('two-fa')
export class TwoFaController {
  constructor(private readonly twoFaService: TwoFaService) {}
}

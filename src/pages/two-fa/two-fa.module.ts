import { Module } from '@nestjs/common';
import { TwoFaService } from './two-fa.service';
import { TwoFaController } from './two-fa.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TwoFactor, TwoFactorSchema } from './schemas/two-fa.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: TwoFactor.name, schema: TwoFactorSchema },
    ]),
  ],
  controllers: [TwoFaController],
  providers: [TwoFaService],
  exports: [TwoFaService],
})
export class TwoFaModule {}

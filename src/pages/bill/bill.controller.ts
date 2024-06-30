import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { BillService } from './bill.service';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { hexlify, toUtf8Bytes } from 'ethers';
import { Request } from 'express';
import { walletToLowercase } from 'src/helpers';

@Controller('bill')
export class BillController {
  constructor(private readonly billService: BillService) {}

  @Post('create')
  async create(@Req() req: Request, @Body() createBillDto: CreateBillDto) {
    try {
      const authUser = req['user'];
      const creator = walletToLowercase(authUser.wallet);
      const newBill = await this.billService.create({
        ...createBillDto,
        creator,
      });
      return { ...newBill.toJSON(), id: newBill._id.toString() };
    } catch (error) {}
  }

  @Get()
  findAll() {
    return this.billService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBillDto: UpdateBillDto) {
    return this.billService.update(+id, updateBillDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billService.remove(+id);
  }
}

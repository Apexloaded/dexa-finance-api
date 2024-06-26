import { Injectable } from '@nestjs/common';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { UpdatePaymentDto } from './dto/update-payment.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Payment } from './schemas/payment.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class PaymentService {
  constructor(@InjectModel(Payment.name) private pmModel: Model<Payment>) {}
  async create(createPaymentDto: CreatePaymentDto) {
    return this.pmModel.create(createPaymentDto);
  }

  findAll() {
    return `This action returns all payment`;
  }

  findOne(filter: FilterQuery<Payment>) {
    return this.pmModel.findOne(filter);
  }

  update(filter: FilterQuery<Payment>, updatePaymentDto: Partial<Payment>) {
    return this.pmModel.updateOne(filter, updatePaymentDto);
  }

  remove(id: number) {
    return `This action removes a #${id} payment`;
  }
}

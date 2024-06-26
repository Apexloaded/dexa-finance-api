import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TwoFactor } from './schemas/two-fa.schema';
import { FilterQuery, Model } from 'mongoose';

@Injectable()
export class TwoFaService {
  constructor(
    @InjectModel(TwoFactor.name) private _2faModal: Model<TwoFactor>,
  ) {}

  async create(twoFactor: TwoFactor) {
    return await this._2faModal.create(twoFactor);
  }

  async findOne(filter: FilterQuery<TwoFactor>) {
    return await this._2faModal.findOne(filter);
  }

  async updateOne(
    filter: FilterQuery<TwoFactor>,
    twoFactor: Partial<TwoFactor>,
  ) {
    return await this._2faModal.updateOne(filter, twoFactor);
  }
}

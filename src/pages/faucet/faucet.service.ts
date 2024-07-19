import { Injectable } from '@nestjs/common';
import { CreateFaucetDto } from './dto/create-faucet.dto';
import { UpdateFaucetDto } from './dto/update-faucet.dto';

@Injectable()
export class FaucetService {
  create(createFaucetDto: CreateFaucetDto) {
    return 'This action adds a new faucet';
  }

  findAll() {
    return `This action returns all faucet`;
  }

  findOne(id: number) {
    return `This action returns a #${id} faucet`;
  }

  update(id: number, updateFaucetDto: UpdateFaucetDto) {
    return `This action updates a #${id} faucet`;
  }

  remove(id: number) {
    return `This action removes a #${id} faucet`;
  }
}

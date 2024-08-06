import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserDto } from './user.dto';
import { User, UserDocument } from './user.schema';

@Injectable()
export class UserService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async createUser(createUserDto: UserDto): Promise<UserDocument> {
    return new this.userModel(createUserDto).save();
  }

  async findOne(params: Partial<User>): Promise<UserDocument> {
    return this.userModel.findOne().where(params);
  }

  async findAll(
    params: Partial<User>,
    skip?: number,
    limit?: number,
  ): Promise<User> {
    return this.userModel.findOne().where(params).skip(skip).limit(limit);
  }
}

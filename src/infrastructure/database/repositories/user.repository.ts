import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUserRepository } from 'src/core/repositories/user.repository';
import { User } from 'src/core/entities/user.entitiy';

@Injectable()
export class MongoUserRepository implements IUserRepository {
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = new this.userModel(userData);
    return user.save();
  }
  async findByEmail(email: string): Promise<User | null> {
    const user = await this.userModel.findOne({ email }).exec(); 
    return user;
  }
  

  async update(userId: string, updates: Partial<User>): Promise<User> {
    console.log('Updating user with:', updates );
   return await this.userModel.findByIdAndUpdate(userId, updates,{new:true}).exec();
  }
}

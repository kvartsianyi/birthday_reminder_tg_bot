import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { DeleteResult } from 'mongodb';
import { Model, Types } from 'mongoose';

import {
  IRecordForNotification,
  IRecordsWithTotal,
  RecordDto,
} from './record.dto';
import { Record } from './record.schema';
import { formateDate } from './record.util';

@Injectable()
export class RecordService {
  constructor(
    @InjectModel(Record.name)
    private recordModel: Model<Record>,
  ) {}

  async createRecord(recordDto: RecordDto): Promise<Record> {
    return new this.recordModel(recordDto).save();
  }

  async findOne(params: Partial<Record>): Promise<Record> {
    return this.recordModel.findOne().where(params);
  }

  async findAll(
    params: Partial<Record>,
    limit?: number,
    skip?: number,
  ): Promise<IRecordsWithTotal> {
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;

    const records = await this.recordModel.aggregate([
      {
        $match: params,
      },
      {
        $addFields: {
          dayOfBirth: { $dayOfMonth: '$dateOfBirth' },
          monthOfBirth: { $month: '$dateOfBirth' },
        },
      },
      {
        $addFields: {
          nextBirthday: {
            $dateFromParts: {
              year: {
                $cond: [
                  { $gte: [currentMonth, '$monthOfBirth'] },
                  { $add: [now.getFullYear(), 1] },
                  now.getFullYear(),
                ],
              },
              month: '$monthOfBirth',
              day: '$dayOfBirth',
            },
          },
        },
      },
      {
        $addFields: {
          daysToBirth: {
            $ceil: {
              $divide: [
                { $subtract: ['$nextBirthday', now] },
                1000 * 60 * 60 * 24,
              ],
            },
          },
        },
      },
      {
        $project: {
          dayOfBirth: 0,
          monthOfBirth: 0,
          nextBirthday: 0,
        },
      },
      {
        $sort: {
          daysToBirth: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const total = await this.recordModel.countDocuments(params);

    return {
      records,
      total,
    };
  }

  async findAllRecordsRequireNotification(): Promise<IRecordForNotification[]> {
    const now = new Date();
    const day = now.getUTCDate();
    const month = now.getUTCMonth() + 1;

    return this.recordModel.aggregate<IRecordForNotification>([
      {
        $addFields: {
          day: { $dayOfMonth: '$dateOfBirth' },
          month: { $month: '$dateOfBirth' },
          age: {
            $floor: {
              $divide: [
                { $subtract: [new Date(), '$dateOfBirth'] },
                1000 * 60 * 60 * 24 * 365.25,
              ],
            },
          },
        },
      },
      {
        $match: {
          day,
          month,
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          day: 0,
          month: 0,
        },
      },
    ]);
  }

  async remove(userId: Types.ObjectId, title: string): Promise<DeleteResult> {
    return this.recordModel.deleteOne({
      userId,
      title: { $regex: title, $options: 'i' },
    });
  }

  formatList(records: Record[]): string {
    return records.length
      ? `${records.map((item) => this.formatListItem(item)).join('\n\n')}`
      : 'There are no records yet 👀';
  }

  private formatListItem({ title, dateOfBirth, daysToBirth }: Record): string {
    return `${title} - ${formateDate(dateOfBirth)} | 📅 ${daysToBirth} day${daysToBirth > 1 ? "'s" : ''} left`;
  }
}

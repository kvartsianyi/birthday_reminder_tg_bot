import { Types } from 'mongoose';

import { Record } from './record.schema';
import { User } from 'src/user/user.schema';

export interface RecordDto {
  title: string;
  dateOfBirth: Date;
  userId: Types.ObjectId;
}

export interface IRecordsWithTotal {
  records: Record[];
  total: number;
}

export interface IRecordForNotification extends Record {
  age: number;
  user: User;
}

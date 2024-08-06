import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { User } from '../user/user.schema';

export type RecordDocument = HydratedDocument<Record>;

@Schema({ timestamps: true })
export class Record {
  @Prop({ type: String, required: true })
  title: string;

  @Prop({ type: Date, required: true })
  dateOfBirth: Date;

  @Prop({ type: Types.ObjectId, ref: User.name })
  userId: Types.ObjectId;

  daysToBirth?: number;
}

export const RecordSchema = SchemaFactory.createForClass(Record);

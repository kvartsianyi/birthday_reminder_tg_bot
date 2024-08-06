import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: Number, required: true })
  tgChatId: number;

  @Prop({ type: String, required: true })
  tgNickname: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

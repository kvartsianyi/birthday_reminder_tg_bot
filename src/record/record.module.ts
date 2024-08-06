import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { Record, RecordSchema } from './record.schema';
import { RecordService } from './record.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Record.name, schema: RecordSchema }]),
  ],
  providers: [RecordService],
  exports: [RecordService],
})
export class RecordModule {}

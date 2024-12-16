import { Module } from '@nestjs/common';
import { DatabaseProvider } from '../database/providers/mongo.provider';

@Module({
    imports:[DatabaseProvider],
    exports:[DatabaseProvider]
})
export class DatabaseModule {}
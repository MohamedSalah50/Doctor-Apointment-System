import { Module, Global } from '@nestjs/common';
import { CloudinaryService } from './utils';

@Global()
@Module({
  providers: [CloudinaryService],
  exports: [CloudinaryService],
})
export class CommonModule {}

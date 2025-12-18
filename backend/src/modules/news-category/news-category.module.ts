import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsCategoryService } from './news-category.service';
import { NewsCategoryController } from './news-category.controller';
import { NewsCategoryEntity } from './entities/news-category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsCategoryEntity])],
  controllers: [NewsCategoryController],
  providers: [NewsCategoryService],
  exports: [NewsCategoryService],
})
export class NewsCategoryModule {}

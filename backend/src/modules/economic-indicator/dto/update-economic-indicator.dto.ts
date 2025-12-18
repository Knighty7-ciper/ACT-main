import { PartialType } from '@nestjs/swagger';
import { CreateEconomicIndicatorDto } from './create-economic-indicator.dto';

export class UpdateEconomicIndicatorDto extends PartialType(CreateEconomicIndicatorDto) {}

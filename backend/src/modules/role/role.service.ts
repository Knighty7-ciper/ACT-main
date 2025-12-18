import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RoleEntity } from './entities/role.entity';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(RoleEntity)
    private roleRepository: Repository<RoleEntity>,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<RoleResponseDto> {
    const existing = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });
    if (existing) {
      throw new ConflictException('Role name already exists');
    }

    const role = this.roleRepository.create({
      id: uuidv4(),
      ...createRoleDto,
    });
    const saved = await this.roleRepository.save(role);
    return this.toResponseDto(saved);
  }

  async findAll(): Promise<{ data: RoleResponseDto[]; total: number }> {
    const [data, total] = await this.roleRepository.findAndCount({
      where: { isActive: true },
    });
    return { data: data.map((r) => this.toResponseDto(r)), total };
  }

  async findOne(id: string): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    return this.toResponseDto(role);
  }

  async update(id: string, updateRoleDto: UpdateRoleDto): Promise<RoleResponseDto> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }

    Object.assign(role, updateRoleDto);
    const updated = await this.roleRepository.save(role);
    return this.toResponseDto(updated);
  }

  async remove(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({ where: { id } });
    if (!role) {
      throw new NotFoundException('Role not found');
    }
    await this.roleRepository.remove(role);
  }

  private toResponseDto(role: RoleEntity): RoleResponseDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      permissions: role.permissions,
      isActive: role.isActive,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }
}

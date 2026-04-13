import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { GenderType, RoleType } from '../../interfaces';
import { Image } from '../../store/entities/image.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    unique: true,
  })
  login: string;

  @Column({
    type: 'enum',
    enum: RoleType,
    default: RoleType.USER,
  })
  role: RoleType;

  @Column({
    type: 'enum',
    enum: GenderType,
    nullable: true,
  })
  gender: GenderType;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  middleName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  avatar: string;

  // Виртуальное поле для фронтенда (не сохраняется в БД)
  avatarUrl?: string;

  @Column()
  @Exclude() // exclude password from response User item
  password: string;

  @Column({ nullable: true })
  @Exclude() // exclude refreshToken from response User item
  refreshToken: string;

  @Column({ default: false })
  isBlocked: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Image, (image) => image.user)
  images: Image[];

  // Remove excluded columns from response User item
  constructor(partial: Partial<User>) {
    Object.assign(this, partial);
  }
}

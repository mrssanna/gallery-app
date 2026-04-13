import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Image {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  author: string;

  @Column()
  bucket: string;

  @Column()
  path: string;

  @Column({ nullable: true })
  thumbnailPath: string;

  @Column()
  format: string;

  @Column({ type: 'int', nullable: true })
  size: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  publishedAt: Date;

  @ManyToOne(() => User, (user) => user.images)
  user: User;
}

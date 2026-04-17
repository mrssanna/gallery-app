import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
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

  @Index() // Индекс для сортировки картинок по дате создания (используется в галерее)
  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Index() // Индекс для быстрого поиска опубликованных картинок (используется в ленте)
  @Column({ type: 'timestamp', nullable: true })
  publishedAt: Date | null;

  @ManyToOne(() => User, (user) => user.images)
  user: User;
}

import {
  Injectable,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  FindManyOptions,
  FindOptionsOrder,
  IsNull,
  Not,
  ILike,
} from 'typeorm';
import { FileService } from '../file/file.service';
import { User } from '../users/entities/user.entity';
import { Image } from './entities/image.entity';
import { GetImagesWithIdDto } from './dto/get-images.dto';
import { GetImagesResponseDto } from './dto/get-images-response.dto';
import { UploadFileResponseDto } from './dto/upload-file-response.dto';
import { UploadFileFullDto } from './dto/upload-file.dto';
import { RemoveFileResponseDto } from './dto/remove-file-response.dto';
import { UpdateFileInfoFullDto } from './dto/update-file-info.dto';
import { CustomErrors } from '../common-files/constants/custom-errors';
import { parseFormat } from '../common-files/helpers';
import { UpdateFileInfoResponseDto } from './dto/update-file-info-response.dto';
import { StoreGateway } from './store.gateway';
import { SuccessResponseDto } from '../common-files/dto/success-response-field.dto';
import { GetFeedDto } from './dto/get-feed.dto';
import {
  BUCKET_NAME,
  BUCKET_THUMBNAILS,
  BUCKET_AVATARS,
} from '../common-files/constants/constants';

@Injectable()
export class StoreService {
  private readonly logger = new Logger(StoreService.name);

  constructor(
    private fileService: FileService,
    private storeGateway: StoreGateway,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadFile(dto: UploadFileFullDto): Promise<UploadFileResponseDto> {
    const { id, file, title = '', author = '' } = dto;
    this.logger.log(`Attempting to upload file for user ID: ${id}`);

    const currentUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!currentUser) {
      this.logger.warn(`Upload failed: User not found (ID: ${id})`);
      throw new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    this.storeGateway.emitToUser(id, 'upload_status', {
      filename: file.originalname,
      status: 'processing',
      message: 'File is being uploaded and processed...',
    });

    const { path, thumbnailPath, bucket } = await this.fileService.uploadFile(
      file,
      BUCKET_NAME,
      BUCKET_THUMBNAILS,
    );

    const format = parseFormat(file.mimetype)?.toString() || '';

    const newImage = new Image();
    newImage.bucket = bucket;
    newImage.path = path;
    newImage.thumbnailPath = thumbnailPath;
    newImage.title = title;
    newImage.author = author;
    newImage.format = format;
    newImage.size = file.size;

    if (currentUser) {
      newImage.user = currentUser;
    }

    await this.imageRepository.save(newImage);
    this.logger.log(
      `File metadata saved to DB successfully. Image ID: ${newImage.id}`,
    );

    this.storeGateway.emitToUser(id, 'upload_status', {
      imageId: newImage.id,
      filename: file.originalname,
      status: 'done',
      message: 'File successfully uploaded!',
    });

    return {
      success: true,
    };
  }

  async updateFileInfo(
    _dto: UpdateFileInfoFullDto,
  ): Promise<UpdateFileInfoResponseDto> {
    const updateFileInfoFullDto = new UpdateFileInfoFullDto(_dto);
    const { userId, id, title = '', author = '' } = updateFileInfoFullDto;

    this.logger.log(
      `Attempting to update file info. Image ID: ${id}, User ID: ${userId}`,
    );

    const currentFile = await this.imageRepository.findOne({
      where: { id, user: { id: userId } },
      relations: {
        user: true,
      },
    });

    if (!currentFile) {
      this.logger.warn(
        `Update failed: File not found or access denied (Image ID: ${id})`,
      );
      throw new BadRequestException(CustomErrors.FILE_NOT_FOUND);
    } else {
      currentFile.author = author;
      currentFile.title = title;
    }

    await this.imageRepository.save(currentFile);
    this.logger.log(`File info updated successfully. Image ID: ${id}`);

    return {
      success: true,
    };
  }

  async publishImage(
    userId: string,
    imageId: string,
  ): Promise<SuccessResponseDto> {
    this.logger.log(
      `Attempting to toggle publish status. Image ID: ${imageId}, User ID: ${userId}`,
    );

    const currentFile = await this.imageRepository.findOne({
      where: { id: imageId, user: { id: userId } },
      relations: {
        user: true,
      },
    });

    if (!currentFile) {
      this.logger.warn(
        `Publish failed: File not found or access denied (Image ID: ${imageId})`,
      );
      throw new BadRequestException(CustomErrors.FILE_NOT_FOUND);
    }

    if (currentFile.user.isBlocked) {
      this.logger.warn(`Publish failed: User is blocked (User ID: ${userId})`);
      throw new ForbiddenException(
        'Ваш аккаунт заблокирован. Вы не можете публиковать картинки.',
      );
    }

    currentFile.publishedAt = currentFile.publishedAt ? null : new Date();

    await this.imageRepository.save(currentFile);
    this.logger.log(
      `File publish status updated successfully. Image ID: ${imageId}. Published: ${!!currentFile.publishedAt}`,
    );

    return {
      success: true,
    };
  }

  async findAll(dto: GetImagesWithIdDto): Promise<GetImagesResponseDto> {
    const { id, pageNo, perPage, sortField, sortOrder, search } = dto;
    const skip = (pageNo - 1) * perPage;

    this.logger.debug(
      `Fetching images for user ID: ${id}. Page: ${pageNo}, PerPage: ${perPage}, Search: ${search}`,
    );

    const orderOptions: FindOptionsOrder<Image> = {};
    if (sortField && sortOrder) {
      orderOptions[sortField] = sortOrder;
    }

    // Формируем условия поиска (WHERE)
    const whereConditions: any[] = [];

    if (search) {
      // Если есть поиск, ищем по title ИЛИ author для данного пользователя
      whereConditions.push({ user: { id }, title: ILike(`%${search}%`) });
      whereConditions.push({ user: { id }, author: ILike(`%${search}%`) });
    } else {
      // Если поиска нет, просто фильтруем по пользователю
      whereConditions.push({ user: { id } });
    }

    const requestOptions: FindManyOptions<Image> = {
      where: whereConditions,
      ...(perPage && pageNo ? { skip, take: perPage } : {}),
      relations: {
        user: true,
      },
      ...(sortField && sortOrder ? { order: orderOptions } : {}),
    };

    const [results, count] =
      await this.imageRepository.findAndCount(requestOptions);

    this.logger.log(`Found ${count} images for user ID: ${id}`);

    return {
      node: await Promise.all(
        results.map(
          async ({
            id,
            title,
            author,
            bucket,
            path,
            thumbnailPath,
            format,
            size,
            createdAt,
            updatedAt,
            publishedAt,
            user,
          }) => ({
            id,
            title,
            author,
            url: await this.fileService.getFilePath(path, bucket),
            thumbnailUrl: thumbnailPath
              ? await this.fileService.getFilePath(
                  thumbnailPath,
                  BUCKET_THUMBNAILS,
                )
              : await this.fileService.getFilePath(path, bucket),
            userAvatarUrl: user?.avatar
              ? await this.fileService.getFilePath(user.avatar, BUCKET_AVATARS)
              : undefined,
            format,
            size,
            createdAt,
            updatedAt,
            publishedAt,
          }),
        ),
      ),
      pageInfo: {
        pageNo,
        perPage,
        totalCount: count,
        totalPageCount: perPage ? Math.ceil(count / perPage) : 1,
      },
    };
  }

  async getFeed(dto: GetFeedDto): Promise<GetImagesResponseDto> {
    const { pageNo, perPage, sortField, sortOrder, search } = dto;
    const skip = (pageNo - 1) * perPage;

    this.logger.debug(
      `Fetching public feed. Page: ${pageNo}, PerPage: ${perPage}, Search: ${search}`,
    );

    const orderOptions: FindOptionsOrder<Image> = {};
    if (sortField && sortOrder) {
      orderOptions[sortField] = sortOrder;
    }

    // Формируем условия поиска (WHERE)
    const whereConditions: any[] = [];

    if (search) {
      // Ищем по title ИЛИ author среди опубликованных картинок
      whereConditions.push({
        publishedAt: Not(IsNull()),
        title: ILike(`%${search}%`),
      });
      whereConditions.push({
        publishedAt: Not(IsNull()),
        author: ILike(`%${search}%`),
      });
    } else {
      whereConditions.push({ publishedAt: Not(IsNull()) });
    }

    const requestOptions: FindManyOptions<Image> = {
      where: whereConditions,
      ...(perPage && pageNo ? { skip, take: perPage } : {}),
      relations: {
        user: true,
      },
      ...(sortField && sortOrder ? { order: orderOptions } : {}),
    };

    const [results, count] =
      await this.imageRepository.findAndCount(requestOptions);

    this.logger.log(`Found ${count} published images for feed`);

    return {
      node: await Promise.all(
        results.map(
          async ({
            id,
            title,
            author,
            bucket,
            path,
            thumbnailPath,
            format,
            size,
            createdAt,
            updatedAt,
            publishedAt,
            user,
          }) => ({
            id,
            title,
            author,
            url: await this.fileService.getFilePath(path, bucket),
            thumbnailUrl: thumbnailPath
              ? await this.fileService.getFilePath(
                  thumbnailPath,
                  BUCKET_THUMBNAILS,
                )
              : await this.fileService.getFilePath(path, bucket),
            userAvatarUrl: user?.avatar
              ? await this.fileService.getFilePath(user.avatar, BUCKET_AVATARS)
              : undefined,
            format,
            size,
            createdAt,
            updatedAt,
            publishedAt,
          }),
        ),
      ),
      pageInfo: {
        pageNo,
        perPage,
        totalCount: count,
        totalPageCount: perPage ? Math.ceil(count / perPage) : 1,
      },
    };
  }

  async removeFile(
    userId: string,
    fileId: string,
  ): Promise<RemoveFileResponseDto> {
    this.logger.log(
      `Attempting to remove file. Image ID: ${fileId}, User ID: ${userId}`,
    );

    const currentFile = await this.imageRepository.findOne({
      where: { id: fileId, user: { id: userId } },
      relations: {
        user: true,
      },
    });

    if (!currentFile) {
      this.logger.warn(
        `Remove failed: File not found or access denied (Image ID: ${fileId})`,
      );
      throw new BadRequestException(CustomErrors.FILE_NOT_FOUND);
    } else {
      await this.imageRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.remove(currentFile);
          this.logger.debug(
            `File metadata removed from DB. Image ID: ${fileId}`,
          );

          await this.fileService.removeFile(
            currentFile.bucket,
            currentFile.path,
            BUCKET_THUMBNAILS,
            currentFile.thumbnailPath,
          );
        },
      );
      this.logger.log(`File completely removed. Image ID: ${fileId}`);
    }

    return {
      success: true,
    };
  }
}

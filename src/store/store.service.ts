import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions, FindOptionsOrder } from 'typeorm';
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

@Injectable()
export class StoreService {
  constructor(
    private fileService: FileService,
    @InjectRepository(Image)
    private imageRepository: Repository<Image>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async uploadFile(dto: UploadFileFullDto): Promise<UploadFileResponseDto> {
    const { id, file, title = '', author = '' } = dto;

    const currentUser = await this.userRepository.findOne({
      where: { id },
    });

    if (!currentUser) {
      new BadRequestException(CustomErrors.USER_IS_NOT_EXIST);
    }

    const { path, bucket } = await this.fileService.uploadFile(file);

    const format = parseFormat(file.mimetype)?.toString() || ''; // TODO: fix types ?

    const newImage = new Image();

    newImage.bucket = bucket;
    newImage.path = path;
    newImage.title = title;
    newImage.author = author;
    newImage.format = format;

    if (currentUser) {
      // TODO: remove this check?
      newImage.user = currentUser;
    }

    await this.imageRepository.save(newImage);

    return {
      success: true,
    };
  }

  async updateFileInfo(
    _dto: UpdateFileInfoFullDto,
  ): Promise<UpdateFileInfoResponseDto> {
    const updateFileInfoFullDto = new UpdateFileInfoFullDto(_dto);

    const { userId, id, title = '', author = '' } = updateFileInfoFullDto;

    const currentFile = await this.imageRepository.findOne({
      where: { id, user: { id: userId } },
      relations: {
        user: true,
      },
    });

    if (!currentFile) {
      throw new BadRequestException(CustomErrors.FILE_NOT_FOUND);
    } else {
      currentFile.author = author;
      currentFile.title = title;
    }

    await this.imageRepository.save(currentFile);

    return {
      success: true,
    };
  }

  async findAll(dto: GetImagesWithIdDto): Promise<GetImagesResponseDto> {
    const { id, pageNo, perPage, sortField, sortOrder } = dto;
    const skip = (pageNo - 1) * perPage;

    const orderOptions: FindOptionsOrder<Image> = {};
    if (sortField && sortOrder) {
      orderOptions[sortField] = sortOrder;
    }

    const requestOptions: FindManyOptions<Image> = {
      where: {
        user: { id },
      },
      ...(perPage && pageNo ? { skip, take: perPage } : {}),
      relations: {
        user: true,
      },
      ...(sortField && sortOrder ? { order: orderOptions } : {}),
    };

    const [results, count] =
      await this.imageRepository.findAndCount(requestOptions);

    return {
      node: await Promise.all(
        results.map(
          async ({
            id,
            title,
            author,
            bucket,
            path,
            format,
            createdAt,
            updatedAt,
            publishedAt,
          }) => ({
            id,
            title,
            author,
            url: await this.fileService.getFilePath(path, bucket),
            format,
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
    const currentFile = await this.imageRepository.findOne({
      where: { id: fileId, user: { id: userId } },
      relations: {
        user: true,
      },
    });

    if (!currentFile) {
      throw new BadRequestException(CustomErrors.FILE_NOT_FOUND);
    } else {
      await this.imageRepository.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.remove(currentFile);

          await this.fileService.removeFile(
            currentFile.bucket,
            currentFile.path,
          );
        },
      );
    }

    return {
      success: true,
    };
  }
}

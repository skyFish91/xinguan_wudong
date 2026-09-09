import {
  Provide,
  Controller,
  Post,
  Get,
  Del,
  Inject,
  Files,
  Fields,
  Query,
  UseGuard,
} from '@midwayjs/core';
import { FileService } from '../../../common/service/file.service';
import { AuthGuard } from '../../../common/guard/auth.guard';
import { CurrentUser, JwtPayload } from '../../../common/decorator/current-user';

/**
 * 统一上传（设计文档 §10）
 * 路由前缀：/api/v1/file
 *
 * 走 @midwayjs/upload 的 multipart 解析，落盘与鉴黄由 FileService 统一处理。
 */
@Provide()
@Controller('/api/v1/file')
@UseGuard(AuthGuard)
export class FileController {
  @Inject()
  fileService: FileService;

  /** 单文件上传 */
  @Post('/upload')
  async upload(
    @CurrentUser() user: JwtPayload,
    @Files() files: any[],
    @Fields() fields: any
  ) {
    const file = (files || [])[0];
    if (!file) return null;
    const fileType = (fields?.fileType === 'VIDEO' ? 'VIDEO' : 'IMAGE') as
      | 'IMAGE'
      | 'VIDEO';
    return this.fileService.save(
      {
        filename: file.filename,
        data: file.data,
        mimeType: file.mimeType,
      },
      user.userId,
      fileType
    );
  }

  /** 批量上传 */
  @Post('/upload-batch')
  async uploadBatch(
    @CurrentUser() user: JwtPayload,
    @Files() files: any[],
    @Fields() fields: any
  ) {
    const fileType = (fields?.fileType === 'VIDEO' ? 'VIDEO' : 'IMAGE') as
      | 'IMAGE'
      | 'VIDEO';
    return this.fileService.saveMany(
      (files || []).map(f => ({
        filename: f.filename,
        data: f.data,
        mimeType: f.mimeType,
      })),
      user.userId,
      fileType
    );
  }

  /** 文件信息 */
  @Get('/info')
  async info(@Query('fileId') fileId: number) {
    return this.fileService.info(Number(fileId));
  }

  /** 删除自己的文件 */
  @Del('/delete')
  async remove(@CurrentUser() user: JwtPayload, @Query('fileId') fileId: number) {
    await this.fileService.delete(user.userId, Number(fileId));
    return true;
  }
}

import { Provide, Inject, Config } from '@midwayjs/core';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { SysFile } from '../../modules/common/entity/SysFile.entity';
import { RedisService } from './redis.service';
import { SensitiveService } from './sensitive.service';
import { BizException } from '../biz-error';
import { ErrorCode } from '../constants/error-code';

/** 文件类型白名单（设计文档 §10：防伪造扩展名上传 WebShell，不许删） */
export const MIME_WHITE_LIST: Record<string, string[]> = {
  IMAGE: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  VIDEO: ['video/mp4', 'video/quicktime'],
};

/** 单文件上限（字节）：图片 5MB / 视频 100MB */
export const FILE_SIZE_LIMIT = {
  IMAGE: 5 * 1024 * 1024,
  VIDEO: 100 * 1024 * 1024,
};

/** 单用户每日上传配额（防磁盘被打满） */
export const DAILY_UPLOAD_LIMIT = 200;

export interface UploadedFile {
  /** 原始文件名 */
  filename: string;
  /** 文件内容：Buffer 或临时文件路径 */
  data: Buffer | string;
  mimeType?: string;
}

export interface UploadResult {
  fileId: number;
  url: string;
  fileName: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  /** 机审结果：1 通过 / 2 待审核 */
  auditStatus: number;
}

/**
 * 统一上传服务（设计文档 §10）
 *
 * 本期落本地 public/upload，FileService 接口保持不变，
 * 后续切 OSS / COS 只需替换 doStore() 实现。
 */
@Provide()
export class FileService {
  @InjectEntityModel(SysFile)
  fileModel: Repository<SysFile>;

  @Inject()
  redisService: RedisService;

  @Inject()
  sensitiveService: SensitiveService;

  @Config('wudong')
  wudongConfig: { uploadDir?: string; uploadBaseUrl?: string };

  private get uploadDir(): string {
    return (
      this.wudongConfig?.uploadDir ||
      path.join(process.cwd(), 'public', 'upload')
    );
  }

  /**
   * 保存文件
   * @param file 上传文件
   * @param userId 上传者
   * @param fileType IMAGE / VIDEO
   */
  async save(
    file: UploadedFile,
    userId: number,
    fileType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<UploadResult> {
    // --- 配额 ---
    const quotaKey = `upload:daily:${userId}:${this.today()}`;
    const used = await this.redisService.dailyCount(quotaKey);
    if (used > DAILY_UPLOAD_LIMIT) {
      throw new BizException(ErrorCode.UPLOAD_QUOTA_EXCEED);
    }

    // --- 类型校验 ---
    const mime = (file.mimeType || this.guessMime(file.filename) || '').toLowerCase();
    const allow = MIME_WHITE_LIST[fileType] || [];
    if (!allow.includes(mime)) {
      throw new BizException(
        ErrorCode.FILE_TYPE_DENY,
        `只允许上传 ${allow.join(' / ')}`
      );
    }

    // --- 落盘 ---
    const buffer = await this.readBuffer(file.data);
    if (buffer.length > FILE_SIZE_LIMIT[fileType]) {
      throw new BizException(
        ErrorCode.FILE_TOO_LARGE,
        `${fileType === 'IMAGE' ? '图片' : '视频'}不能超过 ${
          FILE_SIZE_LIMIT[fileType] / 1024 / 1024
        }MB`
      );
    }

    const ext = path.extname(file.filename || '').toLowerCase() || this.extOfMime(mime);
    const subDir = this.monthDir();
    const dir = path.join(this.uploadDir, subDir);
    fs.mkdirSync(dir, { recursive: true });
    const newName = `${Date.now()}${crypto.randomBytes(4).toString('hex')}${ext}`;
    fs.writeFileSync(path.join(dir, newName), buffer);

    const url = `/upload/${subDir}/${newName}`;

    // --- 入库 ---
    const record = this.fileModel.create({
      userId,
      fileName: file.filename || newName,
      filePath: path.join(dir, newName),
      url,
      mimeType: mime,
      fileSize: buffer.length,
      fileType,
      width: null,
      height: null,
      duration: null,
      auditStatus: 1, // 本期无内容安全机审，默认通过
      deletedAt: null,
    });
    const saved = await this.fileModel.save(record);

    return {
      fileId: Number(saved.id),
      url,
      fileName: saved.fileName,
      fileSize: saved.fileSize,
      auditStatus: saved.auditStatus,
    };
  }

  /** 批量保存 */
  async saveMany(
    files: UploadedFile[],
    userId: number,
    fileType: 'IMAGE' | 'VIDEO' = 'IMAGE'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = [];
    for (const f of files || []) {
      results.push(await this.save(f, userId, fileType));
    }
    return results;
  }

  async info(fileId: number): Promise<SysFile> {
    const file = await this.fileModel.findOne({ where: { id: fileId } });
    if (!file) throw new BizException(ErrorCode.DATA_NOT_EXIST, '文件不存在');
    return file;
  }

  async delete(userId: number, fileId: number): Promise<void> {
    const file = await this.fileModel.findOne({ where: { id: fileId, userId } });
    if (!file) return;
    file.deletedAt = new Date();
    await this.fileModel.save(file);
  }

  // ===== 内部 =====

  private async readBuffer(data: Buffer | string): Promise<Buffer> {
    if (Buffer.isBuffer(data)) return data;
    if (typeof data === 'string' && fs.existsSync(data)) {
      return fs.readFileSync(data);
    }
    throw new BizException(ErrorCode.UPLOAD_FAIL, '读取上传内容失败');
  }

  private guessMime(filename: string): string {
    const ext = (path.extname(filename || '') || '').toLowerCase();
    const map: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.mp4': 'video/mp4',
      '.mov': 'video/quicktime',
    };
    return map[ext] || '';
  }

  private extOfMime(mime: string): string {
    const map: Record<string, string> = {
      'image/jpeg': '.jpg',
      'image/png': '.png',
      'image/webp': '.webp',
      'image/gif': '.gif',
      'video/mp4': '.mp4',
      'video/quicktime': '.mov',
    };
    return map[mime] || '';
  }

  private monthDir(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  private today(): string {
    const d = new Date();
    return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}${String(
      d.getDate()
    ).padStart(2, '0')}`;
  }
}

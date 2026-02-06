// src/common/decorators/upload-file.decorator.ts

import { applyDecorators, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { fileValidators, multerConfig } from '../utils';

export function UploadFile(
  fieldName: string = 'file',
  fileType: 'image' | 'document' | 'all' = 'image',
) {
  return applyDecorators(
    UseInterceptors(
      FileInterceptor(fieldName, multerConfig(fileValidators[fileType])),
    ),
  );
}

export function UploadFiles(
  fieldName: string = 'files',
  maxCount: number = 10,
  fileType: 'image' | 'document' | 'all' = 'image',
) {
  return applyDecorators(
    UseInterceptors(
      FilesInterceptor(
        fieldName,
        maxCount,
        multerConfig(fileValidators[fileType]),
      ),
    ),
  );
}

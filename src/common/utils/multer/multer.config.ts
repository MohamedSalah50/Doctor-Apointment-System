// src/common/utils/multer/multer.config.ts

import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import { Request } from 'express';

export const fileValidators = {
  image: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'],
  document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  all: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'application/pdf'],
};

export const multerConfig = (allowedMimeTypes: string[] = fileValidators.image) => {
  return {
    storage: diskStorage({
      destination: './uploads/temp', // Temporary storage
      filename: (req: Request, file: Express.Multer.File, callback) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        callback(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req: Request, file: Express.Multer.File, callback) => {
      if (allowedMimeTypes.includes(file.mimetype)) {
        callback(null, true);
      } else {
        callback(
          new BadRequestException(
            `Invalid file type. Allowed types: ${allowedMimeTypes.join(', ')}`
          ),
          false
        );
      }
    },
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit
    },
  };
};
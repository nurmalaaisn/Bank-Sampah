import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export const imageUploadOptions: MulterOptions = {
    limits: {
        fileSize: 10 * 1024 * 1024, // maksimal 10 MB
    },

    fileFilter: (req, file, callback) => {
        const allowedMimeTypes = [
            'image/jpeg',
            'image/png',
            'image/webp',
        ];

        if (!allowedMimeTypes.includes(file.mimetype)) {
            return callback(
                new BadRequestException(
                    'Format foto harus JPG, JPEG, PNG, atau WEBP.',
                ),
                false,
            );
        }

        callback(null, true);
    },
};
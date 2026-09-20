import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
    constructor() {
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
    }

    async uploadImage(
        file: Express.Multer.File,
        folder: string,
    ): Promise<UploadApiResponse> {
        return new Promise((resolve, reject) => {
            const uploadStream =
                cloudinary.uploader.upload_stream(
                    {
                        folder,
                        resource_type: 'image',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!result) {
                            reject(
                                new Error(
                                    'Upload gambar ke Cloudinary gagal.',
                                ),
                            );
                            return;
                        }

                        resolve(result);
                    },
                );

            uploadStream.end(file.buffer);
        });
    }
}
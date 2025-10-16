import { Controller, Inject } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { v2 as Cloudinary, SignApiOptions } from 'cloudinary';
import {
  GenerateSignatureDto,
  CloudinarySignatureResponse,
} from '@app/contracts';
import { CLOUDINARY } from './cloudinary.provider';

@Controller('assets')
export class AssetsController {
  constructor(
    @Inject(CLOUDINARY) private readonly cloudinary: typeof Cloudinary,
  ) {}

  @MessagePattern('assets.generate_upload_signature')
  generateUploadSignature(
    data: GenerateSignatureDto,
  ): CloudinarySignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Build upload parameters
    const uploadParams: SignApiOptions = {
      timestamp,
    };

    if (data.folder) {
      uploadParams.folder = data.folder;
    }

    if (data.publicId) {
      uploadParams.public_id = data.publicId;
    }

    if (data.transformation) {
      uploadParams.transformation = data.transformation;
    }

    if (data.resourceType) {
      uploadParams.resource_type = data.resourceType;
    }

    if (data.format) {
      uploadParams.format = data.format;
    }

    if (data.tags && data.tags.length > 0) {
      uploadParams.tags = data.tags.join(',');
    }

    // Generate signature
    const signature = this.cloudinary.utils.api_sign_request(
      uploadParams,
      this.cloudinary.config().api_secret as string,
    );

    return {
      signature,
      timestamp,
      apiKey: this.cloudinary.config().api_key as string,
      cloudName: this.cloudinary.config().cloud_name as string,
      ...uploadParams,
    };
  }
}

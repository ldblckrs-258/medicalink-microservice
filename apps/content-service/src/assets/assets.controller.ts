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
  generateUploadSignature(): CloudinarySignatureResponse {
    const timestamp = Math.round(new Date().getTime() / 1000);

    // Use only essential parameters for signature generation
    const uploadParams: SignApiOptions = {
      timestamp,
    };

    // Generate signature with minimal parameters
    const signature = this.cloudinary.utils.api_sign_request(
      uploadParams,
      this.cloudinary.config().api_secret as string,
    );

    return {
      signature,
      timestamp,
      apiKey: this.cloudinary.config().api_key as string,
      cloudName: this.cloudinary.config().cloud_name as string,
    };
  }
}

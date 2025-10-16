import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import {
  GenerateSignatureDto,
  CloudinarySignatureResponse,
} from '@app/contracts';

@Controller('utilities')
export class UtilitiesController {
  constructor(
    @Inject('CONTENT_SERVICE') private readonly contentClient: ClientProxy,
  ) {}

  @Post('upload-signature')
  async generateUploadSignature(
    @Body() generateSignatureDto: GenerateSignatureDto,
  ): Promise<CloudinarySignatureResponse> {
    return firstValueFrom(
      this.contentClient.send(
        'assets.generate_upload_signature',
        generateSignatureDto,
      ),
    );
  }
}

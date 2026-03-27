import { Injectable } from '@angular/core';
import { HttpResponse } from '@angular/common/http';
import { BaseService } from './base.service';

@Injectable({
  providedIn: 'root'
})
export class ImageUploadService extends BaseService {
  private readonly endpoint = '/uploadimage';

  async uploadImage(file: File): Promise<HttpResponse<any>> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', 'uploads');
    return await this.post<any>(this.endpoint, formData);
  }

  async uploadMultipleImages(files: File[]): Promise<HttpResponse<any>> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });
    return await this.post<any>(`${this.endpoint}/multiple`, formData);
  }
}

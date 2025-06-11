import { SupabaseService } from './supabase.service';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PhotosService {
  private readonly BUCKET_NAME = 'gallery';

  constructor(private supabase: SupabaseService) {}

  async getPhotos() {
    try {
      const bucketData = await this.supabase.listImages();
      return bucketData;
    } catch (error) {
      console.error('Error in getPhotos:', error);
      throw error;
    }
  }
  async uploadPhotos(file: File) {
    try {
      const { data, error } = await this.supabase.uploadImage(file);
      if (error) {
        console.error('Error in uploadPhotos:', error);
        throw new Error(`Failed to upload file: ${error.message}`);
      }
      console.log('Successfully uploaded file:', data);
    } catch (error) {
      console.error('Error in uploadPhotos:', error);
      throw error;
    }
  }
}

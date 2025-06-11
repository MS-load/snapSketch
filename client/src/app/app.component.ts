import { Component } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'snapIt';
  message = '';
  images: string[] = [];
  qrCodeData = '';
  selectedImage = '';
  isImageModalOpen = false;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadImages();
    this.generateUploadLink();
  }

  async generateUploadLink() {
    const uniqueId = window.crypto.randomUUID();
    const { data, error } = await this.supabase.createUploadUrl(uniqueId);

    if (error || !data) {
      this.message = 'Failed to generate upload link';
      return;
    }

    // Create a URL-safe JSON string with the upload details
    const uploadInfo = {
      url: data.url,
      token: data.token,
      path: data.path,
    };

    // Convert to base64 to make it URL-safe
    const uploadInfoStr = btoa(JSON.stringify(uploadInfo));

    // Create a URL that points to your upload page with the encoded data
    const uploadPageUrl = `${window.location.origin}/upload?data=${uploadInfoStr}`;

    this.qrCodeData = uploadPageUrl;
    this.message = 'Scan QR code to upload image';
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const { error } = await this.supabase.uploadImage(file);
    this.message = error ? 'Upload failed' : 'Upload successful!';
    if (!error) {
      this.loadImages();
    }
  }

  async loadImages() {
    this.images = await this.supabase.listImages();
  }

  enlargeImage(img: string) {
    console.log(img);
    this.selectedImage = img;
    this.isImageModalOpen = true;
  }

  closeModal() {
    this.isImageModalOpen = false;
    this.selectedImage = '';
  }
}

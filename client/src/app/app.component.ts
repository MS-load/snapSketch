import { Component, OnInit } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'snapIt';
  message = '';
  images: string[] = [];
  qrCodeData = '';
  selectedImage = '';
  isImageModalOpen = false;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    this.loadImages();
    // Generate the QR code URL using the current origin
    const uploadUrl = `${window.location.origin}?action=upload`;
    this.qrCodeData = uploadUrl;
    this.message = 'Scan QR code to upload image';
  }

  isUploadView(): boolean {
    // Check if the URL has the upload action parameter
    const params = new URLSearchParams(window.location.search);
    return params.get('action') === 'upload';
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

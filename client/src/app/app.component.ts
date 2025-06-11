import { Component, OnInit, OnDestroy } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snapSketch';
  message = '';
  images: string[] = [];
  qrCodeData = '';
  selectedImage = '';
  isImageModalOpen = false;
  private pollingSubscription?: Subscription;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    // Generate the QR code URL using the current origin
    const uploadUrl = `${window.location.origin}/${this.title}?action=upload`;
    this.qrCodeData = uploadUrl;
    this.message = 'Scan QR code to upload image';

    // Start polling for new images every 5 seconds
    this.loadImages();
    this.startPolling();
  }

  ngOnDestroy() {
    // Clean up the subscription when component is destroyed
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }

  private startPolling() {
    // Poll every 5 seconds
    this.pollingSubscription = interval(5000)
      .pipe(switchMap(() => this.supabase.listImages()))
      .subscribe((newImages) => {
        // Update if there are more images than before
        if (newImages.length > this.images.length) {
          this.images = newImages;
        }
      });
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
    this.message = error
      ? 'Upload failed'
      : 'Upload successful! Gallery will update shortly...';
  }

  async loadImages() {
    this.images = await this.supabase.listImages();
  }

  enlargeImage(img: string) {
    this.selectedImage = img;
    this.isImageModalOpen = true;
  }

  closeModal() {
    this.isImageModalOpen = false;
    this.selectedImage = '';
  }
}

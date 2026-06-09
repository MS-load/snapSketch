import { Component, OnInit, OnDestroy, computed, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    standalone: false
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'snapSketch';
  readonly message = signal('');
  readonly images = signal<string[]>([]);
  readonly qrCodeData = signal('');
  readonly selectedImage = signal('');
  readonly isImageModalOpen = signal(false);
  readonly isUploadView = signal(this.getIsUploadViewFromUrl());
  readonly hasImages = computed(() => this.images().length > 0);
  private pollingSubscription?: Subscription;

  constructor(private supabase: SupabaseService) {}

  ngOnInit() {
    // Generate the QR code URL using the current origin
    const uploadUrl = `${window.location.origin}/${this.title}?action=upload`;
    this.qrCodeData.set(uploadUrl);
    this.message.set('Scan QR code to upload image');

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
        this.images.set(newImages);
      });
  }

  private getIsUploadViewFromUrl(): boolean {
    // Check if the URL has the upload action parameter
    const params = new URLSearchParams(window.location.search);
    return params.get('action') === 'upload';
  }

  async onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) return;

    const { error } = await this.supabase.uploadImage(file);

    if (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown upload error';
      this.message.set(`Upload failed: ${errorMessage}`);
      return;
    }

    this.message.set('Upload successful! Gallery will update shortly...');
  }

  async loadImages() {
    const imageList = await this.supabase.listImages();
    this.images.set(imageList);
  }

  enlargeImage(img: string) {
    this.selectedImage.set(img);
    this.isImageModalOpen.set(true);
  }

  closeModal() {
    this.isImageModalOpen.set(false);
    this.selectedImage.set('');
  }
}
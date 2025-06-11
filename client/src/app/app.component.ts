import { Component } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  message = '';
  images: string[] = [];

  constructor(private supabase: SupabaseService) {}

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const { error } = await this.supabase.uploadImage(file);
    this.message = error ? 'Upload failed' : 'Upload successful!';
  }

  async loadImages() {
    this.images = await this.supabase.listImages();
  }
}

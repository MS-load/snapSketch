import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

type UploadResult = {
  error: Error | null;
  data: unknown;
};

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private bucketName = 'gallery';

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabasePublicKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );
  }

  async createUploadUrl(uniqueId: string) {
    try {
      // Create a URL that points to our upload endpoint
      const baseUrl = `${environment.supabaseUrl}/storage/v1/object/${this.bucketName}`;
      const uploadUrl = `${baseUrl}/${uniqueId}`;

      // Get the current session
      const {
        data: { session },
        error: sessionError,
      } = await this.supabase.auth.getSession();
      if (sessionError) {
        throw sessionError;
      }

      return {
        data: {
          url: uploadUrl,
          token: session?.access_token,
          path: uniqueId,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  async uploadImage(file: File): Promise<UploadResult> {
    try {
      const filePath = `${Date.now()}_${file.name}`;
      const { data, error } = await this.supabase.storage
        .from(this.bucketName)
        .upload(filePath, file);

      if (error) {
        console.error('Supabase upload error:', {
          bucket: this.bucketName,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          error,
        });
      }

      return { data, error };
    } catch (error) {
      console.error('Unexpected upload exception:', {
        bucket: this.bucketName,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        error,
      });

      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown upload failure'),
      };
    }
  }

private urlCache = new Map<string, string>();

async listImages(): Promise<string[]> {
  const { data, error } = await this.supabase.storage
    .from(this.bucketName)
    .list('', { limit: 100 });

  if (error) return [];

  const urls = await Promise.all(
    data
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(async file => {
        if (this.urlCache.has(file.name)) {
          return this.urlCache.get(file.name)!;
        }
        const { data } = await this.supabase.storage
          .from(this.bucketName)
          .createSignedUrl(file.name, 60 * 60 * 24);
        const url = data?.signedUrl || '';
        if (url) this.urlCache.set(file.name, url);
        return url;
      })
  );

  return urls.filter(Boolean);
}

}

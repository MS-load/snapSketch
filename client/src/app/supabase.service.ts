import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from 'src/environments/environment';

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

  async uploadImage(file: File): Promise<{ error: any; data: any }> {
    const filePath = `${Date.now()}_${file.name}`;
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .upload(filePath, file);
    return { data, error };
  }

  async listImages(): Promise<string[]> {
    const { data, error } = await this.supabase.storage
      .from(this.bucketName)
      .list('', { limit: 100 });

    if (error) {
      console.error('List error:', error);
      return [];
    }

    const signedUrls = await Promise.all(
      data.map(async (file) => {
        const { data } = await this.supabase.storage
          .from(this.bucketName)
          .createSignedUrl(file.name, 60 * 60 * 24 * 1); // 1 day expiry
        return data?.signedUrl || '';
      })
    );
    return signedUrls.filter((url) => url !== '');
  }
}

import { TestBed } from '@angular/core/testing';

import { PhotosService } from './photos.service';
import { SupabaseService } from './supabase.service';

describe('PhotosService', () => {
  let service: PhotosService;
  const supabaseServiceMock = {
    listImages: jasmine.createSpy('listImages').and.resolveTo([]),
    uploadImage: jasmine.createSpy('uploadImage').and.resolveTo({
      data: null,
      error: null,
    }),
  };

  beforeEach(() => {
    supabaseServiceMock.listImages.calls.reset();
    supabaseServiceMock.uploadImage.calls.reset();

    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseService,
          useValue: supabaseServiceMock,
        },
      ],
    });
    service = TestBed.inject(PhotosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';
import { QRCodeComponent } from 'angularx-qrcode';

import { AppComponent } from './app.component';
import { SupabaseService } from './supabase.service';

describe('AppComponent', () => {
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
      imports: [QRCodeComponent],
      declarations: [AppComponent],
      providers: [
        {
          provide: SupabaseService,
          useValue: supabaseServiceMock,
        },
      ],
    });
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it("should have as title 'snapSketch'", () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('snapSketch');
  });

  it('should render the desktop header', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.qr-section h2')?.textContent).toContain('Snap 📸');
  });
});

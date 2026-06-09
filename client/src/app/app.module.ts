import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { QRCodeComponent } from 'angularx-qrcode';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [AppComponent],
    imports: [BrowserModule, AppRoutingModule, QRCodeComponent],
    providers: [provideHttpClient(withInterceptorsFromDi())],
    bootstrap: [AppComponent],
})
export class AppModule {}

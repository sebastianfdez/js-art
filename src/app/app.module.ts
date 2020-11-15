import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TriangleArtComponent } from './triangle-art/triangle-art.component';
import { JSArtSpaceComponent } from './space/space.component';
import { JSArtMandalaComponent } from './mandala/mandala.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { JSArtSoundService } from './services/sound.service';
import { JSArtPaintService } from './services/paint.service';

// Material
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatSliderModule } from '@angular/material/slider';

@NgModule({
  declarations: [
    AppComponent,
    TriangleArtComponent,
    JSArtSpaceComponent,
    JSArtMandalaComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatRadioModule,
    FormsModule,
    MatSliderModule,
  ],
  providers: [
    JSArtSoundService,
    JSArtPaintService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

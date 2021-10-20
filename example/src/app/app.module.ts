import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ControlService, DynamicFormSchemaModule } from 'dynamic-form-schema';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DynamicFormComponent } from './dynamic-form/dynamic-form.component';
import { ControlTypeComponent } from './control-type/control-type.component';
import { ControlServiceDerive } from './services/ControlServiceDerive';


@NgModule({
  declarations: [
    AppComponent,
    DynamicFormComponent, 
    ControlTypeComponent
  ],
  imports: [
    CommonModule,
    BrowserModule,
    MatButtonModule,
    AppRoutingModule,
    ReactiveFormsModule,
    DynamicFormSchemaModule,
    MatSliderModule,
    BrowserAnimationsModule
  ],
  providers: [ControlService, ControlServiceDerive],
  bootstrap: [AppComponent]
})
export class AppModule { }

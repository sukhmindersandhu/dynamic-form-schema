import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { DynamicFormSchemaComponent } from './dynamic-form-schema.component';
import { ControlTemplateDirective } from './directives/control-template.directive';
import { ControlService } from './+services/ControlService';


@NgModule({
  declarations: [
    DynamicFormSchemaComponent,
    ControlTemplateDirective
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  exports: [
    DynamicFormSchemaComponent,
    ControlTemplateDirective
  ]
})
export class DynamicFormSchemaModule { }

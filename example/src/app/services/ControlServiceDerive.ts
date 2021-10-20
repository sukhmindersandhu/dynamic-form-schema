import { Injectable } from '@angular/core';
import {
  FormBuilder,
} from '@angular/forms';
import { ControlService } from 'dynamic-form-schema';
import { IDictionary } from 'dynamic-form-schema/lib/+models/IDictionary';

@Injectable()
export class ControlServiceDerive extends ControlService {

  constructor(protected fb: FormBuilder) {
    super(fb);
  }

  public validationMap(): IDictionary<any> {
    return {
      ...super.validationMap(),
      emailGroup: (args: any[]) => this.getValidatorFn('emailGroup')
    };
  }
}
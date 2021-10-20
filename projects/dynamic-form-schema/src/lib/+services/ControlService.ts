import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { IDictionary } from '../+models/IDictionary';
import { ControlServiceBase } from './ControlServiceBase';

@Injectable()
export class ControlService extends ControlServiceBase {

  constructor(protected fb: FormBuilder) {
    super(fb);
  }

  public getErrors(formGroup: FormGroup) {
    return this.getFormValidationErrors(formGroup.controls).map((error) => {
      switch (error.errorName) {
        case 'required':
          return `${error.controlName} is required!`;
        case 'pattern':
          return `${error.controlName} has wrong pattern!`;
        case 'email':
          return `${error.controlName} has wrong email format!`;
        case 'minlength':
          return `${error.controlName} has wrong length!, required min length: ${error.errorValue.requiredLength}`;
        case 'maxlength':
          return `${error.controlName} has wrong length!, required max length: ${error.errorValue.requiredLength}`;
        case 'areEqual':
          return `${error.controlName} must be equal!`;
        case 'range':
          return `${error.controlName} is not in range!, required between : ${error.errorValue[0]} to ${error.errorValue[1]}`;
        case 'emailsNotMatched':
          return `${error.controlName} Email and ConfirmEmail fields must be email and match!`;
        default:
          return `${error.controlName}: ${error.errorName}: ${error.errorValue}`;
      }
    });
  }

  public validationMap(): IDictionary<any> {
    return {
      required: (args: any[]) => Validators.required,
      minLength: (args: number[]) => Validators.minLength(args[0]),
      maxLength: (args: number[]) => Validators.maxLength(args[0]),
      range: (args: number[]) => this.getValidatorFn('range', args),
    };
  }

  public comparerMap: IDictionary<any> = {
    equalTo: (args: any[]): Boolean => args[0] === args[1],
    notEqualTo: (args: any[]): Boolean => args[0] !== args[1],
    isNull: (args: any[]): Boolean => args[0] === null,
    isNotNull: (args: any[]): Boolean => args[0] !== null,
  };

  /* 
    Defined validations and validators
  */
  public getValidatorFn(name: string, args: any[] = null): ValidatorFn {
    switch (name) {
      case 'range':
        return (c: AbstractControl): { [key: string]: number[] } | null => {
          if ( c.value !== null && (isNaN(c.value) || c.value < args[0] || c.value > args[1])) {
            return { range: [args[0], args[1]] };
          }
  
          return null;
        };

      case 'emailGroup':
        return (c: AbstractControl): { [key: string]: boolean } | null => {
          if (c instanceof FormGroup) {
            // Validate emails matches, make sure control matches
            const emailControl = c.get('email');
            const confirmControl = c.get('confirmEmail');
  
            if (!emailControl.touched || !confirmControl.touched) {
              return null;
            }
  
            if (emailControl.value === confirmControl.value) {
              return null;
            }
  
            return { emailsNotMatched: true };
          }
  
          return null;
        };

      default:
        return null;
    }
  }

  calculateStyles(formGroup: FormGroup, key: string) {
    const control = this.getControlfromFromGroup(formGroup, key); 
    return !this.hasControlValid(control) ? {
      'border-color': '#FF1A1A',
      'box-shadow' : '0 0 10px #ff6666',
      'border-radius': '3px',
      'flex': '2'
    }
    :
    {
      'flex': '2'
    }
  }
}
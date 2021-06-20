import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  Validators,
  ValidationErrors,
} from '@angular/forms';
import { ControlModel } from '../+models/ControlModel';
import { IDictionary } from '../+models/IDictionary';
import {
  ConditionalDisabled,
  ControlSchema,
  Validation,
} from '../+models/Schema';

export interface ValidationError {
  controlName: string;
  errorName: string;
  errorValue: any;
}

export interface FormGroupControls {
  [key: string]: AbstractControl;
}

@Injectable()
export class ControlService {

  validations: IDictionary<any> = {};

  constructor(private fb: FormBuilder) {}

  getErrors(formGroup: FormGroup) {
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

  getFormValidationErrors(controls: FormGroupControls): ValidationError[] {
    let errors: ValidationError[] = [];
    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      if (control instanceof FormGroup) {
        errors = errors.concat(this.getFormValidationErrors(control.controls));
      }
      const controlErrors: ValidationErrors | null  = controls[key].touched ? controls[key].errors : null;
      if (controlErrors !== null) {
        Object.keys(controlErrors).forEach((keyError) => {
          errors.push({
            controlName: key,
            errorName: keyError,
            errorValue: controlErrors[keyError],
          });
        });
      }
    });

    return errors;
  }

  validationMap: IDictionary<any> = {
    required: (args: any[]) => Validators.required,
    minLength: (args: number[]) => Validators.minLength(args[0]),
    maxLength: (args: number[]) => Validators.maxLength(args[0]),
    range: (args: number[]) => this.getValidatorFn('range', args),
    emailGroup: (args: any[]) => this.getValidatorFn('emailGroup')
  };

  ComparerMap: IDictionary<any> = {
    equalTo: (args: any[]): Boolean => args[0] === args[1],
    notEqualTo: (args: any[]): Boolean => args[0] !== args[1],
    isNull: (args: any[]): Boolean => args[0] === null,
    isNotNull: (args: any[]): Boolean => args[0] !== null,
  };

  Comparer(conditionType: string, args: any[]): boolean {
    return this.ComparerMap[conditionType](args);
  }

  mapValiations(
    key: string,
    validations: IDictionary<Validation[]>
  ): ValidatorFn[] {
    const validationFunctions = validations[key]?.map((element) => {
      return this.validationMap[element.name](element?.args);
    });

    return validationFunctions;
  }

  processConditionalValidations(
    name: string,
    value: any,
    formGroup: FormGroup,
    schema: ControlSchema
  ) {
    // conditional Validations
    schema.conditionalValidations[name]?.forEach((cv) => {
      if (
        cv.value.filter((v) => this.Comparer(cv.condition, [value, v])).length >
        0
      ) {
        const valdsExists = cv.validations.filter(
          (c) =>
            c.name !== null &&
            (this.validations[cv.targetControlName]?.validations?.findIndex(
              (n) => n.name === c.name
            ) === -1 ||
              !this.validations.hasOwnProperty(cv.targetControlName))
        );
        if (valdsExists.length > 0) {
          const Valds =
            valdsExists.map((x) => this.validationMap[x.name](x?.args)) || [];
          this.validations[cv.targetControlName] = {
            validations: Valds,
            id: cv.id,
          };
          if (Valds.length > 0) {
            formGroup.get(cv.targetControlName).setValidators(Valds);
            formGroup.get(cv.targetControlName).updateValueAndValidity({ onlySelf: true });
          }
        }
      } else {
        cv.validations
          .filter(
            (c) =>
              c.name !== null &&
              this.validations[cv.targetControlName]?.id === cv?.id &&
              this.validations[cv.targetControlName].validations.length &&
              this.validations[cv.targetControlName].validations?.findIndex(
                (n) => n.name === c.name
              ) > -1
          )
          .forEach((item) => {
            const index = this.validations[
              cv.targetControlName
            ].validations?.findIndex((n) => n.name === item.name);
            if (index > -1) {
              formGroup.get(cv.targetControlName).clearValidators();
              const defaultValds = schema.defaultValidations[
                cv.targetControlName
              ]?.map((x) => this.validationMap[x.name](x?.args));
              formGroup
                .get(cv.targetControlName)
                .setValidators(defaultValds || []);
              this.validations[cv.targetControlName].validations.splice(
                index,
                1
              );
              if (
                this.validations[cv.targetControlName].validations.length < 1
              ) {
                delete this.validations[cv.targetControlName];
              }

              formGroup.get(cv.targetControlName).updateValueAndValidity({ onlySelf: true });
            }
          });
      }
    });

    // enable/ disable
    schema.conditionalDisabled[name]?.forEach((cd) => {
      if (
        cd.value.filter((v) => this.Comparer(cd.condition, [value, v])).length >
        0
      ) {
        cd.targetControlNames.forEach((c, i) =>
          this.setEnabledDisabled(cd.disabled, c, cd, formGroup, i)
        );
      } else {
        const ctrl = schema.controls.find((x) => x.key === name);
        if (ctrl) {
          cd.targetControlNames.forEach((c, i) =>
            this.setEnabledDisabled(ctrl?.disabled, c, cd, formGroup, i)
          );
        }
      }
    });

    // Options
    schema.conditionalOptions[name]?.forEach((co) => {
      if (
        co.value.filter((v) => this.Comparer(co.condition, [value, v])).length >
        0
      ) {
        formGroup.get(co.targetControlName).setValue(co?.optionValue);
      }
    });
  }

  setEnabledDisabled(
    disabledFlag: boolean,
    targetControlName: string,
    cd: ConditionalDisabled,
    formGroup: FormGroup,
    index: number
  ) {
    if (disabledFlag) {
      cd?.disabledValues?.length
        ? formGroup.get(targetControlName).setValue(cd?.disabledValues[index])
        : cd.emptyIt
        ? formGroup.get(targetControlName).setValue('')
        : '';
    } else if (cd.emptyIt) {
      formGroup.get(targetControlName).setValue('');
    }

    disabledFlag
      ? formGroup.get(targetControlName).disable()
      : formGroup.get(targetControlName).enable();
  }

  /* 
    Defined validations and validators
  */
  getValidatorFn(name: string, args: any[] = null): ValidatorFn {
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

  getControls(items: ControlModel[], schema: ControlSchema) {
    return items.reduce((obj, item) => {
      return {
        ...obj,
        [item['key']]: [
          { value: item.value, disabled: item.disabled },
          this.mapValiations(item.key, schema.defaultValidations),
        ],
      };
    }, {});
  }

  toFormGroup(schema: ControlSchema) {
    // Generating form controls
    const formGroups = schema.controls
      .filter((x) => x.controlType === 'formgroup')
      .reduce((obj, item) => {
        const objs = {
          ...obj,
          [item['key']]: this.fb.group(
            this.getControls(item.controls, schema),
            { validator: this.validationMap[item['key']](null) }
          ),
        };

        return objs;
      }, {});

    const grpControls = this.getControls(schema.controls, schema);
    return this.fb.group({ ...grpControls, ...formGroups });
  }

  hasControlValid(control: AbstractControl): boolean {
    if (control instanceof FormGroup) {
      if (!control.touched) {
        return true;
      }

      return control.valid;
    }

    return control && control.touched && control?.errors ? !(Object.keys(control?.errors)?.length > 0) : true;
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

  getControlfromFromGroup(formGroup: FormGroup, key: string): AbstractControl {
    let control = formGroup.controls[key];
    if (control === null || control === undefined)  {
      Object.entries(formGroup.controls).forEach(([elementKey, elementValue]) => {
        if (!control && elementValue instanceof FormGroup) {
          control = this.getControlfromFromGroup(elementValue, key);
        }
      });
    }

    return control;
  }

  checkAndValidateAllFormGroupControls(formGroup: FormGroup) {
    Object.entries(formGroup.controls).forEach(([_, control]) => {
      if (control instanceof FormGroup) {
        this.checkAndValidateAllFormControls(control);
      }
    });
  }

  // Check Form Groups Validations
  private checkAndValidateAllFormControls(formGroup: FormGroup) {
      Object.entries(formGroup.controls).forEach(([_, control]) => {
        if (control instanceof FormGroup) {
            this.checkAndValidateAllFormControls(control);
          }
          else {
            control.updateValueAndValidity();
        }
    });
  }
}
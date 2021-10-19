import { Injectable } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidatorFn,
  ValidationErrors,
} from '@angular/forms';
import { ControlModel } from '../+models/ControlModel';
import { IDictionary } from '../+models/IDictionary';
import {
  ConditionalDisabled,
  ControlSchema,
  Validation,
} from '../+models/Schema';

export interface FormGroupControls {
  [key: string]: AbstractControl;
}

export interface ValidationError {
  controlName: string;
  errorName: string;
  errorValue: any;
}

@Injectable()
export abstract class ControlServiceBase {

  validations: IDictionary<any> = {};

  constructor(protected fb: FormBuilder) { }

  public abstract validationMap: IDictionary<any>;

  public abstract ComparerMap: IDictionary<any>;

  public abstract calculateStyles(formGroup: FormGroup, key: string);

  public abstract getErrors(formGroup: FormGroup);
   
  /* 
    Defined validations and validators
  */
  public abstract getValidatorFn(name: string): ValidatorFn;

  getFormValidationErrors(controls: FormGroupControls): ValidationError[] {
    let errors: ValidationError[] = [];
    Object.keys(controls).forEach((key) => {
      const control = controls[key];
      if (control instanceof FormGroup) {
        errors = errors.concat(this.getFormValidationErrors(control.controls));
      }
      const controlErrors: ValidationErrors = controls[key].touched ? controls[key].errors : null;
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
    if (schema?.conditionalValidations) {
      schema?.conditionalValidations[name]?.forEach((cv) => {
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
    }

    // enable/ disable
    if (schema?.conditionalDisabled) {
      schema?.conditionalDisabled[name]?.forEach((cd) => {
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
    }

    // Options
    if (schema?.conditionalOptions) {
      schema?.conditionalOptions[name]?.forEach((co) => {
        if (
          co.value.filter((v) => this.Comparer(co.condition, [value, v])).length >
          0
        ) {
          formGroup.get(co.targetControlName).setValue(co?.optionValue);
        }
      });
    }
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
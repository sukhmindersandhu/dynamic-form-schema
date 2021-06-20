import { Component, QueryList, ViewChildren } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { of } from "rxjs";
import { Subscription } from "rxjs/internal/Subscription";
import { ControlService, FormGroupControls } from "../+services/ControlService";
import { ControlSchema } from '../+models/Schema';

@Component({
    template: ''
  })
export class ControlPresenterBase {
    sub: Subscription[] = [];
    controls$;
    newForm: FormGroup;
  
    constructor(protected controlService: ControlService) { }

    formGroupControlsSubscribeAndValidate(schema: ControlSchema, formGroup: FormGroup) {
        this.unsubscribeSub();
        this.subscribeControls(formGroup.controls, formGroup, schema);
    }

    onInit(currentSchema: ControlSchema) {
        this.controls$ = of(currentSchema?.controls.sort((a, b) => a.order - b.order));
        this.newForm = this.controlService.toFormGroup(currentSchema);
        this.formGroupControlsSubscribeAndValidate(currentSchema, this.newForm);
    }

    ngOnDestroy(): void {
        this.unsubscribeSub();
    }

    unsubscribeSub() {
        this.sub.forEach(x => x.unsubscribe());
    }
    
    subscribeControls(controls: FormGroupControls, formGroup: FormGroup, schema: ControlSchema): void {
        Object.entries(controls).forEach(([name, control]) => {
            if (control instanceof FormGroup) {
                this.subscribeControls(control.controls, control, schema);
              }
              else {
                // Subscribe each property 
                this.sub.push(control.valueChanges.subscribe(value => {
                    this.controlService.processConditionalValidations(name, value, formGroup, schema);
                }))
            }
        });
    }

    saveAll() : boolean {
        this.newForm.markAllAsTouched();
        this.newForm.markAsPristine();
        this.controlService.checkAndValidateAllFormGroupControls(this.newForm);
        return this.newForm.valid;
    }
}
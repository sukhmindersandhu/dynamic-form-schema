import { Component} from "@angular/core";
import { FormGroup } from "@angular/forms";
import { of, BehaviorSubject } from "rxjs";
import { Subscription } from "rxjs/internal/Subscription";
import { ControlService } from "../+services/ControlService";
import { ControlSchema } from '../+models/Schema';
import { FormGroupControls } from "../+services/ControlServiceBase";
import { ControlModel } from "./ControlModel";

@Component({
    template: ''
  })
export class ControlPresenterBase {
    sub: Subscription[] = [];
    controls$;
    activeControls = new BehaviorSubject<ControlModel[]>(null);
    activeControls$ = this.activeControls.asObservable();
    newForm: FormGroup;
  
    constructor(protected controlService: ControlService) { }

    formGroupControlsSubscribeAndValidate(schema: ControlSchema, formGroup: FormGroup) {
        this.unsubscribeSub();
        this.subscribeControls(formGroup.controls, formGroup, schema);
    }

    protected updateActiveControls(controls: ControlModel[]): ControlModel[] {
        const newControls = controls.map(x => {
            if (x.options?.length) {
                return { ...x, options$: of(x.options) };
            }

            return x;
        });

        this.activeControls.next(newControls);
        return newControls;
    }

    onInit(currentSchema: ControlSchema) {
        this.newForm = this.controlService.toFormGroup(currentSchema);
        const controls = currentSchema?.controls?.slice()
                .sort((a, b) => a.order - b.order);
        this.controls$ = of(controls);
        this.updateActiveControls(controls);
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
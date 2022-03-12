import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlModel, ControlPresenterBase, ControlService } from 'dynamic-form-schema';
import { asyncScheduler, of } from 'rxjs';
import { citylist } from '../schemas/city';
import { schema } from '../schemas/Schema';
import { observeOn } from 'rxjs/operators';
import { ControlServiceDerive } from '../services/ControlServiceDerive';

@Component({
  selector: 'dynamic-form',
  templateUrl: './dynamic-form.component.html',
  styleUrls: ['./dynamic-form.component.scss']
})
export class DynamicFormComponent extends ControlPresenterBase implements OnInit, OnDestroy {

  constructor(public controlService: ControlServiceDerive) {
    super(controlService);
   }
  
  ngOnInit() {
    if (schema) {
      if (schema.controls.length) {
        const itemswithDynamicKeywords = schema.controls.filter(x => x.dynamic === true)
        .map(x => x.dynamicKeyword);

        if (itemswithDynamicKeywords?.length) {
          this.getOptionsData().pipe(
            observeOn(asyncScheduler)
            ).subscribe(
            (x: { city: {id: number, name: string}[]})  => {
            let newControls = [...schema.controls] as ControlModel[];
            itemswithDynamicKeywords.forEach(item => {
              if (item in x) {
                const masterData = x[item];
                console.log(masterData);
                const options = masterData.map(item => ({ key: item.id?.toString(), value: item.name}));
                const control = schema.controls.find(x => x.dynamicKeyword === item);
                const updatedControl: ControlModel = { ...control, options: options };
                newControls = newControls.filter(x => x.dynamicKeyword !== item) ;
                newControls.push(updatedControl);
              }
            })
            this.updateActiveControls(newControls);
          });
        }
      }

      this.onInit(schema);
    }
  }

  getOptionsData() {
    // Mock city dropdown control cities data - usually queries from the Api     
    return of(citylist);
  }

  save() {
    if (this.saveAll()) {
      console.log('Save with no errors!');
    }
  }
}

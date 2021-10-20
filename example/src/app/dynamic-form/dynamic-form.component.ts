import { Component, OnDestroy, OnInit } from '@angular/core';
import { ControlPresenterBase, ControlService } from 'dynamic-form-schema';
import { schema } from '../schemas/Schema';
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
  
  ngOnDestroy(): void {
    this.sub.forEach(x => x.unsubscribe());
  }

  ngOnInit() {
    this.onInit(schema);
  }

  save() {
    if (this.saveAll()) {
      console.log('Save with no errors!');
    }
  }
}

import { Component, Input, OnInit, SkipSelf } from '@angular/core';
import { ControlContainer, FormGroupDirective , FormControl, FormGroup } from '@angular/forms';
import { ControlModel } from 'dynamic-form-schema';

@Component({
  selector: 'control-type',
  templateUrl: './control-type.component.html',
  styleUrls: ['./control-type.component.scss'],
  viewProviders: [
    {
      provide: ControlContainer,
      useExisting: FormGroupDirective,
    }
  ]
})
export class ControlTypeComponent implements OnInit {
  controlModel: ControlModel;

  @Input() controlGroupName: string ='';
  @Input() style;


  @Input() set entity(control: ControlModel) {
    this.controlModel = control; 
  }

  get entity() {
    return this.controlModel;
  }

  constructor() { }

  ngOnInit() {
  }


}

import { TemplateRef } from "@angular/core";

export class ControlModel {
    value?: any;
    key?: string;
    label?: string;
    order?: number;
    disabled?: boolean;
    controlType?: string;   // input, dropdown, mat-slider etc.
    options?: {key: string, value: string}[];
    type?: string;  // text, radio, email, etc. - only for input control type
    groupName?: string;
    controls?: ControlModel[];
    tabTemplateRef?: TemplateRef<any>;

    constructor(options: {
        value?: any;
        key?: string;
        label?: string;
        order?: number;
        disabled?: boolean;
        controlType?: string;
        options?: {key: string, value: string}[];
        type?: string;
      } = {}) {
      this.value = options.value;
      this.key = options.key || '';
      this.label = options.label || '';
      this.order = options.order === undefined ? 1 : options.order;
      this.disabled = options.disabled || false;
      this.controlType = options.controlType || '';
      this.options = options.options || [];
      this.type = options.type || '';
    }
  }  
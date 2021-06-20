import { ControlModel } from "./ControlModel";
import { IDictionary } from "./IDictionary";

export interface Validation {
    name?: string;
    args?: any[];
}

export interface ConditionalValidation {
    id: string;
    condition: string; // equalTo, notEqualTo, isNull, isNotNull
    value: any[]; 
    targetControlName?: string;
    validations?: Validation[];
}

export interface ConditionalDisabled extends ConditionalValidation {
    targetControlNames?: string[];
    disabled?: boolean;
    emptyIt?: boolean;   // when enabled, if emptyIt true, empty any value including disabledValues 
    disabledValues?: string[];
}

export interface ConditionalOption extends ConditionalValidation {
    optionValue?: string;
}

// Contains default and conditional Validations, options, disabled setting
export class ControlSchema {
    defaultValidations?: IDictionary<Validation[]>;
    conditionalValidations?: IDictionary<ConditionalValidation[]>;
    conditionalDisabled?: IDictionary<ConditionalDisabled[]>;
    conditionalOptions?: IDictionary<ConditionalOption[]>;
    controls: ControlModel[];
}
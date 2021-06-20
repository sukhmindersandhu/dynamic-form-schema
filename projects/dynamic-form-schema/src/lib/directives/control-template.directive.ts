import { Directive, Input, TemplateRef } from "@angular/core";

/**
 * Used to capture the template ref of an element
 */
@Directive({
    selector: '[zxskysoft-ContentTemplate]'
})
export class ControlTemplateDirective {
    @Input() id?: string;

    constructor(public templateRef: TemplateRef<any>){}

}
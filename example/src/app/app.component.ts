import { Component } from '@angular/core';
import { ControlService } from 'dynamic-form-schema';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'angular-test1';

constructor(controlService: ControlService) {

  }

}

import { Component } from '@angular/core';
import { LoginComponent } from 'ruku-bookings';

@Component({
  selector: 'app-login-wrapper',
  imports: [LoginComponent],
  template: `<app-login [showHeader]="false" [showFooter]="false"></app-login>`
})
export class LoginWrapperComponent {}

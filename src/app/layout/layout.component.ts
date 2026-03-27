import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, FooterComponent, NavItem } from 'ruku-bookings';

@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <app-header
      [navItems]="navItems"
      brandTitle="Ruku Bookings"
    ></app-header>
    <main>
      <router-outlet></router-outlet>
    </main>
    <app-footer></app-footer>
  `,
  styles: [`
    main {
      min-height: calc(100vh - 128px);
      padding-top: 70px;
    }
  `]
})
export class LayoutComponent {
  navItems: NavItem[] = [
    { label: 'Home', route: '/', show: 'always' },
    { label: 'Dashboard', route: '/features', show: 'auth' },
    { label: 'Sign In', route: '/login', show: 'unauth' }
  ];
}

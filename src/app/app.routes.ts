import { Routes } from '@angular/router';
import {
  FeatureComponent,
  ServiceManagerComponent,
  AvailabilityManagerComponent,
  ScheduleManagerComponent,
  authGuard
} from 'ruku-bookings';
import { LayoutComponent } from './layout/layout.component';
import { LoginWrapperComponent } from './layout/login-wrapper.component';
import { HomeComponent } from './pages/home/home.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'login', component: LoginWrapperComponent },
      {
        path: 'features',
        component: FeatureComponent,
        canActivate: [authGuard],
        children: [
          { path: '', redirectTo: 'service-manager', pathMatch: 'full' },
          { path: 'service-manager', component: ServiceManagerComponent },
          { path: 'availability-manager', component: AvailabilityManagerComponent },
          { path: 'schedule-manager', component: ScheduleManagerComponent }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '' }
];

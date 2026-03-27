/*
 * Public API Surface of ruku-bookings
 */

// Environment
export { LIB_ENVIRONMENT } from './lib/environment/environment.token';
export type { LibEnvironment } from './lib/environment/environment.token';

// Models
export type { Availability } from './lib/models/availability.model';
export type { Service } from './lib/models/service.model';
export type { Schedule } from './lib/models/schedule.model';

// Base
export { BaseComponent } from './lib/base/base.component';
export { BaseService } from './lib/services/base.service';

// Services
export { AuthService } from './lib/services/auth.service';
export type { AuthUser, AuthResponse, LoginRequest, RegisterRequest } from './lib/services/auth.service';
export { authInterceptor } from './lib/services/auth.interceptor';
export { ProductService } from './lib/services/product.service';
export { AvailabilityService } from './lib/services/availability.service';
export { ScheduleService } from './lib/services/schedule.service';
export { ImageUploadService } from './lib/services/imageupload.service';

// Guards
export { authGuard } from './lib/guards/auth.guard';

// Shared
export { MaterialModule } from './lib/shared/material.module';

// Components
export { HorizontalCardListComponent } from './lib/components/horizontal-card-list/horizontal-card-list.component';
export { HeaderComponent } from './lib/components/header/header.component';
export type { NavItem } from './lib/components/header/header.component';
export { FooterComponent } from './lib/components/footer/footer.component';
export { AvailabilityManagerComponent } from './lib/components/availability-manager/availability-manager.component';
export { ScheduleManagerComponent } from './lib/components/schedule-manager/schedule-manager.component';
export { ServiceManagerComponent } from './lib/components/service-manager/service-manager.component';

// Pages
export { LoginComponent } from './lib/pages/login/login.component';
export { FeatureComponent } from './lib/pages/feature/feature.component';

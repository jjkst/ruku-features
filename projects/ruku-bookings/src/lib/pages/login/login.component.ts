import { Component, OnInit, AfterViewInit, NgZone, ElementRef, ViewChild, Input, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../shared/material.module';
import { AuthService, RegisterRequest } from '../../services/auth.service';
import { HeaderComponent } from '../../components/header/header.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LIB_ENVIRONMENT } from '../../environment/environment.token';

declare const google: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [
    MaterialModule,
    ReactiveFormsModule,
    CommonModule,
    HeaderComponent,
    FooterComponent
  ],
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, AfterViewInit {
  @ViewChild('googleBtn') googleBtn!: ElementRef;
  @Input() showHeader = true;
  @Input() showFooter = true;
  private env = inject(LIB_ENVIRONMENT);

  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isRegisterMode = false;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private ngZone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.authService.isAuthenticated) {
      this.router.navigate(['/features']);
      return;
    }

    // Handle GitHub OAuth callback
    const code = this.route.snapshot.queryParamMap.get('code');
    if (code) {
      this.handleGitHubCallback(code);
    }

    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      uid: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      uid: ['', [Validators.required, Validators.minLength(6)]],
      displayName: ['', Validators.required]
    });
  }

  ngAfterViewInit(): void {
    this.initGoogleSignIn();
  }

  private initGoogleSignIn(): void {
    if (typeof google === 'undefined') return;

    google.accounts.id.initialize({
      client_id: this.env.googleClientId,
      callback: (response: any) => {
        this.ngZone.run(() => this.handleGoogleCredential(response.credential));
      }
    });

    if (this.googleBtn?.nativeElement) {
      google.accounts.id.renderButton(this.googleBtn.nativeElement, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with'
      });
    }
  }

  private async handleGoogleCredential(credential: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.googleLogin(credential);
      this.router.navigate(['/features']);
    } catch (error: any) {
      this.errorMessage = 'Google sign-in failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  loginWithGitHub(): void {
    window.location.href = this.authService.getGitHubAuthUrl();
  }

  private async handleGitHubCallback(code: string): Promise<void> {
    this.loading = true;
    this.errorMessage = '';

    try {
      await this.authService.githubLogin(code);
      this.router.navigate(['/features']);
    } catch (error: any) {
      this.errorMessage = 'GitHub sign-in failed. Please try again.';
      this.loading = false;
    }
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    this.errorMessage = '';
  }

  async onLogin(): Promise<void> {
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, uid } = this.loginForm.value;
      await this.authService.login(email, uid);
      this.router.navigate(['/features']);
    } catch (error: any) {
      this.errorMessage = error?.status === 401
        ? 'Invalid email or password.'
        : 'Login failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async onRegister(): Promise<void> {
    if (!this.registerForm.valid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    try {
      const { email, uid, displayName } = this.registerForm.value;
      const request: RegisterRequest = {
        email,
        uid,
        displayName,
        emailVerified: false,
        provider: 5 // Email provider
      };
      await this.authService.register(request);
      this.router.navigate(['/features']);
    } catch (error: any) {
      this.errorMessage = error?.status === 409
        ? 'An account with this email already exists.'
        : 'Registration failed. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}
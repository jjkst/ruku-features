import { Component, inject, OnDestroy, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LIB_ENVIRONMENT } from '../environment/environment.token';

@Component({
  selector: 'app-base',
  template: '',
  styles: []
})
export abstract class BaseComponent implements OnDestroy {
  loading = false;
  protected destroy$ = new Subject<void>();
  protected snackBar = inject(MatSnackBar);
  private basePlatformId = inject(PLATFORM_ID);
  private env = inject(LIB_ENVIRONMENT);

  constructor() {}

  get canManage(): boolean {
    if (!this.env.production) {
      return true;
    }
    if (isPlatformBrowser(this.basePlatformId)) {
      return !!localStorage.getItem('auth_token');
    }
    return false;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected showToast(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning'
  ): void {
    const duration = 3000;
    this.snackBar.open(message, 'Close', {
      duration: duration,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: [`toast-${type}`],
    });
  }

  protected formatDateToYMD(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  protected generateUid(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }
}

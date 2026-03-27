import { Component, OnInit, OnDestroy, Input, inject } from '@angular/core';
import { MaterialModule } from '../../shared/material.module';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService, AuthUser } from '../../services/auth.service';

export interface NavItem {
  label: string;
  route: string;
  show?: 'always' | 'auth' | 'unauth';
}

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private authService = inject(AuthService);
  private userSub?: Subscription;

  @Input() navItems: NavItem[] = [
    { label: 'Projects', route: '/projects', show: 'always' },
    { label: 'About', route: '/about', show: 'always' },
    { label: 'Contact', route: '/contact', show: 'always' },
    { label: 'Dashboard', route: '/features', show: 'auth' },
    { label: 'Sign In', route: '/login', show: 'unauth' }
  ];
  @Input() logoUrl = 'ruku-logo-250.png';
  @Input() brandTitle = 'Karthik Jayaraman';

  isMenuOpen = false;
  isSubMenuOpen = false;
  isLoggedIn = false;
  isAdmin = false;
  isOwner = false;

  ngOnInit(): void {
    this.userSub = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!user;
      this.isAdmin = user?.role === 'Admin';
      this.isOwner = user?.role === 'Owner';
    });
  }

  ngOnDestroy(): void {
    this.userSub?.unsubscribe();
  }

  isVisible(item: NavItem): boolean {
    if (!item.show || item.show === 'always') return true;
    if (item.show === 'auth') return this.isLoggedIn;
    if (item.show === 'unauth') return !this.isLoggedIn;
    return true;
  }

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
  }

  toggleSubMenu(): void {
    this.isSubMenuOpen = !this.isSubMenuOpen;
  }

  closeMenu(): void {
    this.isMenuOpen = false;
    this.isSubMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
  }
}

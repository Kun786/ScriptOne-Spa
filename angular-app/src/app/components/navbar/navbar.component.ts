import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
})
export class NavbarComponent {
  state = inject(AppStateService);
  mobileMenuOpen = false;

  isHome = computed(() => this.state.view() === 'home');
  themeIcon = computed(() => this.state.theme() === 'dark' ? '☼' : '◐');

  toggleMobileMenu() { this.mobileMenuOpen = !this.mobileMenuOpen; }
  closeMobileMenu() { this.mobileMenuOpen = false; }

  scrollToSection(id: string) {
    this.closeMobileMenu();
    if (this.state.view() !== 'home') this.state.navigateToHome();
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset - 120, behavior: 'smooth' });
    }, 50);
  }
}

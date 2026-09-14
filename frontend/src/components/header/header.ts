import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Menu, X } from 'lucide-angular';
import { ZardDarkMode } from '@/shared/services';
import { ZardDropdownProfileComponent } from '../dropdown-menu/dropdown-menu';
import { SidebarService } from '@/shared/core/services/sidebar/sidebar.service';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ZardDropdownProfileComponent, ZardIconComponent], // Adicione o que mais usar (z-button, etc)
  templateUrl: './header.html',
})
export class Header {
  private readonly darkModeService = inject(ZardDarkMode);

  public sidebarService = inject(SidebarService);

  readonly MenuIcon = Menu;
  readonly CloseIcon = X;

  toggleTheme() {
    this.darkModeService.toggleTheme();
  }
}

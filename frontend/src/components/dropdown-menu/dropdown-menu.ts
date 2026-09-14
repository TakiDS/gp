import { Component, HostListener, inject, signal } from '@angular/core';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDividerComponent } from '@/shared/components/divider';
import { ZardDropdownImports } from '@/shared/components/dropdown';
import { ZardMenuImports } from '@/shared/components/menu';
import { LucideAngularModule, ChevronDown, LogOut } from 'lucide-angular';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '@/shared/core/services/user/user.service';

export interface UserData {
  uuid: string;
  nome: string;
  login: string;
  role: string;
}

@Component({
  selector: 'z-dropdown-profile',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ZardDividerComponent, RouterModule],
  template: `
    <div class="relative">
      <button
        type="button"
        (click)="toggle()"
        class="flex items-center gap-2 px-2 md:px-3 py-1.5 border border-border rounded-full hover:bg-accent hover:border-accent transition-all duration-300 bg-muted/20 group focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <span class="md:hidden text-xs font-bold text-foreground max-w-[60px] truncate">
          {{ (user()?.nome?.split(' ') ?? [])[0] || 'Usuário' }}
        </span>

        <span
          class="hidden md:block text-xs font-bold text-foreground group-hover:text-primary transition-colors"
        >
          {{ user()?.nome || 'Carregando...' }}
        </span>

        <lucide-angular
          [img]="ChevronDown"
          class="w-3.5 h-3.5 text-muted-foreground"
        ></lucide-angular>
      </button>

      @if (isOpen()) {
        <div
          class="absolute right-0 top-full mt-2 w-56 z-[200] bg-card border border-border rounded-xl shadow-xl p-1.5"
        >
          <div class="px-3 py-4 mb-1 bg-muted/30 rounded-lg">
            <p class="text-sm font-bold text-foreground leading-none">{{ user()?.nome }}</p>
            <p class="text-[11px] text-muted-foreground mt-1.5 truncate font-medium">
              {{ user()?.login }}
            </p>
            <div
              class="mt-2 inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-primary/10 text-primary"
            >
              {{ user()?.role === 'ADMIN' ? 'Administrador' : 'Gestor' }}
            </div>
          </div>

          <div class="h-px bg-border/50 my-1"></div>

          <button
            type="button"
            class="w-full rounded-lg cursor-pointer px-3 py-2.5 text-left hover:bg-destructive/10 text-destructive transition-all flex items-center gap-3 group"
            (click)="onLogout()"
          >
            <div
              class="p-1.5 rounded-md bg-destructive/5 group-hover:bg-destructive/10 transition-colors"
            >
              <lucide-angular [img]="Logout" class="w-4 h-4"></lucide-angular>
            </div>
            <span class="text-sm font-bold">Sair do sistema</span>
          </button>
        </div>
      }
    </div>
  `,
})
export class ZardDropdownProfileComponent {
  private readonly router = inject(Router);
  readonly user = signal<UserData | null>(null);
  readonly userService = inject(UserService);
  readonly isOpen = signal(false);

  readonly ChevronDown = ChevronDown;
  readonly Logout = LogOut;

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const el = event.target as HTMLElement;
    if (!el.closest('z-dropdown-profile')) {
      this.isOpen.set(false);
    }
  }

  toggle() {
    this.isOpen.update((v) => !v);
  }

  ngOnInit() {
    this.buscarDadosUsuario();
  }

  private buscarDadosUsuario() {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      this.onLogout();
      return;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const uuid = payload.id;
      if (uuid) {
        this.userService.getProfileUser(uuid).subscribe({
          next: (data) => this.user.set(data),
          error: () => this.onLogout(),
        });
      } else {
        this.onLogout();
      }
    } catch (e) {
      this.onLogout();
    }
  }

  protected onLogout(): void {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('user');
    this.router.navigate(['/login']);
  }
}

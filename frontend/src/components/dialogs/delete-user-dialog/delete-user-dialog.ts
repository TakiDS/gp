import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { LucideAngularModule, Trash2, AlertTriangle, User, Loader2 } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService, Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import { ZardButtonComponent } from '@/shared/components/button/button.component';

export interface DeleteUserData {
  uuid: string;
  nome: string;
  login: string;
}

@Component({
  selector: 'app-delete-user-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  styles: [
    `
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes slide-from-top {
        from {
          opacity: 0;
          transform: translateY(-14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .anim-scale-in {
        animation: scale-in 0.35s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-header {
        animation: slide-from-top 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 60ms;
      }
      .anim-card {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 130ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 200ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full max-w-md mx-auto rounded-2xl bg-background text-foreground overflow-hidden anim-scale-in"
    >
      <!-- Header -->
      <div class="px-6 pt-7 pb-5 flex items-start gap-4 anim-header">
        <div class="p-3 bg-destructive/10 rounded-xl text-destructive shrink-0">
          <lucide-angular [img]="AlertTriangle" size="22"></lucide-angular>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg font-bold tracking-tight leading-tight">Excluir Usuário</h2>
          <p class="text-muted-foreground text-sm leading-relaxed mt-0.5">
            Esta ação é irreversível e não pode ser desfeita.
          </p>
        </div>
      </div>

      <!-- Card do usuário -->
      <div class="px-6 pb-5 anim-card">
        <div class="bg-muted/30 border border-border rounded-xl p-4 flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <lucide-angular [img]="User" size="16" class="text-primary"></lucide-angular>
          </div>
          <div class="min-w-0">
            <p class="font-bold text-sm text-foreground truncate">{{ data.nome }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ data.login }}</p>
          </div>
        </div>
      </div>

      <!-- Botões -->
      <div class="px-6 pb-6 flex flex-col-reverse sm:flex-row gap-3 anim-actions">
        <button
          type="button"
          (click)="closeModal()"
          [disabled]="loading()"
          class="w-full sm:flex-1 h-11 rounded-xl bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          (click)="confirm()"
          [disabled]="loading()"
          class="w-full sm:flex-1 h-11 rounded-xl bg-destructive text-white font-bold text-sm hover:bg-destructive/90 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-destructive/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          @if (loading()) {
            <lucide-angular [img]="Loader2" size="16" class="animate-spin"></lucide-angular>
            Excluindo...
          } @else {
            <lucide-angular [img]="Trash2" size="16"></lucide-angular>
            Confirmar Exclusão
          }
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteUserDialogComponent {
  readonly AlertTriangle = AlertTriangle;
  readonly Trash2 = Trash2;
  readonly User = User;
  readonly Loader2 = Loader2;

  private dialogRef = inject(ZardDialogRef);
  public data = inject<DeleteUserData>(Z_MODAL_DATA);

  @Output() confirmado = new EventEmitter<void>();

  loading = signal(false);

  confirm() {
    this.loading.set(true);
    this.confirmado.emit();
  }

  closeModal() {
    this.dialogRef.close(false);
  }

  closeSuccess() {
    this.dialogRef.close(true);
  }

  setLoading(v: boolean) {
    this.loading.set(v);
  }
}

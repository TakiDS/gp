import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LucideAngularModule, Check } from 'lucide-angular';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';

export interface PatrimonioCreatedData {
  nome: string;
  quantidade: number;
}

@Component({
  selector: 'zard-patrimonio-created-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  styles: [
    `
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.95) translateY(12px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }
      @keyframes pop-in {
        0% {
          opacity: 0;
          transform: scale(0.5);
        }
        70% {
          transform: scale(1.15);
        }
        100% {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes check-draw {
        from {
          opacity: 0;
          transform: scale(0) rotate(-20deg);
        }
        to {
          opacity: 1;
          transform: scale(1) rotate(0deg);
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
        animation: scale-in 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-icon {
        animation: pop-in 0.5s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 100ms;
      }
      .anim-check {
        animation: check-draw 0.35s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 280ms;
      }
      .anim-title {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 200ms;
      }
      .anim-card {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 300ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 380ms;
      }
    `,
  ],
  template: `
    <div class="w-full rounded-2xl bg-background text-foreground overflow-hidden anim-scale-in">
      <div class="flex flex-col items-center text-center gap-3 p-5 sm:p-6 sm:pt-7">
        <div
          class="flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30 anim-icon"
        >
          <lucide-angular
            [img]="Check"
            size="28"
            class="text-white anim-check sm:hidden"
            strokeWidth="3"
          ></lucide-angular>
          <lucide-angular
            [img]="Check"
            size="34"
            class="text-white anim-check hidden sm:block"
            strokeWidth="3"
          ></lucide-angular>
        </div>

        <div class="anim-title px-1">
          <h2 class="text-lg sm:text-xl font-bold text-foreground leading-snug">
            Patrimônio adicionado com sucesso!
          </h2>
          <p class="mt-1 text-sm text-muted-foreground">
            {{ data.quantidade }}
            {{
              data.quantidade === 1
                ? 'novo patrimônio foi adicionado'
                : 'novos patrimônios foram adicionados'
            }}
            com sucesso.
          </p>
        </div>

        <div class="w-full rounded-xl border border-border bg-muted/40 px-4 py-3 anim-card">
          <div class="flex items-center gap-3 min-w-0">
            <span
              class="text-xs sm:text-sm font-bold text-muted-foreground bg-background border border-border rounded-md px-2 py-1 shrink-0"
            >
              {{ data.quantidade }}x
            </span>
            <span class="text-sm font-semibold text-foreground truncate" [title]="data.nome">
              {{ nomeExibido }}
            </span>
          </div>
        </div>

        <div class="flex w-full flex-col gap-2.5 mt-1 anim-actions">
          <button
            (click)="addMore()"
            class="w-full h-11 rounded-xl bg-brand-color text-sm font-bold text-white hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 transition-all cursor-pointer shadow-sm"
          >
            Adicionar mais patrimônios
          </button>
          <button
            (click)="goToList()"
            class="w-full h-11 rounded-xl bg-muted text-sm font-semibold text-foreground hover:bg-muted/80 active:scale-95 transition-all cursor-pointer border border-border"
          >
            Ir para a lista
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardPatrimonioCreatedDialogComponent {
  private dialogRef = inject(ZardDialogRef);
  private router = inject(Router);

  readonly Check = Check;
  public data = inject<PatrimonioCreatedData>(Z_MODAL_DATA);

  get nomeExibido(): string {
    const max = 35;
    if (!this.data?.nome) return '';
    return this.data.nome.length > max ? this.data.nome.substring(0, max) + '...' : this.data.nome;
  }

  addMore() {
    this.dialogRef.close('addMore');
  }

  goToList() {
    this.dialogRef.close('goToList');
    this.router.navigate(['/patrimonios']);
  }

  close() {
    this.dialogRef.close();
  }
}

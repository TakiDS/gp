import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Trash2,
  AlertTriangle,
  Box,
  Hash,
  MapPin,
  Loader2,
} from 'lucide-angular';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';

export interface DeletePatrimonioData {
  uuid: string;
  descricao: string;
  numPatrimonio: string;
  localAtual?: string;
}

@Component({
  selector: 'zard-delete-patrimonio-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
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
      .anim-textarea {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 200ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 260ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full max-w-lg mx-auto rounded-2xl bg-background text-foreground overflow-hidden anim-scale-in"
    >
      <!-- Header -->
      <div class="px-6 sm:px-8 pt-7 sm:pt-8 flex items-start sm:items-center gap-4 anim-header">
        <div class="p-3 bg-destructive/10 rounded-xl text-destructive shrink-0">
          <lucide-angular [img]="AlertTriangle" size="24"></lucide-angular>
        </div>
        <div class="min-w-0">
          <h2 class="text-lg sm:text-xl font-bold tracking-tight leading-tight">
            Excluir Patrimônio
          </h2>
          <p class="text-muted-foreground text-sm leading-relaxed mt-0.5">
            Esta ação é irreversível e será registrada no histórico.
          </p>
        </div>
      </div>

      <div class="px-6 sm:px-8 py-6 flex flex-col gap-5">
        <!-- Card do item -->
        <div
          class="bg-muted/30 border border-border rounded-xl p-4 sm:p-5 flex flex-col gap-4 anim-card"
        >
          <div class="flex items-start gap-3">
            <lucide-angular
              [img]="Box"
              size="18"
              class="mt-1 text-primary shrink-0"
            ></lucide-angular>
            <div class="flex flex-col min-w-0">
              <span
                class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5"
              >
                Item para exclusão
              </span>
              <span class="font-bold text-sm sm:text-[15px] break-words">{{ data.descricao }}</span>
            </div>
          </div>

          <div class="h-px bg-border/40"></div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div class="flex items-start gap-3">
              <lucide-angular
                [img]="Hash"
                size="16"
                class="text-muted-foreground shrink-0 mt-0.5"
              ></lucide-angular>
              <div class="flex flex-col">
                <span
                  class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5"
                  >Nº Patrimônio</span
                >
                <span class="text-sm font-semibold">{{ data.numPatrimonio }}</span>
              </div>
            </div>

            @if (data.localAtual) {
              <div class="flex items-start gap-3">
                <lucide-angular
                  [img]="MapPin"
                  size="16"
                  class="text-muted-foreground shrink-0 mt-0.5"
                ></lucide-angular>
                <div class="flex flex-col">
                  <span
                    class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5"
                    >Localização</span
                  >
                  <span class="text-sm font-semibold">{{ data.localAtual }}</span>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Motivo -->
        <div class="flex flex-col gap-2 anim-textarea">
          <label
            for="observacao"
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
          >
            Motivo da Exclusão
          </label>
          <textarea
            id="observacao"
            [(ngModel)]="observacaoStr"
            (ngModelChange)="onInputChange($event)"
            rows="3"
            placeholder="Descreva o motivo da exclusão para fins de auditoria..."
            class="w-full resize-none rounded-lg border border-input bg-muted/30 px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/30 focus:border-destructive transition-all placeholder:text-muted-foreground/40 disabled:opacity-50"
            [disabled]="loading()"
          ></textarea>
          @if (observacao().length > 0 && observacao().length < 10) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200">
              O motivo deve ter pelo menos 10 caracteres.
            </span>
          }
        </div>
      </div>

      <!-- Botões -->
      <div
        class="px-6 sm:px-8 pb-7 sm:pb-8 flex flex-col-reverse sm:flex-row items-center gap-3 anim-actions"
      >
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
          [disabled]="!canConfirm()"
          class="w-full sm:flex-1 h-11 rounded-xl bg-red-600 text-white font-bold text-sm hover:bg-red-700 hover:-translate-y-0.5 hover:shadow-lg active:scale-95 active:translate-y-0 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-red-600/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-y-0"
        >
          @if (loading()) {
            <lucide-angular [img]="Loader2" size="16" class="animate-spin"></lucide-angular>
            Processando...
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
export class ZardDeletePatrimonioDialogComponent {
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly Box = Box;
  readonly Hash = Hash;
  readonly MapPin = MapPin;
  readonly Loader2 = Loader2;

  private dialogRef = inject(ZardDialogRef);
  private patrimonioService = inject(PatrimonioService);
  private router = inject(Router);
  public data = inject<DeletePatrimonioData>(Z_MODAL_DATA);

  @Output() aoSucesso = new EventEmitter<void>();

  // string para o ngModel do textarea
  public observacaoStr = '';
  public observacao = signal('');
  public loading = signal(false);

  readonly canConfirm = computed(() => {
    const obs = this.observacao().trim();
    const regex = /^[a-zA-ZÀ-ÿ0-9\s.,\-\/\(\)!?]*$/;
    return obs.length >= 10 && regex.test(obs) && !this.loading();
  });

  onInputChange(value: string) {
    const cleaned = value.replace(/[^a-zA-ZÀ-ÿ0-9\s.,\-\/\(\)!?]/g, '');
    this.observacaoStr = cleaned;
    this.observacao.set(cleaned);
  }

  confirm() {
    if (!this.canConfirm()) return;

    this.loading.set(true);
    this.patrimonioService.deletePatrimonio(this.data.uuid, this.observacao()).subscribe({
      next: () => {
        this.loading.set(false);
        this.dialogRef.close(true);
        setTimeout(() => {
          this.router.navigate(['/historico-geral']).then(() => window.scrollTo(0, 0));
        }, 300);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro ao excluir:', err);
      },
    });
  }

  closeModal() {
    this.dialogRef.close(false);
  }
}

// ─────────────────────────────────────────────
// Botão
// ─────────────────────────────────────────────
@Component({
  selector: 'zard-delete-patrimonio-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="h-10 px-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 hover:bg-destructive/20 hover:border-destructive/30 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 group"
    >
      <lucide-angular
        [img]="Trash2"
        size="16"
        strokeWidth="2.5"
        class="mr-2 group-hover:scale-110 transition-transform"
      ></lucide-angular>
      <span class="font-semibold text-sm">Excluir</span>
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardDeletePatrimonioButtonComponent {
  readonly Trash2 = Trash2;

  private dialogService = inject(ZardDialogService);

  @Input({ required: true }) patrimonio!: DeletePatrimonioData;
  @Output() itemExcluido = new EventEmitter<void>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardDeletePatrimonioDialogComponent,
      zData: this.patrimonio,
      zHideFooter: true,
      zWidth: '520px',
    });

    const instance = dialogRef.componentInstance as ZardDeletePatrimonioDialogComponent;
    instance.aoSucesso.subscribe(() => this.itemExcluido.emit());
  }
}

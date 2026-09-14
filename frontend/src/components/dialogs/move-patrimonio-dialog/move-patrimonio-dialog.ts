import {
  Component,
  inject,
  signal,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Output,
  EventEmitter,
  Input,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { LocalService } from '@/shared/core/services/local/local.service';
import { finalize, map } from 'rxjs/operators';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { MovePatrimonioData } from '@/shared/core/models/patrimonio/move-patrimonio-interface';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import {
  ArrowLeftRight,
  ArrowRightLeft,
  ChevronDown,
  LucideAngularModule,
  MapPin,
  Activity,
  MessageSquare,
  Info,
} from 'lucide-angular';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { ZardMovePatrimonioSuccessDialogComponent } from '../move-sucess-patrimonio-dialog/move-sucess-patrimonio-dialog';

@Component({
  selector: 'app-move-patrimonio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardSelectComponent,
    ZardSelectImports,
    LucideAngularModule,
  ],
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
          transform: translateY(-16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(12px);
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
      .anim-info {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 120ms;
      }
      .anim-field-1 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 180ms;
      }
      .anim-field-2 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 240ms;
      }
      .anim-field-3 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 300ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 360ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-xl bg-background text-foreground p-4 sm:p-7 max-h-[90dvh] overflow-y-auto overscroll-contain custom-scrollbar anim-scale-in"
    >
      @if (data()) {
        <!-- Header -->
        <div class="flex items-start justify-between mb-5 pb-4 border-b border-border anim-header">
          <div class="flex items-center gap-3 min-w-0">
            <div
              class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"
            >
              <lucide-angular
                [img]="ArrowRightLeft"
                size="17"
                class="text-primary"
              ></lucide-angular>
            </div>
            <div class="min-w-0">
              <h2 class="text-base sm:text-lg font-bold tracking-tight truncate">
                Movimentar Patrimônio
              </h2>
              <p class="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                {{ data()?.numPatrimonio }}
              </p>
            </div>
          </div>
        </div>

        <!-- Info atual do patrimônio -->
        <div class="bg-muted/30 rounded-xl border border-border p-4 mb-5 anim-info">
          <p class="text-sm font-semibold text-foreground mb-3 line-clamp-2">
            {{ data()?.descricao }}
          </p>
          <div class="flex flex-col sm:flex-row gap-3 sm:gap-6">
            <div class="flex items-center gap-2">
              <lucide-angular
                [img]="MapPin"
                size="13"
                class="text-muted-foreground shrink-0"
              ></lucide-angular>
              <div>
                <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Local Atual
                </p>
                <p class="text-sm font-semibold text-foreground">
                  {{ data()?.localAtual?.nome || 'Não definido' }}
                </p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <lucide-angular
                [img]="Activity"
                size="13"
                class="text-muted-foreground shrink-0"
              ></lucide-angular>
              <div>
                <p class="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                  Status Atual
                </p>
                <span
                  class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold border"
                  [ngClass]="{
                    'bg-teal-500/10 text-teal-400 border-teal-500/20':
                      data()?.statusAtual?.value === 'GUARDADO',
                    'bg-amber-500/10 text-amber-400 border-amber-500/20':
                      data()?.statusAtual?.value === 'EM_USO' ||
                      data()?.statusAtual?.value === 'USO',
                    'bg-red-500/10 text-red-400 border-red-500/20':
                      data()?.statusAtual?.value === 'DEFEITO',
                    'bg-purple-500/10 text-purple-400 border-purple-500/20':
                      data()?.statusAtual?.value === 'MANUTENCAO',
                  }"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></span>
                  {{ data()?.statusAtual?.label }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <form [formGroup]="form" (ngSubmit)="movePatrimonio()" class="space-y-4">
          <!-- Novo Local -->
          <div class="flex flex-col gap-1.5 anim-field-1">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
            >
              <lucide-angular [img]="MapPin" size="13"></lucide-angular>
              Novo Local
            </label>
            @if (ready()) {
              <z-select
                zPlaceholder="Selecione o local..."
                formControlName="novoLocal"
                class="w-full"
              >
                @for (item of locais(); track item.uuid) {
                  <z-select-item [zValue]="item.uuid">{{ item.exibicao }}</z-select-item>
                }
              </z-select>
            } @else {
              <div class="h-11 w-full bg-muted/50 rounded-lg animate-pulse"></div>
            }
            @if (form.get('novoLocal')?.touched && form.get('novoLocal')?.invalid) {
              <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                >Campo obrigatório.</span
              >
            }
          </div>

          <!-- Novo Status -->
          <div class="flex flex-col gap-1.5 anim-field-2">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
            >
              <lucide-angular [img]="Activity" size="13"></lucide-angular>
              Novo Status
            </label>
            <z-select zPlaceholder="Selecione..." formControlName="novoStatus" class="w-full">
              @for (item of listaStatus(); track item.value) {
                <z-select-item [zValue]="item.value">{{ item.label }}</z-select-item>
              }
            </z-select>
            @if (form.get('novoStatus')?.touched && form.get('novoStatus')?.invalid) {
              <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                >Campo obrigatório.</span
              >
            }
          </div>

          <!-- Observações -->
          <div class="flex flex-col gap-1.5 anim-field-3">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
            >
              <lucide-angular [img]="MessageSquare" size="13"></lucide-angular>
              Observações
              <span class="text-muted-foreground/50 font-normal normal-case">(opcional)</span>
            </label>
            <textarea
              rows="3"
              formControlName="observacoes"
              placeholder="Descreva o motivo da movimentação..."
              class="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
            ></textarea>
          </div>

          <!-- Botões -->
          <div
            class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border anim-actions"
          >
            <button
              type="button"
              (click)="close()"
              class="w-full sm:w-auto h-11 px-6 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 active:scale-95 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="loading || form.invalid"
              class="w-full sm:w-auto h-11 min-w-[180px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
            >
              @if (loading) {
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                Processando...
              } @else {
                Confirmar Movimentação
              }
            </button>
          </div>
        </form>
      } @else {
        <div class="flex justify-center items-center py-16">
          <div
            class="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"
          ></div>
        </div>
      }
    </div>
  `,
})
export class MovePatrimonioDialogComponent implements OnInit, OnDestroy {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);
  private localService = inject(LocalService);
  private patrimonioService = inject(PatrimonioService);
  private cdr = inject(ChangeDetectorRef);
  private dialogService = inject(ZardDialogService);

  readonly ArrowRightLeft = ArrowRightLeft;
  readonly MapPin = MapPin;
  readonly Activity = Activity;
  readonly MessageSquare = MessageSquare;
  readonly Info = Info;

  data = signal<MovePatrimonioData | null>(null);
  loading = false;
  ready = signal(false);

  readonly locais = signal<{ uuid: string; exibicao: string }[]>([]);

  readonly listaStatus = signal([
    { value: 'GUARDADO', label: 'Guardado' },
    { value: 'USO', label: 'Em Uso' },
    { value: 'MANUTENCAO', label: 'Em Manutenção' },
    { value: 'DEFEITO', label: 'Com Defeito' },
  ]);

  form: FormGroup = this.fb.group({
    novoLocal: [null, Validators.required],
    novoStatus: [null, Validators.required],
    observacoes: [''],
  });

  @Input() set zData(val: MovePatrimonioData | null | undefined) {
    if (val && !this.data()) this.iniciar(val);
  }

  ngOnInit() {
    // ✅ Trava scroll do body (mesmo padrão do edit-patrimonio)
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    if (!this.data()) {
      const ref = this.dialogRef as any;
      const dados = ref.zData || ref.data || ref.config?.zData || ref.zConfig?.zData;
      if (dados) this.iniciar(dados);
    }
  }

  ngOnDestroy() {
    // ✅ Restaura scroll ao fechar
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  public iniciar(dados: MovePatrimonioData) {
    this.data.set(dados);
    this.form.patchValue({ novoStatus: dados.statusAtual.value });
    this.carregarLocais(dados.localAtual?.uuid || null);
  }

  public movePatrimonio() {
    if (!this.data() || this.form.invalid) return;

    this.loading = true;

    this.patrimonioService
      .movePatrimonio(
        this.data()?.uuid || '',
        this.form.value.novoLocal,
        this.form.value.novoStatus,
        this.form.value.observacoes,
      )
      .subscribe({
        next: () => {
          this.loading = false;
          const dataAtual: any = this.data();
          if (dataAtual?.onSuccess) dataAtual.onSuccess();

          this.dialogRef.close();

          this.dialogService.create({
            zContent: ZardMovePatrimonioSuccessDialogComponent,
            zHideFooter: true,
            zWidth: 'min(720px, calc(100vw - 32px))',
            zData: {
              nomePatrimonio: this.data()?.descricao,
              localAntigo: this.data()?.localAtual?.nome,
              localNovo: this.locais().find((l) => l.uuid === this.form.value.novoLocal)?.exibicao,
              statusAntigo: this.data()?.statusAtual?.label,
              statusNovo: this.listaStatus().find((s) => s.value === this.form.value.novoStatus)
                ?.label,
            },
          });
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
  }

  private carregarLocais(localAtualId: string | null) {
    this.ready.set(false);

    this.localService
      .listAll({ page: 0, size: 999 })
      .pipe(
        map((res: any) => {
          const lista = res.content || res;
          return lista.map((item: any) => ({
            uuid: item.uuid,
            exibicao: item.local || item.nome || 'Sem nome',
          }));
        }),
        map((res: any[]) => (localAtualId ? res.filter((l) => l.uuid !== localAtualId) : res)),
        finalize(() => {
          this.ready.set(true);
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: (dados) => this.locais.set(dados),
        error: () => this.locais.set([]),
      });
  }

  close() {
    this.dialogRef.close();
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Botão
// ─────────────────────────────────────────────────────────────────────────────
@Component({
  selector: 'zard-move-patrimonio-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule, CommonModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="w-full md:w-auto px-6 h-10 bg-brand-color hover:bg-brand-color/90 text-white transition-all shadow-sm flex items-center justify-center gap-2 rounded-lg"
    >
      <lucide-angular [img]="ArrowLeftRight" size="16" strokeWidth="2"></lucide-angular>
      Movimentar
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardMovePatrimonioButtonComponent {
  readonly ArrowLeftRight = ArrowLeftRight;

  private dialogService = inject(ZardDialogService);
  private patrimonioService = inject(PatrimonioService);

  @Input({ required: true }) patrimonio!: MovePatrimonioData;
  @Output() onMovimentado = new EventEmitter<any>();

  openDialog() {
    this.patrimonioService.listInfoPatrimonio(this.patrimonio.uuid).subscribe({
      next: (res) => {
        const dadosMapeados: any = {
          uuid: res.uuid,
          numPatrimonio: res.numPatrimonio,
          descricao: res.patrimonioGeral?.descricao,
          localAtual: {
            uuid: res.localizacao?.uuid,
            nome: res.localizacao?.local,
          },
          statusAtual: {
            value: res.estado,
            label: this.formatarStatus(res.estado),
          },
          onSuccess: () => this.onMovimentado.emit(),
        };

        this.dialogService.create({
          zContent: MovePatrimonioDialogComponent,
          zHideFooter: true,
          zWidth: 'min(640px, calc(100vw - 32px))',
          zData: dadosMapeados,
        });
      },
    });
  }

  private formatarStatus(status: string): string {
    const labels: Record<string, string> = {
      GUARDADO: 'Guardado',
      USO: 'Em Uso',
      EM_USO: 'Em Uso',
      DEFEITO: 'Com Defeito',
      MANUTENCAO: 'Em Manutenção',
    };
    return labels[status] || status;
  }
}

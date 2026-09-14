import { signal, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize, map } from 'rxjs/operators';
import { Archive, MapPin } from 'lucide-angular';

import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { LocalService } from '@/shared/core/services/local/local.service';
import {
  PatrimonioService,
  BodyMovimentacaoEmMassa,
} from '@/shared/core/services/patrimonio/patrimonio.service';
import { Component, inject, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ArrowLeftRight, X } from 'lucide-angular';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';

export interface MoveMultipleData {
  ids: string[];
  nomeLocalAtual: string;
  localAtualId: string;
  onRefresh?: () => void;
}

@Component({
  selector: 'app-move-multiple-patrimonios-dialog',
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
        animation: scale-in 0.3s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-fade-up {
        animation: fade-up 0.3s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .d-75 {
        animation-delay: 75ms;
      }
      .d-125 {
        animation-delay: 125ms;
      }
      .d-175 {
        animation-delay: 175ms;
      }
      .d-225 {
        animation-delay: 225ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-6 py-6 sm:px-8 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-5 anim-fade-up">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <lucide-angular [img]="ArrowLeftRight" size="18" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight">Movimentação em Massa</h2>
            <p class="text-sm text-muted-foreground mt-0.5">
              Mova os itens selecionados para outro local.
            </p>
          </div>
        </div>
      </div>

      <div class="h-px bg-border mb-5 anim-fade-up d-75"></div>

      <div
        class="bg-muted/40 rounded-xl border border-border p-4 mb-5 flex justify-between items-center anim-fade-up d-75"
      >
        <div>
          <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
            Origem
          </p>
          <div class="flex items-center gap-2 text-foreground font-semibold text-sm">
            <lucide-angular [img]="MapPin" size="14" class="text-primary/60"></lucide-angular>
            {{ data()?.nomeLocalAtual }}
          </div>
        </div>
        <div class="text-right">
          <p class="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1">
            Selecionados
          </p>
          <p class="text-3xl font-black text-primary leading-none">
            {{ data()?.ids?.length || 0 }}
          </p>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="confirm()" class="space-y-4">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 anim-fade-up d-125">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
              >Novo Local</label
            >
            @if (ready()) {
              <z-select zPlaceholder="Selecione o destino..." formControlName="novoLocal">
                @for (item of locais(); track item.uuid) {
                  <z-select-item [zValue]="item.uuid">{{ item.exibicao }}</z-select-item>
                }
              </z-select>
            } @else {
              <div class="h-11 w-full bg-muted animate-pulse rounded-lg"></div>
            }
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
              >Novo Status</label
            >
            <z-select zPlaceholder="Selecione o status..." formControlName="novoStatus">
              @for (status of listaStatus; track status.value) {
                <z-select-item [zValue]="status.value">{{ status.label }}</z-select-item>
              }
            </z-select>
          </div>
        </div>

        <div class="flex flex-col gap-1.5 anim-fade-up d-175">
          <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            >Observações</label
          >
          <textarea
            rows="2"
            formControlName="observacoes"
            placeholder="Motivo da movimentação..."
            class="w-full rounded-lg border border-border bg-muted/30 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
          ></textarea>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-border anim-fade-up d-225"
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
            class="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-color text-white text-sm font-bold shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Movendo...
            } @else {
              <lucide-angular [img]="ArrowLeftRight" size="15"></lucide-angular>
              Confirmar Movimentação
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class MoveMultiplePatrimoniosDialogComponent implements OnInit {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);
  private localService = inject(LocalService);
  private patrimonioService = inject(PatrimonioService);
  private cdr = inject(ChangeDetectorRef);

  readonly Archive = Archive;
  readonly MapPin = MapPin;
  readonly ArrowLeftRight = ArrowLeftRight;
  readonly X = X;

  data = signal<MoveMultipleData | null>(null);
  loading = false;
  ready = signal(false);
  locais = signal<any[]>([]);

  readonly listaStatus = [
    { value: 'GUARDADO', label: 'Guardado' },
    { value: 'USO', label: 'Em Uso' },
    { value: 'DEFEITO', label: 'Com Defeito' },
    { value: 'MANUTENCAO', label: 'Manutenção' },
  ];

  form: FormGroup = this.fb.group({
    novoLocal: [null, Validators.required],
    novoStatus: ['GUARDADO', Validators.required],
    observacoes: [''],
  });

  ngOnInit() {
    const config = (this.dialogRef as any).config;
    const dados = config?.zData || (this.dialogRef as any).zData;

    if (dados) {
      this.data.set(dados);
      this.carregarLocais(dados.localAtualId);
    }
  }

  private carregarLocais(localAtualId: string) {
    this.localService
      .listAll()
      .pipe(
        map((res: any) =>
          res.content
            .filter((l: any) => l.uuid !== localAtualId)
            .map((item: any) => ({ uuid: item.uuid, exibicao: item.local || item.nome })),
        ),
        finalize(() => {
          this.ready.set(true);
          this.cdr.detectChanges();
        }),
      )
      .subscribe((dados) => this.locais.set(dados));
  }

  confirm() {
    if (this.form.invalid || !this.data()) return;
    this.loading = true;

    const payload: BodyMovimentacaoEmMassa = {
      patrimonioIDS: this.data()!.ids,
      novoLocal: this.form.value.novoLocal,
      novoStatus: this.form.value.novoStatus,
      observacoes: this.form.value.observacoes || 'Movimentação em massa',
    };

    this.patrimonioService.movimentarEmMassa(payload).subscribe({
      next: () => {
        this.data()?.onRefresh?.();
        this.dialogRef.close();
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-move-multiple-patrimonios-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      (click)="openDialog()"
      [disabled]="count() === 0"
      class="h-11 px-4 flex items-center gap-2.5 bg-brand-color text-white rounded-lg text-sm font-bold
             transition-all duration-200 hover:opacity-90 active:scale-95
             disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed"
    >
      <lucide-angular [img]="ArrowLeftRight" size="18"></lucide-angular>
      Mover Patrimônios
      @if (count() > 0) {
        <span
          class="flex items-center justify-center bg-white/20 text-white min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black animate-in zoom-in-75 duration-200"
        >
          {{ count() }}
        </span>
      }
    </button>
  `,
})
export class MoveMultiplePatrimoniosButtonComponent {
  private dialogService = inject(ZardDialogService);
  readonly ArrowLeftRight = ArrowLeftRight;

  items = input.required<any[]>();
  currentLocalId = input.required<string>();
  currentLocalName = input.required<string>();

  onSuccess = output<void>();

  readonly count = computed(() => this.items().filter((p) => p.selected).length);

  openDialog() {
    const selecionados = this.items().filter((p) => p.selected);
    if (selecionados.length === 0) return;

    const modalData: MoveMultipleData = {
      ids: selecionados.map((p) => p.uuid),
      nomeLocalAtual: this.currentLocalName(),
      localAtualId: this.currentLocalId(),
      onRefresh: () => this.onSuccess.emit(),
    };

    this.dialogService.create({
      zContent: MoveMultiplePatrimoniosDialogComponent,
      zHideFooter: true,
      zWidth: '550px',
      zData: modalData,
    });
  }
}

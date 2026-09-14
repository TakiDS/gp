import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';

import {
  LucideAngularModule,
  Edit2,
  Tag,
  Info,
  Calendar,
  DollarSign,
  Activity,
  FileText,
  User,
  CreditCard,
} from 'lucide-angular';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';

@Component({
  selector: 'app-edit-patrimonio-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectImports,
    ZardDialogModule,
    ZardDatePickerComponent,
    LucideAngularModule,
  ],
  styles: [
    `
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .anim-header {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-field-1 {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 60ms;
      }
      .anim-field-2 {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 120ms;
      }
      .anim-field-3 {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 180ms;
      }
      .anim-field-4 {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 240ms;
      }
      .anim-field-5 {
        animation: fade-up 0.45s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 300ms;
      }
      .anim-btns {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 360ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full h-full rounded-xl bg-background p-4 sm:p-8 text-foreground max-h-[90dvh] overflow-y-auto overscroll-contain custom-scrollbar"
    >
      <!-- Header -->
      <div class="mb-4 sm:mb-6 border-b border-border/50 pb-3 sm:pb-4 anim-header">
        <h2 class="text-xl sm:text-2xl font-bold flex items-center gap-2 text-foreground">
          <lucide-angular [img]="Edit2" size="22" class="text-primary shrink-0"></lucide-angular>
          Editar Patrimônio
        </h2>
        <p class="mt-1 text-xs sm:text-sm text-muted-foreground leading-relaxed">
          Altere as informações necessárias. Itens sem número de série podem ser deixados em branco.
        </p>
      </div>

      @if (!ready()) {
        <div class="space-y-4 sm:space-y-6 animate-pulse">
          <div class="h-12 w-full bg-muted rounded-lg"></div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div class="h-12 bg-muted rounded-lg"></div>
            <div class="h-12 bg-muted rounded-lg"></div>
          </div>
          <div class="h-24 w-full bg-muted rounded-lg"></div>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4 sm:space-y-6">
          <!-- Descrição -->
          <div formGroupName="patrimonio" class="flex flex-col gap-2 anim-field-1">
            <label
              class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
            >
              <lucide-angular [img]="Info" size="14"></lucide-angular> Descrição do Item
            </label>
            <input
              z-input
              formControlName="descricao"
              placeholder="Ex: Monitor Dell 24 pol"
              class="w-full h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md"
            />
          </div>

          <!-- Categoria + Estado -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 anim-field-2">
            <div formGroupName="patrimonio" class="flex flex-col gap-2">
              <label
                class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
              >
                <lucide-angular [img]="Tag" size="14"></lucide-angular> Categoria
              </label>
              <z-select
                zPlaceholder="Selecione..."
                formControlName="categoriaId"
                class="h-11 w-full"
              >
                @for (cat of categorias(); track cat.uuid) {
                  <z-select-item [zValue]="cat.uuid">{{ cat.nome }}</z-select-item>
                }
              </z-select>
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
              >
                <lucide-angular [img]="Activity" size="14"></lucide-angular> Estado Atual
              </label>
              <z-select zPlaceholder="Status..." formControlName="estado" class="h-11 w-full">
                <z-select-item zValue="GUARDADO">Guardado</z-select-item>
                <z-select-item zValue="USO">Em Uso</z-select-item>
                <z-select-item zValue="DEFEITO">Com Defeito</z-select-item>
                <z-select-item zValue="BAIXA">Baixa</z-select-item>
                <z-select-item zValue="EXTRAVIADO">Extraviado</z-select-item>
                <z-select-item zValue="DOACAO">Doação</z-select-item>
                <z-select-item zValue="MANUTENCAO">Manutenção</z-select-item>
              </z-select>
            </div>
          </div>

          <!-- Motivo isolado: Baixa, Defeito, Manutenção, Extraviado -->
          @if (requerMotivo() && !requerDoacao()) {
            <div
              class="p-3 sm:p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl animate-in fade-in slide-in-from-top-2"
            >
              <label
                class="text-[11px] uppercase font-bold text-amber-700 dark:text-amber-500 tracking-wider flex items-center gap-1.5 mb-2"
              >
                <lucide-angular [img]="FileText" size="14"></lucide-angular>
                Motivo / Descrição do Estado
              </label>
              <textarea
                z-input
                formControlName="motivoEstado"
                rows="3"
                placeholder="Descreva detalhadamente o que houve com o patrimônio (mínimo 20 caracteres)..."
                class="w-full bg-background border-border focus:ring-2 focus:ring-amber-500/20 transition-all resize-none rounded-md p-3 text-sm"
                [class.border-destructive]="
                  form.get('motivoEstado')?.invalid && form.get('motivoEstado')?.touched
                "
              ></textarea>
              <div class="flex items-start justify-between mt-1.5 gap-2">
                <div class="flex flex-col gap-0.5">
                  @if (form.get('motivoEstado')?.touched) {
                    @if (form.get('motivoEstado')?.hasError('required')) {
                      <span class="text-[11px] text-destructive flex items-center gap-1">
                        <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                        O motivo é obrigatório.
                      </span>
                    } @else if (form.get('motivoEstado')?.hasError('minlength')) {
                      <span
                        class="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1"
                      >
                        <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                        Mínimo de 20 caracteres para prosseguir.
                      </span>
                    } @else if (form.get('motivoEstado')?.hasError('maxlength')) {
                      <span class="text-[11px] text-destructive flex items-center gap-1">
                        <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                        Máximo de 500 caracteres atingido.
                      </span>
                    }
                  }
                </div>
                <span
                  class="text-[11px] shrink-0 font-mono transition-colors"
                  [class.text-muted-foreground]="
                    (form.get('motivoEstado')?.value?.length || 0) < 20
                  "
                  [class.text-green-600]="
                    (form.get('motivoEstado')?.value?.length || 0) >= 20 &&
                    (form.get('motivoEstado')?.value?.length || 0) <= 500
                  "
                  [class.text-destructive]="(form.get('motivoEstado')?.value?.length || 0) > 500"
                >
                  {{ form.get('motivoEstado')?.value?.length || 0 }}/500
                </span>
              </div>
            </div>
          }

          <!-- Bloco DOAÇÃO -->
          @if (requerDoacao()) {
            <div
              class="p-3 sm:p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-top-2"
            >
              <div class="border-b border-blue-500/10 pb-2">
                <h3
                  class="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-2"
                >
                  <lucide-angular [img]="User" size="16"></lucide-angular> Dados do Donatário
                </h3>
              </div>

              <div formGroupName="doacao" class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div class="flex flex-col gap-1.5">
                  <label class="text-[11px] uppercase font-bold text-blue-600/80 tracking-wider">
                    Nome Completo
                  </label>
                  <input
                    z-input
                    formControlName="nome"
                    placeholder="Ex: João da Silva"
                    class="w-full h-11 bg-background border-border"
                  />
                  @if (form.get('doacao.nome')?.touched && form.get('doacao.nome')?.invalid) {
                    <span
                      class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                    >
                      Campo obrigatório.
                    </span>
                  }
                </div>
                <div class="flex flex-col gap-1.5">
                  <label
                    class="text-[11px] uppercase font-bold text-blue-600/80 tracking-wider flex items-center gap-1"
                  >
                    <lucide-angular [img]="CreditCard" size="12"></lucide-angular> CPF
                  </label>
                  <input
                    z-input
                    formControlName="cpf"
                    (input)="onCpfChange($event)"
                    placeholder="000.000.000-00"
                    maxlength="14"
                    class="w-full h-11 bg-background border-border"
                  />
                  @if (form.get('doacao.cpf')?.touched && form.get('doacao.cpf')?.invalid) {
                    <span
                      class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                    >
                      Campo obrigatório.
                    </span>
                  }
                </div>
              </div>

              <div>
                <label
                  class="text-[11px] uppercase font-bold text-blue-700 dark:text-blue-400 tracking-wider flex items-center gap-1.5 mb-2"
                >
                  <lucide-angular [img]="FileText" size="14"></lucide-angular>
                  Observação / Motivo da Doação
                </label>
                <textarea
                  z-input
                  formControlName="motivoEstado"
                  rows="3"
                  placeholder="Descreva detalhadamente o que houve com o patrimônio (mínimo 20 caracteres)..."
                  class="w-full bg-background border-border focus:ring-2 focus:ring-blue-500/20 transition-all resize-none rounded-md p-3 text-sm"
                  [class.border-destructive]="
                    form.get('motivoEstado')?.invalid && form.get('motivoEstado')?.touched
                  "
                ></textarea>
                <div class="flex items-start justify-between mt-1.5 gap-2">
                  <div class="flex flex-col gap-0.5">
                    @if (form.get('motivoEstado')?.touched) {
                      @if (form.get('motivoEstado')?.hasError('required')) {
                        <span class="text-[11px] text-destructive flex items-center gap-1">
                          <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                          O motivo é obrigatório.
                        </span>
                      } @else if (form.get('motivoEstado')?.hasError('minlength')) {
                        <span
                          class="text-[11px] text-blue-600 dark:text-blue-400 flex items-center gap-1"
                        >
                          <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                          Mínimo de 20 caracteres para prosseguir.
                        </span>
                      } @else if (form.get('motivoEstado')?.hasError('maxlength')) {
                        <span class="text-[11px] text-destructive flex items-center gap-1">
                          <lucide-angular [img]="Info" size="11" class="shrink-0"></lucide-angular>
                          Máximo de 500 caracteres atingido.
                        </span>
                      }
                    }
                  </div>
                  <span
                    class="text-[11px] shrink-0 font-mono transition-colors"
                    [class.text-muted-foreground]="
                      (form.get('motivoEstado')?.value?.length || 0) < 20
                    "
                    [class.text-green-600]="
                      (form.get('motivoEstado')?.value?.length || 0) >= 20 &&
                      (form.get('motivoEstado')?.value?.length || 0) <= 500
                    "
                    [class.text-destructive]="(form.get('motivoEstado')?.value?.length || 0) > 500"
                  >
                    {{ form.get('motivoEstado')?.value?.length || 0 }}/500
                  </span>
                </div>
              </div>
            </div>
          }

          <!-- Nota Fiscal + Nº Série -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 anim-field-3">
            <div
              formGroupName="patrimonio"
              class="flex flex-col gap-2 w-full min-w-0 overflow-hidden"
            >
              <label
                class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
              >
                <lucide-angular [img]="FileText" size="14"></lucide-angular> Nota Fiscal
              </label>
              <z-select
                zPlaceholder="Vincular nota..."
                formControlName="notaFiscalId"
                class="h-12 w-full max-w-full"
              >
                @for (nota of notasFiscaisDisponiveis(); track nota.uuid) {
                  <z-select-item [zValue]="nota.uuid" class="truncate">
                    {{ nota.codigoNota }} — {{ nota.fornecedor }}
                    <span class="ml-1 text-[10px] opacity-60">
                      ({{ nota.status === 'SEM_PATRIMONIOS' ? 'Sem vínculo' : 'Parcial' }})
                    </span>
                  </z-select-item>
                }
              </z-select>
              @if (isAutomatico()) {
                <span class="text-[10px] text-amber-500 flex items-center gap-1 mt-1 leading-tight">
                  <lucide-angular [img]="Info" size="12" class="shrink-0"></lucide-angular>
                  Gerado automaticamente. Nota fiscal bloqueada.
                </span>
              }
            </div>

            <div class="flex flex-col gap-2">
              <label class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
                Número de Série
              </label>
              <input
                z-input
                formControlName="numSerie"
                (input)="onInputChange($event, 'numSerie')"
                placeholder="S/N ou digite o código"
                class="w-full h-12 uppercase bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md"
              />
            </div>
          </div>

          <!-- Data + Valor -->
          <div
            formGroupName="patrimonio"
            class="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5 pt-3 sm:pt-4 border-t border-border/50 anim-field-4"
          >
            <div class="flex flex-col gap-2">
              <label
                class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
              >
                <lucide-angular [img]="Calendar" size="14"></lucide-angular> Data de Aquisição
              </label>
              <z-date-picker
                formControlName="dataAquisicao"
                zFormat="dd/MM/yyyy"
                class="h-11 w-full"
              ></z-date-picker>
            </div>

            <div class="flex flex-col gap-2">
              <label
                class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-1.5"
              >
                <lucide-angular [img]="DollarSign" size="14"></lucide-angular> Valor de Aquisição
              </label>
              <input
                z-input
                type="text"
                formControlName="valorAquisicao"
                (input)="formatarMoeda($event)"
                placeholder="R$ 0,00"
                class="w-full h-11 bg-muted/30 border-border rounded-md"
              />
            </div>
          </div>

          <!-- Botões -->
          <div
            class="mt-4 sm:mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 sm:pt-6 border-t border-border/50 anim-btns"
          >
            <button
              type="button"
              (click)="close()"
              class="w-full sm:w-auto border bg-muted hover:bg-muted/80 border-border px-8 py-2.5 text-sm font-semibold text-muted-foreground rounded-lg transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              [disabled]="loading || form.invalid || form.pristine"
              class="w-full sm:w-auto min-w-[180px] bg-brand-color text-white px-8 py-2.5 rounded-lg font-semibold text-sm hover:brightness-110 transition-all shadow-md disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
            >
              @if (loading) {
                <div
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></div>
              }
              Atualizar Dados
            </button>
          </div>
        </form>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardEditPatrimonioDialogComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(ZardDialogRef);
  private patrimonioService = inject(PatrimonioService);
  private categoriaService = inject(CategoryService);
  private notaFiscalService = inject(NotaFiscalService);
  private modalData = inject(Z_MODAL_DATA);

  readonly Edit2 = Edit2;
  readonly Tag = Tag;
  readonly Info = Info;
  readonly Calendar = Calendar;
  readonly DollarSign = DollarSign;
  readonly Activity = Activity;
  readonly FileText = FileText;
  readonly User = User;
  readonly CreditCard = CreditCard;

  @Output() patrimonioAtualizado = new EventEmitter<any>();

  loading = false;
  ready = signal(false);
  categorias = signal<any[]>([]);
  notasFiscais = signal<any[]>([]);
  requerMotivo = signal(false);
  requerDoacao = signal(false);
  isAutomatico = signal(false);

  /**
   * UUID da nota já vinculada a este patrimônio (pode estar TOTALMENTE_VINCULADA
   * mas ainda precisa aparecer no select para manter o valor atual visível).
   */
  private notaAtualUuid = signal<string | null>(null);

  /**
   * Notas disponíveis para vínculo:
   * - SEM_PATRIMONIOS  → totalmente livres
   * - PARCIALMENTE_VINCULADA → ainda aceitam mais patrimônios
   * - A nota já vinculada a este patrimônio, independente do status
   */
  readonly notasFiscaisDisponiveis = signal<any[]>([]);

  form = this.fb.group({
    numSerie: ['', Validators.pattern(/^[a-zA-Z0-9\-\/]*$/)],
    estado: ['', Validators.required],
    motivoEstado: [''],
    doacao: this.fb.group({
      nome: [''],
      cpf: [''],
    }),
    patrimonio: this.fb.group({
      descricao: ['', Validators.required],
      dataAquisicao: [null as Date | null, Validators.required],
      valorAquisicao: ['', [Validators.required]],
      categoriaId: ['', Validators.required],
      notaFiscalId: [''],
    }),
  });

  constructor() {
    this.form
      .get('estado')
      ?.valueChanges.pipe(takeUntilDestroyed())
      .subscribe((estado) => {
        this.atualizarValidadores(estado);
      });
  }

  ngOnInit() {
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    this.carregarDadosIniciais();
  }

  ngOnDestroy() {
    document.body.style.overflow = '';
    document.body.style.touchAction = '';
  }

  private atualizarValidadores(estado: string | null | undefined) {
    const motivoCtrl = this.form.get('motivoEstado');
    const doacaoGrp = this.form.get('doacao');
    const nomeCtrl = doacaoGrp?.get('nome');
    const cpfCtrl = doacaoGrp?.get('cpf');

    motivoCtrl?.clearValidators();
    nomeCtrl?.clearValidators();
    cpfCtrl?.clearValidators();

    this.requerMotivo.set(false);
    this.requerDoacao.set(false);

    if (['BAIXA', 'DEFEITO', 'MANUTENCAO', 'EXTRAVIADO'].includes(estado || '')) {
      this.requerMotivo.set(true);
      motivoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500),
      ]);
    } else if (estado === 'DOACAO') {
      this.requerMotivo.set(true);
      this.requerDoacao.set(true);
      nomeCtrl?.setValidators([Validators.required]);
      cpfCtrl?.setValidators([Validators.required]);
      motivoCtrl?.setValidators([
        Validators.required,
        Validators.minLength(20),
        Validators.maxLength(500),
      ]);
    }

    motivoCtrl?.updateValueAndValidity();
    nomeCtrl?.updateValueAndValidity();
    cpfCtrl?.updateValueAndValidity();
  }

  carregarDadosIniciais() {
    const id = this.modalData?.id;
    if (!id) return;

    forkJoin({
      patrimonioData: this.patrimonioService.listInfoPatrimonio(id),
      categoriasList: this.categoriaService.listAll(),
      notasList: this.notaFiscalService.listAll(),
    }).subscribe({
      next: (res: any) => {
        const { patrimonioData, categoriasList, notasList } = res;
        this.categorias.set(categoriasList?.content || []);

        const todasNotas: any[] = notasList?.content || [];

        // UUID da nota já vinculada a este patrimônio
        const notaVinculadaUuid: string | null =
          patrimonioData?.patrimonioGeral?.notaFiscal?.uuid ?? null;
        this.notaAtualUuid.set(notaVinculadaUuid);

        // Filtra: só notas disponíveis (SEM_PATRIMONIOS ou PARCIALMENTE_VINCULADA)
        // + inclui a nota atual do patrimônio mesmo que TOTALMENTE_VINCULADA
        const disponiveis = todasNotas.filter(
          (n) =>
            n.status === 'SEM_PATRIMONIOS' ||
            n.status === 'PARCIALMENTE_VINCULADA' ||
            n.uuid === notaVinculadaUuid,
        );
        this.notasFiscaisDisponiveis.set(disponiveis);
        this.notasFiscais.set(todasNotas); // mantém referência completa se precisar

        const valorDb = patrimonioData?.patrimonioGeral?.valorAquisicao;
        const valorFormatado = this.aplicarMascaraMoeda(valorDb ? (valorDb * 100).toString() : '');

        const automatico = patrimonioData?.patrimonioGeral?.patrimonioAutomatico === true;
        this.isAutomatico.set(automatico);

        this.form.patchValue({
          numSerie: patrimonioData?.numSerie || '',
          estado: patrimonioData?.estado || '',
          motivoEstado: patrimonioData?.motivoEstado || '',
          patrimonio: {
            descricao: patrimonioData?.patrimonioGeral?.descricao || '',
            dataAquisicao: patrimonioData?.patrimonioGeral?.dataAquisicao
              ? new Date(patrimonioData.patrimonioGeral.dataAquisicao)
              : null,
            valorAquisicao: valorFormatado,
            categoriaId: patrimonioData?.patrimonioGeral?.categoria?.uuid || '',
            notaFiscalId: notaVinculadaUuid || '',
          },
        });

        const notaFiscalCtrl = this.form.get('patrimonio.notaFiscalId');
        if (automatico) {
          notaFiscalCtrl?.disable();
        } else {
          notaFiscalCtrl?.enable();
        }

        this.ready.set(true);
        this.cdr.detectChanges();
      },
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const id = this.modalData?.id;
      const formValue = this.form.getRawValue();

      const valorLimpo = (formValue.patrimonio?.valorAquisicao || '').replace(/\D/g, '');
      const valorParaBackend = valorLimpo ? (Number(valorLimpo) / 100).toFixed(2) : '0.00';

      let contexto: any = null;
      let motivoForaDoContexto: string | null = null;
      const estado = formValue.estado;

      if (estado === 'DOACAO') {
        contexto = {
          nomeDoado: formValue.doacao?.nome,
          cpfDoado: formValue.doacao?.cpf,
          observacao: formValue.motivoEstado,
        };
      } else if (estado === 'BAIXA' || estado === 'EXTRAVIADO') {
        contexto = { observacao: formValue.motivoEstado };
      } else {
        motivoForaDoContexto = formValue.motivoEstado || null;
      }

      const payload = {
        numSerie: formValue.numSerie || null,
        estado: estado,
        motivoEstado: motivoForaDoContexto,
        contexto: contexto,
        patrimonio: {
          descricao: formValue.patrimonio?.descricao,
          categoriaId: formValue.patrimonio?.categoriaId,
          notaFiscalId: formValue.patrimonio?.notaFiscalId || null,
          dataAquisicao: this.formatDate(formValue.patrimonio?.dataAquisicao),
          valorAquisicao: valorParaBackend,
        },
      };

      this.patrimonioService.updateEspecifico(id, payload).subscribe({
        next: (res) => {
          this.patrimonioAtualizado.emit(res);
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  onCpfChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let v = input.value.replace(/\D/g, '').slice(0, 11);
    if (v.length > 9) v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, '$1.$2.$3-$4');
    else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, '$1.$2.$3');
    else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, '$1.$2');
    this.form.get('doacao.cpf')?.setValue(v, { emitEvent: false });
  }

  onInputChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/[^a-zA-Z0-9\-\/]/g, '').toUpperCase();
    this.form.get(controlName)?.setValue(value, { emitEvent: false });
  }

  formatarMoeda(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.aplicarMascaraMoeda(input.value);
    this.form.get('patrimonio.valorAquisicao')?.setValue(formatted);
  }

  private aplicarMascaraMoeda(value: string): string {
    const rawValue = value.replace(/\D/g, '');
    if (!rawValue) return '';
    const numericValue = (Number(rawValue) / 100).toFixed(2);
    const partes = numericValue.split('.');
    partes[0] = partes[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `R$ ${partes[0]},${partes[1]}`;
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }

  close() {
    this.dialogRef.close();
  }
}

// ─────────────────────────────────────────────
// Botão
// ─────────────────────────────────────────────
@Component({
  selector: 'zard-edit-patrimonio-button',
  standalone: true,
  imports: [ZardButtonComponent, LucideAngularModule],
  template: `
    <z-button
      (click)="!disabled && openDialog()"
      [class.opacity-40]="disabled"
      [class.pointer-events-none]="disabled"
      class="w-full md:w-auto px-6 h-10 bg-brand-color hover:bg-brand-color/90 text-white transition-all shadow-sm flex items-center justify-center gap-2 rounded-lg"
    >
      <lucide-angular [img]="Edit2" size="18" strokeWidth="2"></lucide-angular>
      {{ disabled ? 'Edição Bloqueada' : 'Editar' }}
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardEditPatrimonioButtonComponent {
  readonly Edit2 = Edit2;
  private dialogService = inject(ZardDialogService);

  @Input({ required: true }) patrimonioId!: string;
  @Input() disabled = false;

  @Output() onAtualizado = new EventEmitter<void>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardEditPatrimonioDialogComponent,
      zHideFooter: true,
      zWidth: 'min(700px, calc(100vw - 32px))',
      zData: { id: this.patrimonioId },
    });

    const instance = dialogRef.componentInstance as ZardEditPatrimonioDialogComponent;
    if (instance) {
      instance.patrimonioAtualizado.subscribe(() => this.onAtualizado.emit());
    }
  }
}

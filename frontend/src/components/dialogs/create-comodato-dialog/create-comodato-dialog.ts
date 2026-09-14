import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  ElementRef,
  EventEmitter,
  HostListener,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';

import { LucideAngularModule, Package, X, Search, Plus, Check } from 'lucide-angular';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { DetentorService } from '@/shared/core/services/detentor/detentor-service';
import { ComodatoService } from '@/shared/core/services/comodato/comodato-service';

@Component({
  selector: 'app-comodato-dialog',
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
  template: `
    <div
      class="w-full h-full rounded-xl bg-background p-5 md:p-8 text-foreground transition-colors duration-300 overflow-y-auto max-h-[90vh]"
    >
      <div class="mb-6 border-b border-border/50 pb-4">
        <h2 class="text-xl md:text-2xl font-bold tracking-tight">Novo Comodato</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Vincule patrimônios a um detentor para gerar o termo.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">
        <!-- ── Multi-select de patrimônios ── -->
        <div class="flex flex-col gap-2">
          <label
            class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider flex items-center gap-2"
          >
            <lucide-angular [img]="Package" size="14"></lucide-angular>
            Buscar Patrimônios
          </label>

          @if (ready()) {
            <!-- Wrapper com referência para detectar clique fora -->
            <div class="relative w-full" #dropdownWrapper>
              <!-- Input de busca -->
              <div class="relative group">
                <lucide-angular
                  [img]="Search"
                  size="16"
                  class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none"
                ></lucide-angular>
                <input
                  type="text"
                  z-input
                  [formControl]="searchControl"
                  (focus)="dropdownOpen.set(true)"
                  placeholder="Digite o número ou descrição..."
                  class="w-full h-12 pl-10 pr-4 bg-background border border-input rounded-md text-sm focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all placeholder:text-muted-foreground/60 shadow-sm"
                  autocomplete="off"
                />
              </div>

              <!-- Dropdown -->
              @if (dropdownOpen()) {
                <div
                  class="dropdown-panel absolute z-50 w-full mt-2 bg-card border border-border rounded-xl shadow-xl flex flex-col animate-in fade-in slide-in-from-top-2 duration-200"
                  style="max-height: 280px;"
                >
                  <!-- Lista -->
                  <div class="overflow-y-auto flex-1 p-1" style="max-height: 220px;">
                    @if (searchResults().length > 0) {
                      @for (item of searchResults(); track item.uuid) {
                        <button
                          type="button"
                          (click)="togglePatrimonio(item)"
                          class="w-full text-left px-3 py-2.5 hover:bg-primary/5 rounded-lg text-sm transition-colors flex items-center gap-3 group mb-0.5 last:mb-0"
                        >
                          <!-- Checkbox customizado -->
                          <div
                            class="w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all duration-150"
                            [class.bg-primary]="isSelected(item.uuid)"
                            [class.border-primary]="isSelected(item.uuid)"
                            [class.border-muted-foreground]="!isSelected(item.uuid)"
                          >
                            @if (isSelected(item.uuid)) {
                              <lucide-angular
                                [img]="Check"
                                size="10"
                                class="text-primary-foreground"
                              ></lucide-angular>
                            }
                          </div>
                          <!-- Info -->
                          <div class="flex flex-col min-w-0 flex-1">
                            <span
                              class="font-bold text-foreground group-hover:text-primary transition-colors"
                              >{{ item.numPatrimonio }}</span
                            >
                            <span class="text-muted-foreground text-xs truncate">
                              {{ item.patrimonioGeral?.descricao }}
                            </span>
                          </div>
                        </button>
                      }
                    } @else {
                      <p class="py-6 text-center text-sm text-muted-foreground">
                        Nenhum patrimônio disponível.
                      </p>
                    }
                  </div>

                  <!-- Rodapé fixo -->
                  <div
                    class="border-t border-border px-3 py-2.5 flex items-center justify-between gap-2 bg-muted/30 rounded-b-xl flex-shrink-0"
                  >
                    <span class="text-[11px] text-muted-foreground font-medium">
                      @if (selectedValues().length > 0) {
                        {{ selectedValues().length }} selecionado{{
                          selectedValues().length > 1 ? 's' : ''
                        }}
                      } @else {
                        Nenhum selecionado
                      }
                    </span>
                    <button
                      type="button"
                      (click)="fecharDropdown()"
                      class="px-3 py-1 text-[11px] font-bold bg-brand-color text-white rounded-lg hover:bg-brand-color/80 transition-opacity"
                    >
                      Confirmar
                    </button>
                  </div>
                </div>
              }
            </div>
          } @else {
            <div class="h-10 w-full bg-muted/50 rounded-xl animate-pulse"></div>
          }

          <!-- Chips dos itens selecionados -->
          @if (patrimoniosSelecionados().length > 0) {
            <div class="flex flex-col gap-3 mt-2">
              <span class="text-[10px] uppercase font-bold text-primary tracking-wider">
                Itens Selecionados ({{ patrimoniosSelecionados().length }})
              </span>

              <div class="grid grid-cols-1 gap-2">
                @for (p of patrimoniosSelecionados(); track p.uuid) {
                  <div
                    class="group relative flex items-center justify-between p-3 bg-muted/30 border border-border/50 rounded-xl hover:border-primary/30 transition-all"
                  >
                    <div class="flex flex-col min-w-0 pr-8">
                      <div class="flex items-center gap-2">
                        <span
                          class="text-xs font-bold bg-background border border-border px-2 py-0.5 rounded text-foreground shadow-sm"
                        >
                          {{ p.numPatrimonio }}
                        </span>
                      </div>
                      <span
                        class="text-xs text-muted-foreground mt-1.5 leading-relaxed line-clamp-2"
                      >
                        {{ p.patrimonioGeral?.descricao }}
                      </span>
                    </div>

                    <button
                      type="button"
                      (click)="removerPatrimonio(p.uuid)"
                      class="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all opacity-100 md:opacity-0 md:group-hover:opacity-100"
                      title="Remover item"
                    >
                      <lucide-angular [img]="X" size="16"></lucide-angular>
                    </button>
                  </div>
                }
              </div>
            </div>
          }

          @if (form.get('patrimonioIds')?.touched && form.get('patrimonioIds')?.invalid) {
            <span class="text-[11px] text-destructive mt-1 font-semibold flex items-center gap-1">
              <div class="w-1 h-1 rounded-full bg-destructive"></div>
              Selecione pelo menos um patrimônio.
            </span>
          }
        </div>

        <!-- ── Detentor ── -->
        <div class="flex flex-col gap-2">
          <label class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
            Detentor Responsável
          </label>
          @if (ready()) {
            <z-select zPlaceholder="Selecione o titular" formControlName="titularId" class="w-full">
              @for (item of detentores(); track item.uuid) {
                <z-select-item [zValue]="item.uuid">
                  <div class="truncate max-w-full font-medium">{{ item.nome }}</div>
                </z-select-item>
              }
            </z-select>
          } @else {
            <div class="h-10 w-full bg-muted/50 rounded-xl animate-pulse"></div>
          }
        </div>

        <!-- ── Datas ── -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-2">
            <label class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              Data de Início
            </label>
            <z-date-picker formControlName="dataInicio" zFormat="dd/MM/yyyy"></z-date-picker>
          </div>
          <div class="flex flex-col gap-2">
            <label class="text-[11px] uppercase font-bold text-muted-foreground tracking-wider">
              Devolução Prevista
            </label>
            <z-date-picker formControlName="dataFimEsperado" zFormat="dd/MM/yyyy"></z-date-picker>
          </div>
        </div>

        <!-- ── Botões ── -->
        <div
          class="mt-8 pt-6 border-t border-border/50 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end"
        >
          <button
            type="button"
            (click)="close()"
            class="w-full sm:w-auto px-6 py-2 h-10 text-xs font-bold text-muted-foreground bg-muted/50 hover:bg-muted hover:text-foreground rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button
            type="submit"
            class="w-full sm:w-auto bg-brand-color text-white px-8 py-2 h-10 rounded-xl font-bold text-xs hover:brightness-110 active:scale-95 transition-all shadow-md shadow-brand-color/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loading || form.invalid"
          >
            @if (loading) {
              <div
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></div>
            }
            Gerar Comodato
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateComodatoDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(ZardDialogRef);
  private elRef = inject(ElementRef);
  private comodatoService = inject(ComodatoService);
  private patrimonioService = inject(PatrimonioService);
  private detentorService = inject(DetentorService);

  readonly X = X;
  readonly Package = Package;
  readonly Search = Search;
  readonly Check = Check;

  @Output() comodatoCriado = new EventEmitter<any>();

  loading = false;
  ready = signal(false);

  readonly patrimonios = signal<any[]>([]);
  readonly detentores = signal<any[]>([]);
  readonly selectedValues = signal<string[]>([]);

  searchControl = new FormControl('');
  dropdownOpen = signal(false);
  searchTerm = signal('');

  form = this.fb.group({
    patrimonioIds: [[] as string[], [Validators.required, Validators.minLength(1)]],
    titularId: [null, Validators.required],
    dataInicio: [new Date(), Validators.required],
    dataFimEsperado: [null, Validators.required],
  });

  readonly patrimoniosSelecionados = computed(() => {
    const ids = this.selectedValues();
    if (!ids.length) return [];
    return this.patrimonios().filter((p) => ids.includes(p.uuid));
  });

  readonly searchResults = computed(() => {
    const term = this.searchTerm();
    const all = this.patrimonios();
    if (!term) return all;
    return all.filter((p) => {
      const num = p.numPatrimonio?.toLowerCase() || '';
      const desc = p.patrimonioGeral?.descricao?.toLowerCase() || '';
      return num.includes(term) || desc.includes(term);
    });
  });

  /** Fecha o dropdown ao clicar fora do componente */
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.fecharDropdown();
    }
  }

  ngOnInit() {
    this.carregarDados();
    this.searchControl.valueChanges.subscribe((val) => {
      this.searchTerm.set(val?.toLowerCase() || '');
    });
  }

  carregarDados() {
    this.ready.set(false);
    forkJoin({
      pat: this.patrimonioService.listAllAvailable(),
      det: this.detentorService.listAll(),
    }).subscribe({
      next: ({ pat, det }) => {
        const listaPatrimonios = (pat as any)?.content || [];
        const listaDetentores = ((det as any)?.content || []).filter(
          (d: any) => d.statusPerfil !== 'INATIVO',
        );
        this.patrimonios.set(listaPatrimonios);
        this.detentores.set(listaDetentores);
        this.ready.set(true);
        this.cdr.detectChanges();
      },
      error: () => {
        this.ready.set(true);
      },
    });
  }

  /** Toggle sem fechar o dropdown */
  togglePatrimonio(item: any) {
    const current = this.selectedValues();
    const novosIds = current.includes(item.uuid)
      ? current.filter((id) => id !== item.uuid)
      : [...current, item.uuid];

    this.selectedValues.set(novosIds);
    this.form.get('patrimonioIds')?.setValue(novosIds);
    this.form.get('patrimonioIds')?.markAsTouched();
    this.cdr.markForCheck();
  }

  isSelected(uuid: string): boolean {
    return this.selectedValues().includes(uuid);
  }

  fecharDropdown() {
    this.dropdownOpen.set(false);
    this.searchControl.setValue('');
    this.cdr.markForCheck();
  }

  removerPatrimonio(uuid: string) {
    const novosIds = this.selectedValues().filter((id) => id !== uuid);
    this.selectedValues.set(novosIds);
    this.form.get('patrimonioIds')?.setValue(novosIds);
    this.cdr.markForCheck();
  }

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      const val = this.form.getRawValue();

      const payload = {
        dataInicio: this.formatDate(val.dataInicio),
        dataFimEsperado: this.formatDate(val.dataFimEsperado),
        patrimonioIds: this.selectedValues(),
        titularId: val.titularId,
      };

      this.comodatoService.create(payload).subscribe({
        next: (res) => {
          this.comodatoCriado.emit(res);
          this.dialogRef.close(true);
        },
        error: () => {
          this.loading = false;
          this.cdr.detectChanges();
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
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
  selector: 'zard-create-comodato-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="h-11 bg-[#212D6B] hover:bg-[#2b3878] text-white transition-all shadow-sm flex items-center gap-2 px-4 rounded-lg cursor-pointer"
    >
      <lucide-angular [img]="Plus" size="18" strokeWidth="2.5"></lucide-angular>
      Gerar Comodato
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateComodatoButtonComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  @Output() onComodatoCriado = new EventEmitter<any>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardCreateComodatoDialogComponent,
      zHideFooter: true,
      zWidth: '700px',
    });

    const instance = dialogRef.componentInstance as ZardCreateComodatoDialogComponent;

    if (instance) {
      instance.comodatoCriado.subscribe((novoComodato) => {
        this.onComodatoCriado.emit(novoComodato);
      });
    }
  }
}

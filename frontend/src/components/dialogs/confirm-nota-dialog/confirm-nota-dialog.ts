import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  inject,
  signal,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, FileCheck, X } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { LocalService } from '@/shared/core/services/local/local.service';
import { forkJoin } from 'rxjs';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';

@Component({
  selector: 'app-confirm-nota-dialog',
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
      .anim-field-1 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 120ms;
      }
      .anim-field-2 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 190ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 260ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-5 py-5 sm:px-7 sm:py-7 anim-scale-in"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-5 pb-4 border-b border-border anim-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <lucide-angular [img]="FileCheck" size="17" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold tracking-tight">Finalizar Importação</h2>
            <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Defina a categoria e o local para os itens desta Nota Fiscal.
            </p>
          </div>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="confirm()" class="space-y-4">
        <!-- Categoria -->
        <div class="flex flex-col gap-1.5 anim-field-1">
          <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
            Categoria
          </label>
          @if (ready()) {
            <z-select zPlaceholder="Selecione a categoria" formControlName="categoria">
              @for (item of categories(); track item.uuid) {
                <z-select-item [zValue]="item.uuid">{{ item.nome }}</z-select-item>
              }
            </z-select>
          } @else {
            <div class="h-11 w-full bg-muted/50 rounded-lg animate-pulse"></div>
          }
          @if (form.get('categoria')?.touched && form.get('categoria')?.invalid) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200">
              Campo obrigatório.
            </span>
          }
        </div>

        <!-- Local -->
        <div class="flex flex-col gap-1.5 anim-field-2">
          <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
            Local
          </label>
          @if (ready()) {
            <z-select zPlaceholder="Selecione o local" formControlName="local">
              @for (item of locais(); track item.uuid) {
                <z-select-item [zValue]="item.uuid">{{ item.local }}</z-select-item>
              }
            </z-select>
          } @else {
            <div class="h-11 w-full bg-muted/50 rounded-lg animate-pulse"></div>
          }
          @if (form.get('local')?.touched && form.get('local')?.invalid) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200">
              Campo obrigatório.
            </span>
          }
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
            class="w-full sm:w-auto h-11 min-w-[160px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Processando...
            } @else {
              Confirmar e Criar
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmNotaDialogComponent implements OnInit {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);
  private categoryService = inject(CategoryService);
  private localService = inject(LocalService);
  private cdr = inject(ChangeDetectorRef);

  readonly FileCheck = FileCheck;
  readonly X = X;

  @Output() onConfirmar = new EventEmitter<{ categoria: string; local: string }>();

  loading = false;
  ready = signal(false);

  readonly categories = signal<any[]>([]);
  readonly locais = signal<any[]>([]);

  form: FormGroup = this.fb.group({
    categoria: ['', Validators.required],
    local: ['', Validators.required],
  });

  ngOnInit() {
    this.carregarDados();
  }

  carregarDados() {
    this.ready.set(false);
    forkJoin({
      cat: this.categoryService.listAll(),
      loc: this.localService.listAll(),
    }).subscribe({
      next: ({ cat, loc }) => {
        this.categories.set((cat as any)?.content || []);
        this.locais.set((loc as any)?.content || []);
        this.ready.set(true);
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar dados:', err);
        this.ready.set(true);
        this.cdr.detectChanges();
      },
    });
  }

  confirm() {
    if (this.form.valid) {
      this.loading = true;
      this.onConfirmar.emit(this.form.value);
      this.dialogRef.close();
    } else {
      this.form.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}

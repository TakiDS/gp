import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { DetentorService } from '@/shared/core/services/detentor/detentor-service';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { LucideAngularModule, Plus, X, UserPlus } from 'lucide-angular';

@Component({
  selector: 'app-detentor-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
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
        animation-delay: 180ms;
      }
      .anim-field-3 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 240ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 300ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full max-w-3xl mx-auto rounded-2xl bg-background text-foreground px-6 py-6 sm:px-8 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-6 anim-header">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <lucide-angular [img]="UserPlus" size="18" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight">Novo Detentor</h2>
            <p class="text-sm text-muted-foreground mt-0.5 max-w-sm">
              Cadastre as informações do responsável pelo patrimônio.
            </p>
          </div>
        </div>
      </div>

      <div class="h-px bg-border mb-6 anim-header"></div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="flex flex-col gap-1.5 anim-field-1">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            for="nome"
          >
            Nome Completo
          </label>
          <input
            formControlName="nome"
            class="h-11 px-4 w-full rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            [class.border-destructive]="form.get('nome')?.touched && form.get('nome')?.invalid"
            id="nome"
            z-input
            placeholder="Ex: Maria Gabriela"
          />
          @if (form.get('nome')?.touched && form.get('nome')?.invalid) {
            <span class="text-destructive text-xs font-medium animate-in fade-in duration-200"
              >Nome é obrigatório</span
            >
          }
        </div>

        <div class="flex flex-col gap-1.5 anim-field-2">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            for="email"
          >
            E-mail Institucional
          </label>
          <input
            formControlName="email"
            type="email"
            class="h-11 px-4 w-full rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            [class.border-destructive]="form.get('email')?.touched && form.get('email')?.invalid"
            id="email"
            z-input
            placeholder="Ex: maria.gabriela@gmail.com"
          />
          @if (form.get('email')?.touched && form.get('email')?.invalid) {
            <span class="text-destructive text-xs font-medium animate-in fade-in duration-200"
              >E-mail inválido</span
            >
          }
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 anim-field-3">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
              for="cpf"
            >
              CPF
            </label>
            <input
              formControlName="cpf"
              class="h-11 px-4 w-full rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              id="cpf"
              z-input
              placeholder="000.000.000-00"
              maxlength="14"
              (input)="formatarCPF($event)"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground">
              Tipo de Perfil
            </label>
            <z-select zPlaceholder="Selecione o perfil" formControlName="tipoPerfil" class="w-full">
              @for (opcao of perfilOptions; track opcao.value) {
                <z-select-item [zValue]="opcao.value">{{ opcao.label }}</z-select-item>
              }
            </z-select>
            @if (form.get('tipoPerfil')?.touched && form.get('tipoPerfil')?.invalid) {
              <span class="text-destructive text-xs font-medium animate-in fade-in duration-200"
                >Selecione um perfil</span
              >
            }
          </div>
        </div>

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
            class="w-full sm:w-auto h-11 min-w-[160px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Salvando...
            } @else {
              Cadastrar
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetentorDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef);
  private detentorService = inject(DetentorService);

  readonly UserPlus = UserPlus;
  readonly X = X;

  @Output() detentorCriado = new EventEmitter<any>();

  loading = false;

  perfilOptions = [
    { value: 'MONITOR', label: 'Monitor' },
    { value: 'MESTRANDO', label: 'Mestrando' },
    { value: 'SERVIDORINTERNO', label: 'Servidor Interno' },
    { value: 'SERVIDOREXTERNO', label: 'Servidor Externo' },
  ];

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    cpf: ['', [Validators.required, Validators.minLength(11)]],
    tipoPerfil: [null, Validators.required],
  });

  onSubmit() {
    if (this.form.valid) {
      this.loading = true;
      this.detentorService.create(this.form.value).subscribe({
        next: (res) => {
          this.detentorCriado.emit(res);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Erro ao criar detentor:', err);
          this.loading = false;
        },
      });
    } else {
      this.form.markAllAsTouched();
    }
  }

  formatarCPF(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    if (value.length > 9) value = value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2}).*/, '$1.$2.$3-$4');
    else if (value.length > 6) value = value.replace(/^(\d{3})(\d{3})(\d{0,3}).*/, '$1.$2.$3');
    else if (value.length > 3) value = value.replace(/^(\d{3})(\d{0,3}).*/, '$1.$2');
    this.form.get('cpf')?.setValue(value);
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zard-create-detentor-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="h-11 bg-brand-color hover:bg-brand-color/80 text-white transition-all shadow-sm flex items-center gap-2 px-4 rounded-lg"
    >
      <lucide-angular [img]="Plus" size="20" strokeWidth="2"></lucide-angular>
      Novo Detentor
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateDetentorButtonComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  @Output() onDetentorCriado = new EventEmitter<any>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: DetentorDialogComponent,
      zHideFooter: true,
      zWidth: '640px',
    });

    const instance = dialogRef.componentInstance as DetentorDialogComponent;

    if (instance) {
      instance.detentorCriado.subscribe((novoDetentor) => {
        this.onDetentorCriado.emit(novoDetentor);
      });
    }
  }
}

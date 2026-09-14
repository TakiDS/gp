import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, UserPlus, X } from 'lucide-angular';

@Component({
  selector: 'app-create-user-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardInputDirective, LucideAngularModule],
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
        animation-delay: 130ms;
      }
      .anim-field-2 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 200ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 270ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-6 py-6 sm:px-8 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-6 anim-header">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <lucide-angular [img]="UserPlus" size="18" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight">Novo Usuário</h2>
            <p class="text-sm text-muted-foreground mt-0.5">
              O novo usuário será criado como Gerenciador.
            </p>
          </div>
        </div>
      </div>

      <div class="h-px bg-border mb-6 anim-header"></div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="flex flex-col gap-1.5 anim-field-1">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            for="nome"
          >
            Nome Completo
          </label>
          <input
            id="nome"
            formControlName="nome"
            class="h-11 px-4 w-full rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            [class.border-destructive]="
              userForm.get('nome')?.touched && userForm.get('nome')?.invalid
            "
            z-input
            placeholder="Ex: Paulo Sampaio"
          />
          @if (userForm.get('nome')?.touched && userForm.get('nome')?.invalid) {
            <span class="text-destructive text-xs font-medium animate-in fade-in duration-200"
              >Nome é obrigatório (mín. 3 caracteres)</span
            >
          }
        </div>

        <div class="flex flex-col gap-1.5 anim-field-2">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            for="email"
          >
            E-mail Corporativo
          </label>
          <input
            id="email"
            formControlName="email"
            type="email"
            class="h-11 px-4 w-full rounded-lg border border-input bg-muted/30 text-foreground placeholder:text-muted-foreground/50 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
            [class.border-destructive]="
              userForm.get('email')?.touched && userForm.get('email')?.invalid
            "
            z-input
            placeholder="Ex: paulo@empresa.com.br"
          />
          @if (userForm.get('email')?.touched && userForm.get('email')?.invalid) {
            <span class="text-destructive text-xs font-medium animate-in fade-in duration-200"
              >E-mail inválido</span
            >
          }
        </div>

        <div
          class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border anim-actions"
        >
          <button
            type="button"
            (click)="close()"
            [disabled]="loading"
            class="w-full sm:w-auto h-11 px-6 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            [disabled]="loading || userForm.invalid"
            class="w-full sm:w-auto h-11 min-w-[140px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Enviando convite...
            } @else {
              Convidar
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateUserDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef);

  readonly UserPlus = UserPlus;
  readonly X = X;

  @Output() userCreated = new EventEmitter<any>();
  loading = false;

  userForm: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER'],
  });

  onSubmit() {
    if (this.userForm.invalid) return;
    this.loading = true;
    this.userCreated.emit(this.userForm.value);
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }
}

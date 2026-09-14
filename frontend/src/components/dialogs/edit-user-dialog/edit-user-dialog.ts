import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Pencil, X } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

export interface EditUserDialogData {
  uuid?: string;
  nomeAtual?: string;
  onSuccess?: (payload: { nome: string }) => void;
}

@Component({
  selector: 'app-edit-user-dialog',
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
      .anim-field {
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
      class="w-full max-w-md mx-auto rounded-2xl bg-background text-foreground px-6 py-6 sm:px-7 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-6 pb-5 border-b border-border anim-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <lucide-angular [img]="Pencil" size="17" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-lg font-bold tracking-tight">Editar Usuário</h2>
            <p class="text-sm text-muted-foreground mt-0.5">Altere o nome do usuário.</p>
          </div>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="confirm()" class="space-y-5">
        <div class="flex flex-col gap-1.5 anim-field">
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
            [class.border-destructive]="form.get('nome')?.touched && form.get('nome')?.invalid"
            z-input
            placeholder="Nome completo do usuário"
          />
          @if (form.get('nome')?.touched && form.get('nome')?.errors?.['minlength']) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200">
              O nome deve ter pelo menos 3 caracteres.
            </span>
          }
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
            [disabled]="form.invalid || saving()"
            class="w-full sm:w-auto h-11 min-w-[150px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (saving()) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Salvando...
            } @else {
              Salvar Alterações
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditUserDialogComponent implements OnInit {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);

  readonly Pencil = Pencil;
  readonly X = X;

  data = signal<EditUserDialogData | null>(null);
  saving = signal(false);

  form: FormGroup = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    const ref = this.dialogRef as any;
    const dados: EditUserDialogData = ref.zData || ref.data || ref.config?.zData;

    if (dados) {
      this.data.set(dados);
      this.form.patchValue({ nome: dados.nomeAtual ?? '' });
    }
  }

  confirm(): void {
    if (this.form.invalid) return;
    this.saving.set(true);

    const payload = { nome: String(this.form.value.nome ?? '') };

    const cb = this.data()?.onSuccess;
    if (cb) cb(payload);

    this.dialogRef.close(payload);
  }

  close(): void {
    this.dialogRef.close();
  }
}

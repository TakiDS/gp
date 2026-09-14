import {
  Component,
  inject,
  signal,
  ChangeDetectorRef,
  OnInit,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import { LucideAngularModule, Pencil, X } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { LocalService } from '@/shared/core/services/local/local.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

export interface EditLocalData {
  uuid: string;
  nomeAtual: string;
  onSuccess?: (novoNome: string) => void;
}

@Component({
  selector: 'app-edit-local-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardInputDirective, LucideAngularModule],
  styles: [
    `
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
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
      .anim-scale-in {
        animation: scale-in 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-fade-up {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .d-100 {
        animation-delay: 100ms;
      }
      .d-150 {
        animation-delay: 150ms;
      }
      .d-250 {
        animation-delay: 250ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-6 py-6 sm:px-8 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-3 anim-fade-up">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <lucide-angular [img]="Pencil" size="18" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight">Editar Local</h2>
            <p class="text-sm text-muted-foreground mt-0.5">Atualize o nome do local abaixo.</p>
          </div>
        </div>
        <button
          type="button"
          (click)="close()"
          class="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all cursor-pointer"
        ></button>
      </div>

      <div class="h-px bg-border mb-6 anim-fade-up d-100"></div>

      <form [formGroup]="form" (ngSubmit)="confirm()" class="space-y-5">
        <div class="flex flex-col gap-1.5 anim-fade-up d-150">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground"
            for="local"
          >
            Nome do Local
          </label>
          <input
            formControlName="local"
            class="h-11 w-full px-4 bg-muted/30 border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
            id="local"
            z-input
            placeholder="Ex: Laboratório Principal"
            [class.border-destructive]="form.get('local')?.invalid && form.get('local')?.touched"
          />
          @if (form.get('local')?.invalid && form.get('local')?.touched) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200">
              O nome é obrigatório (mínimo 3 caracteres).
            </span>
          }
        </div>

        <div
          class="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-border anim-fade-up d-250"
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
export class EditLocalDialogComponent implements OnInit {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);
  private localService = inject(LocalService);
  private cdr = inject(ChangeDetectorRef);

  readonly Pencil = Pencil;
  readonly X = X;

  data = signal<EditLocalData | null>(null);
  loading = false;

  form: FormGroup = this.fb.group({
    local: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit() {
    const ref = this.dialogRef as any;
    const dados = ref.zData || ref.data || ref.config?.zData;

    if (dados) {
      this.data.set(dados);
      this.form.patchValue({ local: dados.nomeAtual });
    }
  }

  confirm() {
    if (this.form.invalid || !this.data()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const novoNome = this.form.value.local;
    const uuid = this.data()!.uuid;

    this.localService
      .update(uuid, { local: novoNome })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          if (this.data()?.onSuccess) {
            this.data()!.onSuccess!(novoNome);
          }
          this.dialogRef.close();
        },
        error: (err) => console.error('Erro ao editar local:', err),
      });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-edit-local-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      (click)="openDialog()"
      class="px-4 py-1 h-11 bg-secondary/50 text-foreground border border-border rounded-md text-sm font-medium hover:bg-secondary hover:border-foreground/20 transition shadow-sm cursor-pointer flex items-center gap-2"
    >
      <lucide-angular [img]="Pencil" size="14"></lucide-angular>
      Editar Local
    </button>
  `,
})
export class EditLocalButtonComponent {
  private dialogService = inject(ZardDialogService);
  readonly Pencil = Pencil;

  @Input({ required: true }) uuid!: string;
  @Input({ required: true }) currentName!: string;

  @Output() onNameUpdated = new EventEmitter<string>();

  openDialog() {
    if (!this.uuid) return;

    const modalData: EditLocalData = {
      uuid: this.uuid,
      nomeAtual: this.currentName,
      onSuccess: (novoNome) => {
        this.onNameUpdated.emit(novoNome);
      },
    };

    this.dialogService.create({
      zContent: EditLocalDialogComponent,
      zHideFooter: true,
      zWidth: '600px',
      zData: modalData,
    });
  }
}

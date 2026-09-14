import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { LocalService } from '@/shared/core/services/local/local.service';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'zard-local-dialog-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardInputDirective],
  template: `
    <div class="w-full rounded-xl bg-background text-foreground p-5 sm:px-8 sm:py-6">
      <div class="mb-5 sm:mb-6">
        <h2 class="text-xl sm:text-2xl font-bold">Novo Local</h2>
        <p class="mt-1 mb-2 max-w-full text-sm sm:text-base leading-relaxed text-foreground/70">
          Preencha o dado abaixo para registrar no sistema.
        </p>
      </div>

      <form [formGroup]="localForm" (ngSubmit)="onSubmit()" class="space-y-4">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] uppercase font-semibold" for="local">Nome do Local</label>
          <input
            formControlName="local"
            class="h-12 p-3 w-full"
            id="local"
            z-input
            placeholder="Ex: Laboratório"
          />
        </div>

        @if (localForm.get('local')?.touched && localForm.get('local')?.errors?.['pattern']) {
          <span class="text-sm text-red-500 mt-1 block">
            Caracteres especiais ou emojis não são permitidos.
          </span>
        }

        <div class="mt-2 flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 justify-end pt-4 sm:pt-6">
          <button
            type="button"
            (click)="close()"
            class="w-full sm:w-auto rounded-lg bg-muted text-muted-foreground px-8 py-2.5 text-sm font-semibold transition hover:bg-muted/80 cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="w-full sm:w-48 rounded-md bg-brand-color py-2.5 cursor-pointer text-sm font-semibold text-white transition hover:bg-brand-color/90 disabled:opacity-50 disabled:cursor-not-allowed"
            [disabled]="loading || localForm.get('local')?.invalid"
          >
            Criar local
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardLocalDialogBasicInputComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef);
  private localService = inject(LocalService);

  @Output() localCriado = new EventEmitter<any>();

  loading = false;

  localForm: FormGroup = this.fb.group({
    local: [
      '',
      [
        Validators.required,
        Validators.minLength(3),
        Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s.\-\/]+$/),
      ],
    ],
  });

  onSubmit() {
    if (this.localForm.valid) {
      this.loading = true;
      this.localService.create(this.localForm.value).subscribe({
        next: (res) => {
          this.localCriado.emit(res);
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('4. Erro no Backend:', err);
          this.loading = false;
        },
      });
    } else {
      this.localForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zard-create-local-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="w-full sm:w-auto h-11 bg-brand-color hover:bg-brand-color/80 text-white transition-colors"
    >
      <lucide-angular
        [img]="Plus"
        size="20"
        strokeWidth="2"
        class="my-icon rounded-md"
      ></lucide-angular>
      Criar Local
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateLocalButtonComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);
  @Output() onLocalCriado = new EventEmitter<any>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardLocalDialogBasicInputComponent,
      zHideFooter: true,
      zWidth: 'min(calc(100vw - 2rem), 640px)', 
    });

    const instance = dialogRef.componentInstance as ZardLocalDialogBasicInputComponent;

    if (instance) {
      instance.localCriado.subscribe((novoLocal) => {
        this.onLocalCriado.emit(novoLocal);
      });
    }
  }
}
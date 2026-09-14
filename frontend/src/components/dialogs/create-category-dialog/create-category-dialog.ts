import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  type AfterViewInit,
} from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';

import { LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'zard-category-dialog-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardInputDirective],
  template: `
    <div
      class="w-full max-w-2xl mx-auto rounded-xl bg-background text-foreground p-5 sm:p-8 shadow-sm"
    >
      <div class="mb-6">
        <h2 class="text-xl sm:text-2xl font-bold">Nova Categoria</h2>
        <p class="mt-1 text-sm sm:text-base leading-relaxed text-muted-foreground max-w-md">
          Preencha os dados abaixo para registrar no sistema.
        </p>
      </div>

      <form [formGroup]="categoryForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="flex flex-col gap-1.5">
          <label
            class="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-foreground/80"
            for="nome"
          >
            Nome da categoria
          </label>
          <input
            formControlName="nome"
            class="h-12 p-3 w-full rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            id="nome"
            z-input
            placeholder="Ex: Notebook"
          />
          @if (categoryForm.get('nome')?.touched && categoryForm.get('nome')?.errors?.['pattern']) {
            <span class="text-xs text-red-500 font-medium"
              >O nome contém caracteres inválidos ou emojis.</span
            >
          }
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            class="text-[11px] sm:text-xs uppercase font-bold tracking-wider text-foreground/80"
            for="descricao"
          >
            Descrição
          </label>
          <input
            formControlName="descricao"
            class="h-12 p-3 w-full rounded-md border border-border bg-background focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            id="descricao"
            z-input
            placeholder="Uma breve descrição da categoria"
          />
          @if (
            categoryForm.get('descricao')?.touched &&
            categoryForm.get('descricao')?.errors?.['pattern']
          ) {
            <span class="text-xs text-red-500 font-medium"
              >A descrição contém caracteres não permitidos.</span
            >
          }
        </div>

        <div
          class="mt-8 flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-6 border-t border-border/50"
        >
          <button
            type="button"
            (click)="close()"
            class="w-full sm:w-auto rounded-lg bg-muted text-muted-foreground px-8 py-2.5 text-sm font-semibold transition hover:bg-muted/80 cursor-pointer active:scale-95"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="w-full sm:w-auto min-w-[180px] rounded-lg bg-[#212D6B] hover:bg-[#2b3878] text-white transition-all py-2.5 cursor-pointer text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 shadow-sm"
            [disabled]="loading || categoryForm.get('nome')?.invalid"
          >
            @if (loading) {
              <span class="flex items-center justify-center gap-2">
                <span
                  class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                ></span>
                Processando...
              </span>
            } @else {
              Criar categoria
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCategoryDialogBasicInputComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef);
  private categoryService = inject(CategoryService);

  @Output() categoriaCriada = new EventEmitter<any>();

  loading = false;

  categoryForm: FormGroup = this.fb.group({
    nome: [
      '',
      [
        Validators.required,
        Validators.minLength(3),

        Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s.\-\/]+$/),
      ],
    ],
    descricao: ['', [Validators.pattern(/^[a-zA-ZÀ-ÿ0-9\s.,\-\/\(\)]*$/)]],
  });

  onSubmit() {
    if (this.categoryForm.valid) {
      this.loading = true;

      this.categoryService.create(this.categoryForm.value).subscribe({
        next: (categoriaCriada) => {
          this.categoriaCriada.emit(categoriaCriada);
          this.dialogRef.close();
        },
        error: () => {
          this.loading = false;
          this.dialogRef.close();
        },
      });
    } else {
      this.categoryForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zard-create-category-button',
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
      Criar categoria
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateCategoryButtonComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  @Output() aoCriarCategoria = new EventEmitter<any>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardCategoryDialogBasicInputComponent,
      zHideFooter: true,
      zWidth: '640px',
    });

    const instance = dialogRef.componentInstance as ZardCategoryDialogBasicInputComponent;

    instance.categoriaCriada.subscribe((categoria) => {
      this.aoCriarCategoria.emit(categoria);
    });
  }
}

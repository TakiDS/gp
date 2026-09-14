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
import { LucideAngularModule, Pencil } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { CategoryService } from '@/shared/core/services/category/category.service';

export interface EditCategoriaData {
  uuid: string;
  nomeAtual: string;
  descricaoAtual: string;
  onSuccess?: (novoNome: string, novaDescricao: string) => void;
}

@Component({
  selector: 'app-edit-categoria-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ZardInputDirective],
  template: `
    <div class="w-full bg-background text-foreground px-8 py-6">
      <div class="mb-6">
        <h2 class="text-2xl font-bold">Editar Categoria</h2>
        <p class="mt-1 mb-2 text-base leading-relaxed text-foreground/80">
          Atualize as informações da categoria abaixo.
        </p>
      </div>

      <form [formGroup]="form" (ngSubmit)="confirm()" class="space-y-4">
        <div class="flex flex-col gap-1">
          <label class="text-[12px] uppercase font-semibold text-foreground/80" for="categoria">
            Nome da Categoria <span class="text-red-500">*</span>
          </label>
          <input
            formControlName="categoria"
            class="h-12 p-3 border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition w-full"
            id="categoria"
            z-input
            placeholder="Ex: Equipamentos de TI"
          />
          @if (form.get('categoria')?.invalid && form.get('categoria')?.touched) {
            <span class="text-xs text-red-500">O nome é obrigatório (mínimo 3 caracteres).</span>
          }
        </div>

        <div class="flex flex-col gap-1">
          <label class="text-[12px] uppercase font-semibold text-foreground/80" for="descricao">
            Descrição
          </label>
          <textarea
            formControlName="descricao"
            class="min-h-[100px] p-3 border border-border rounded-md focus:border-primary focus:ring-1 focus:ring-primary/20 outline-none transition w-full resize-none"
            id="descricao"
            z-input
            placeholder="Descreva brevemente esta categoria..."
          ></textarea>
        </div>

        <div class="mt-4 flex gap-4 justify-end pt-6 border-t border-border">
          <button
            type="button"
            (click)="close()"
            class="rounded-lg bg-muted hover:bg-muted/80 px-6 py-2.5 text-sm font-semibold transition-colors cursor-pointer"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="rounded-md bg-[#212D6B] px-6 py-2.5 cursor-pointer text-sm font-semibold text-white hover:bg-[#2b3878] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            [disabled]="loading || form.invalid"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
              ></span>
            }
            Salvar Alterações
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
        background: white;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditCategoriaDialogComponent implements OnInit {
  private dialogRef = inject(ZardDialogRef);
  private fb = inject(FormBuilder);
  private categoriaService = inject(CategoryService);
  private cdr = inject(ChangeDetectorRef);

  data = signal<EditCategoriaData | null>(null);
  loading = false;

  form: FormGroup = this.fb.group({
    categoria: ['', [Validators.required, Validators.minLength(3)]],
    descricao: [''],
  });

  ngOnInit() {
    const ref = this.dialogRef as any;
    const dados = ref.zData || ref.data || ref.config?.zData;

    if (dados) {
      this.data.set(dados);
      this.form.patchValue({
        categoria: dados.nomeAtual,
        descricao: dados.descricaoAtual,
      });
    }
  }

  confirm() {
    if (this.form.invalid || !this.data()) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    const novoNome = this.form.value.categoria;
    const novaDescricao = this.form.value.descricao;
    const uuid = this.data()!.uuid;

    this.categoriaService
      .update(uuid, { nome: novoNome, descricao: novaDescricao })
      .pipe(
        finalize(() => {
          this.loading = false;
          this.cdr.detectChanges();
        }),
      )
      .subscribe({
        next: () => {
          if (this.data()?.onSuccess) {
            this.data()!.onSuccess!(novoNome, novaDescricao);
          }
          this.dialogRef.close();
        },
        error: (err) => console.error('Erro ao editar categoria:', err),
      });
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'app-edit-categoria-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <button
      (click)="openDialog()"
      class="px-4 py-2 bg-secondary h-11 w-[160px] border border-border hover:bg-secondary hover:border-foreground/20 rounded-md text-sm font-medium transition shadow-sm cursor-pointer flex items-center gap-2"
    >
      <lucide-angular [img]="Pencil" size="14"></lucide-angular>
      Editar Categoria
    </button>
  `,
})
export class EditCategoriaButtonComponent {
  private dialogService = inject(ZardDialogService);
  readonly Pencil = Pencil;

  @Input({ required: true }) uuid!: string;
  @Input({ required: true }) currentName!: string;
  @Input() currentDescription: string = '';

  @Output() onCategoryUpdated = new EventEmitter<{ nome: string; descricao: string }>();

  openDialog() {
    if (!this.uuid) return;

    const modalData: EditCategoriaData = {
      uuid: this.uuid,
      nomeAtual: this.currentName,
      descricaoAtual: this.currentDescription,
      onSuccess: (novoNome, novaDescricao) => {
        this.onCategoryUpdated.emit({ nome: novoNome, descricao: novaDescricao });
      },
    };

    this.dialogService.create({
      zContent: EditCategoriaDialogComponent,
      zHideFooter: true,
      zWidth: '600px',
      zData: modalData,
    });
  }
}

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideAngularModule,
  Trash2,
  AlertTriangle,
  FolderTree,
  Loader2,
  Info
} from 'lucide-angular';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService, Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  EventEmitter,
  inject,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CategoryService } from '@/shared/core/services/category/category.service';

export interface DeleteCategoryData {
  uuid: string;
  nome: string;
  totalItens?: number; 
}

@Component({
  selector: 'app-delete-category-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <div class="w-full rounded-xl bg-background text-foreground overflow-hidden">
      <div class="px-8 pt-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-red-500/10 rounded-full text-red-500">
            <lucide-angular [img]="AlertTriangle" size="28"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight text-foreground">Excluir Categoria</h2>
            <p class="text-muted-foreground text-sm">
              Esta ação removerá a categoria do sistema.
            </p>
          </div>
        </div>
      </div>

      <div class="px-8 py-6 flex flex-col gap-5">
        <div class="bg-muted/30 border border-border rounded-xl p-5 flex flex-col gap-4">
          <div class="flex items-start gap-3">
            <lucide-angular [img]="FolderTree" size="18" class="mt-1 text-primary"></lucide-angular>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Categoria selecionada
              </span>
              <span class="font-bold text-[15px]">{{ data.nome }}</span>
            </div>
          </div>

          @if (data.totalItens && data.totalItens > 0) {
            <div class="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-700">
              <lucide-angular [img]="Info" size="16"></lucide-angular>
              <span class="text-xs font-medium">
                Atenção: Existem {{ data.totalItens }} itens vinculados a esta categoria.
              </span>
            </div>
          }
        </div>
      </div>

      <div class="px-8 pb-8 flex items-center gap-3">
        <button
          type="button"
          (click)="closeModal()"
          [disabled]="loading()"
          class="flex-1 h-11 rounded-lg bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          (click)="confirm()"
          class="flex-1 h-11 rounded-lg bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
        >
          @if (loading()) {
            <lucide-angular [img]="Loader2" size="16" class="animate-spin"></lucide-angular>
          } @else {
            <lucide-angular [img]="Trash2" size="16"></lucide-angular>
            Excluir Agora
          }
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCategoryDialogComponent {
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly FolderTree = FolderTree;
  readonly Loader2 = Loader2;
  readonly Info = Info;

  private dialogRef = inject(ZardDialogRef);
  private categoryService = inject(CategoryService);
  public data = inject<DeleteCategoryData>(Z_MODAL_DATA);

  @Output() onSuccess = new EventEmitter<void>();

  public confirmName = '';
  public loading = signal(false);


  confirm() {
    this.loading.set(true);
    
    this.categoryService.delete(this.data.uuid).subscribe({
      next: () => {
        this.loading.set(false);
        this.onSuccess.emit();
        this.dialogRef.close(true);
      },
      error: (err) => {
        this.loading.set(false);
        console.error('Erro ao excluir categoria:', err);
      }
    });
  }

  closeModal() {
    this.dialogRef.close(false);
  }
}

@Component({
  selector: 'app-delete-category-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="h-10 px-4 rounded-lg bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 hover:border-red-200 transition-all duration-200 group"
    >
      <lucide-angular
        [img]="Trash2"
        size="16"
        strokeWidth="2.5"
        class="mr-2 text-red-500 group-hover:scale-110 transition-transform"
      ></lucide-angular>
      <span class="font-semibold text-sm">Excluir</span>
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DeleteCategoryButtonComponent {
  readonly Trash2 = Trash2;
  private dialogService = inject(ZardDialogService);

  @Input({ required: true }) categoryData!: DeleteCategoryData;
  @Output() categoryDeleted = new EventEmitter<void>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: DeleteCategoryDialogComponent,
      zData: this.categoryData,
      zHideFooter: true,
      zWidth: '500px',
    });

    const instance = dialogRef.componentInstance as DeleteCategoryDialogComponent;
    instance.onSuccess.subscribe(() => {
      this.categoryDeleted.emit();
    });
  }
}
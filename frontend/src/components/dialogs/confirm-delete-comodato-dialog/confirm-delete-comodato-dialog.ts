import { ChangeDetectionStrategy, Component, inject, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { 
  LucideAngularModule, 
  Trash2, 
  AlertTriangle, 
  User, 
  Box, 
  Calendar,
  X 
} from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';

@Component({
  selector: 'zard-delete-comodato-dialog',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="w-full rounded-xl bg-background text-foreground overflow-hidden">
      <div class="px-8 pt-8 flex items-center justify-between">
        <div class="flex items-center gap-4">
          <div class="p-3 bg-red-500/10 rounded-full text-red-500">
            <lucide-angular [img]="AlertTriangle" size="28"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight text-foreground">Confirmar Exclusão</h2>
            <p class="text-muted-foreground text-sm">Esta ação não pode ser desfeita.</p>
          </div>
        </div>
      </div>

      <div class="px-8 py-6">
        <div class="bg-muted/30 border border-border rounded-xl p-5 flex flex-col gap-4">
          
          <div class="flex items-start gap-3">
            <lucide-angular [img]="User" size="18" class="mt-1 text-primary"></lucide-angular>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Detentor</span>
              <span class="font-bold text-[15px]">{{ data.nome }}</span>
              <span class="text-xs text-muted-foreground">{{ data.email }}</span>
            </div>
          </div>

          <div class="h-px bg-border/40"></div>

          <div class="flex items-start gap-3">
            <lucide-angular [img]="Box" size="18" class="mt-1 text-primary"></lucide-angular>
            <div class="flex flex-col gap-2">
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Patrimônios</span>
              <div class="flex flex-wrap gap-2">
                @for (p of data.patrimonios; track p.uuid) {
                  <span class="px-2 py-1 bg-background border border-border rounded text-[11px] font-medium">
                    {{ p.descricao }}
                  </span>
                }
              </div>
            </div>
          </div>

          <div class="h-px bg-border/40"></div>

          <div class="flex items-start gap-3">
            <lucide-angular [img]="Calendar" size="18" class="mt-1 text-primary"></lucide-angular>
            <div class="flex flex-col">
              <span class="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Data</span>
              <span class="text-sm font-medium">{{ data.dataInicio }} — {{ data.dataFimEsperado }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="px-8 pb-8 flex items-center gap-3">
        <button
          type="button"
          (click)="closeModal()"
          class="flex-1 h-11 rounded-lg bg-muted text-foreground font-semibold text-sm hover:bg-muted/80 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="button"
          (click)="confirm()"
          class="flex-1 h-11 rounded-lg bg-red-800 text-white font-bold text-sm hover:bg-red-700 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-red-600/20"
        >
          <lucide-angular [img]="Trash2" size="16"></lucide-angular>
          Excluir Registro
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardDeleteComodatoDialogComponent {
  readonly X = X;
  readonly Trash2 = Trash2;
  readonly AlertTriangle = AlertTriangle;
  readonly User = User;
  readonly Box = Box;
  readonly Calendar = Calendar;

  private dialogRef = inject(ZardDialogRef);
  public data = inject(Z_MODAL_DATA);

  @Output() onConfirm = new EventEmitter<void>();

  confirm() {
    this.onConfirm.emit();
    this.dialogRef.close();
  }

  closeModal() {
    this.dialogRef.close();
  }
}
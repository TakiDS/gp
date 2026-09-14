import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import { Router } from '@angular/router';

export interface MoveSuccessData {
  nomePatrimonio: string;
  localAntigo: string;
  localNovo: string;
  statusAntigo: string;
  statusNovo: string;
}

@Component({
  selector: 'zard-move-success-dialog',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="w-full max-w-[720px] rounded-2xl bg-background text-foreground px-10 pt-10 pb-8">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="bg-green-100 p-6 rounded-full mb-4">
          <img src="assets/sucess-icon.svg" class="w-16 h-16" />
        </div>

        <h2 class="text-2xl font-bold text-foreground">Movimentação realizada com sucesso!</h2>

        <p class="text-foreground/80 mt-2">O patrimônio foi atualizado corretamente.</p>
      </div>

      <div class="bg-card rounded-xl p-6 border border-border">
        <div class="mb-6">
          <p class="text-sm text-muted-foreground">Patrimônio</p>
          <p class="text-lg font-bold text-foreground">
            {{ data.nomePatrimonio }}
          </p>
        </div>

        <div class="flex items-center justify-between mb-6">
          <div class="flex-1">
            <p class="text-sm text-muted-foreground">Local anterior</p>
            <p class="font-semibold text-foreground">
              {{ data.localAntigo }}
            </p>
          </div>

          <div class="mx-4 text-muted-foreground text-xl">→</div>

          <div class="flex-1 text-right">
            <p class="text-sm text-muted-foreground">Novo local</p>
            <p class="font-semibold text-foreground">
              {{ data.localNovo }}
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <div class="flex-1">
            <p class="text-sm text-foreground/70 mb-2">Status anterior</p>
            <span
              class="flex items-center justify-center w-24 gap-2 px-3 py-1 rounded-md text-xs font-medium"
              [ngClass]="getStatusClass(data.statusAntigo)"
            >
              {{ data.statusAntigo }}
            </span>
          </div>

          <div class="mx-4 text-muted-foreground text-xl">→</div>

          <div class="flex-1 text-right">
            <p class="text-sm text-foreground/70 mb-2">Novo status</p>
            <span
              class="flex items-center justify-center w-24 gap-2 px-3 py-1 rounded-md text-xs font-medium ml-auto"
              [ngClass]="getStatusClass(data.statusNovo)"
            >
              {{ data.statusNovo }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-10 flex justify-end gap-4 border-t pt-6">
        <button
          (click)="goToList()"
          class="rounded-lg bg-brand-color px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#2b3878]"
        >
          Ver patrimônios
        </button>

        <button
          (click)="close()"
          class="rounded-lg bg-gray-200 px-6 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-300"
        >
          Fechar
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardMovePatrimonioSuccessDialogComponent {
  private dialogRef = inject(ZardDialogRef);
  private router = inject(Router);

  public data = inject<MoveSuccessData>(Z_MODAL_DATA);

  close() {
    this.dialogRef.close();
  }

  goToList() {
    this.dialogRef.close();
    this.router.navigate(['/patrimonios']);
  }

  getStatusClass(status: string): string {
    const s = status?.toUpperCase();

    switch (s) {
      case 'GUARDADO':
        return 'bg-teal-500/10 text-teal-400';

      case 'USO':
        return 'bg-amber-500/10 text-amber-400';

      case 'DEFEITO':
        return 'bg-red-500/10 text-red-400';

      case 'EMPRESTIMO':
        return 'bg-sky-500/10 text-sky-400';

      case 'MANUTENCAO':
        return 'bg-purple-500/10 text-purple-400';

      case 'EXTRAVIADO':
        return 'bg-rose-500/10 text-rose-400';

      case 'BAIXA':
        return 'bg-gray-500/10 text-gray-400';

      case 'DOACAO':
        return 'bg-cyan-500/10 text-cyan-400';

      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  }
}

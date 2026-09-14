import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';

export interface PatrimonioResponse {
  uuid: string;
  codigoNota: string;
  fornecedor: string;
  cnpj: string;
  valorTotalNota: number;
  dataEmissao: string;
  status: string;
  notaFiscalUrl: string;
  dataCriacao: string;
  chaveAcesso: string | null;
}

@Component({
  selector: 'zard-demo-dialog-basic',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-5 sm:px-10 pt-6 sm:pt-10 pb-6 sm:pb-8"
    >
      <div class="flex flex-col items-center text-center mb-6 sm:mb-8">
        <div class="bg-green-50 dark:bg-green-500/10 p-4 sm:p-6 rounded-full mb-4">
          <img src="assets/sucess-icon.svg" alt="Sucesso" class="w-12 h-12 sm:w-16 sm:h-16" />
        </div>
        <h2 class="text-xl sm:text-2xl font-bold text-foreground">
          Patrimônios criados com sucesso!
        </h2>
        <p class="text-muted-foreground mt-2 text-sm sm:text-base">
          Os dados da nota fiscal foram processados corretamente.
        </p>
      </div>

      <div class="bg-card rounded-xl p-4 sm:p-6 border border-border">
        <div class="grid grid-cols-2 gap-y-4 sm:gap-y-6">
          <div class="col-span-2 sm:col-span-1">
            <p class="text-xs sm:text-sm text-muted-foreground">Nota Fiscal</p>
            <p class="font-bold text-foreground text-sm sm:text-base">{{ data.codigoNota }}</p>
          </div>

          <div class="col-span-2 sm:col-span-1 sm:text-right">
            <p class="text-xs sm:text-sm text-muted-foreground">Data de Emissão</p>
            <p class="font-semibold text-foreground text-sm sm:text-base">
              {{ data.dataEmissao | date: 'dd/MM/yyyy' }}
            </p>
          </div>

          <div class="col-span-2">
            <p class="text-xs sm:text-sm text-muted-foreground">Fornecedor</p>
            <p
              class="font-semibold text-foreground truncate text-sm sm:text-base"
              [title]="data.fornecedor"
            >
              {{ data.fornecedor }}
            </p>
          </div>

          <div class="col-span-1">
            <p class="text-xs sm:text-sm text-muted-foreground">Valor Total</p>
            <p class="text-base sm:text-lg font-bold text-green-600 dark:text-green-400">
              {{ data.valorTotalNota | currency: 'BRL' }}
            </p>
          </div>

          <div class="col-span-1 text-right">
            <p class="text-xs sm:text-sm text-muted-foreground mb-1">Status</p>
            <span
              class="inline-flex items-center px-2 sm:px-3 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20"
            >
              {{ data.status }}
            </span>
          </div>
        </div>
      </div>

      <div
        class="mt-6 sm:mt-10 flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4 border-t border-border pt-5 sm:pt-6"
      >
        <button
          (click)="goToForm()"
          class="w-full sm:w-auto rounded-lg bg-secondary px-6 py-2.5 text-sm font-semibold text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Voltar
        </button>

        <button
          (click)="goToHome()"
          class="w-full sm:w-auto rounded-lg bg-[#212D6B] px-8 py-2.5 text-sm font-semibold text-white hover:bg-[#2b3878] transition-colors"
        >
          Ver patrimônios
        </button>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardSucessDialogBasicInputComponent {
  private dialogRef = inject(ZardDialogRef);
  private router = inject(Router);
  public data = inject<PatrimonioResponse>(Z_MODAL_DATA);

  goToHome() {
    this.dialogRef.close();
    this.router.navigate(['/patrimonios']);
  }

  goToForm() {
    this.dialogRef.close();
    this.router.navigate(['/criapatrimonio']);
  }
}

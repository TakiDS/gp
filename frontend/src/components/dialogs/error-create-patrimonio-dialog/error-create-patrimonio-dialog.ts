import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ChangeDetectionStrategy, Component, inject, type AfterViewInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Plus } from 'lucide-angular';

interface iDialogData {
  name: string;
  username: string;
}

@Component({
  selector: 'zard-error-create-patrimonio-dialog',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    RouterLink,
  ],
  template: `
    <div class="w-full rounded-xl bg-background text-foreground px-10 pt-8">
      <div class="mb-10 flex flex-col items-center text-center">
        <div class="mb-4">
          <img src="assets/error-icon.svg" alt="Erro" class="h-25 w-25" />
        </div>
        <h2 class="text-2xl font-bold">Não foi possivel processar a Nota Fiscal</h2>
        <p class="mt-2 max-w-125 text-base leading-relaxed text-foreground/70">
          O arquivo enviado não esta em um formato válido ou está incompleto. Por favor, verifique
          se o arquivo está correto e tente novamente.
        </p>

        <div class="mt-3 flex gap-4 justify-end pt-6">
          <button
            (click)="goToHome()"
            class="mt-auto w-55 rounded-md bg-brand-color py-3 cursor-pointer text-sm font-semibold text-white hover:bg-brand-color/90 transition"
          >
            Tentar novamente
          </button>

          <button
            (click)="closeModal()"
            class="rounded-lg bg-muted/70 border border-border px-8 py-2.5 text-sm font-semibold text-foreground/70 transition hover:bg-muted/50 cursor-pointer"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'zardErrorCreatePatrimonioDialog',
})
export class ZardErrorCreatePatrimonioDialogComponent implements AfterViewInit {
  private dialogRef = inject(ZardDialogRef);
  private router = inject(Router);

  goToHome() {
    this.dialogRef.close();
    this.router.navigate(['/criapatrimonio']);
  }

  closeModal() {
    this.dialogRef.close();
  }

  ngAfterViewInit(): void {}
}

@Component({
  selector: 'zard-error-patrimonio-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button (click)="openDialog()" class="h-11 bg-[#E4E4E4] text-black hover:bg-[#D0D0D0]">
      <lucide-angular
        [img]="Plus"
        size="20"
        strokeWidth="2"
        class="my-icon rounded-md"
      ></lucide-angular>
      Criar patrimonio
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardErrorPatrimonioButton {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  openDialog() {
    this.dialogService.create({
      zContent: ZardErrorCreatePatrimonioDialogComponent,
      zHideFooter: true,
      zWidth: '700px',
    });
  }
}

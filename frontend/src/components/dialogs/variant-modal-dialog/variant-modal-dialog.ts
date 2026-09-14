import { ChangeDetectionStrategy, Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Printer, X } from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';

@Component({
  selector: 'z-print-variant-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div
      class="w-full rounded-xl bg-background text-card-foreground px-5 py-8 sm:px-10 sm:py-10  shadow-lg transition-colors duration-300"
    >
      <div class="text-center">
        <div class="mb-8 px-2">
          <h2 class="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Estilo da Etiqueta
          </h2>
          <p
            class="mx-auto mt-3 max-w-[400px] text-sm sm:text-base leading-relaxed text-muted-foreground"
          >
            Escolha o estilo de impressão que deseja utilizar para as etiquetas selecionadas.
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3 sm:gap-4 mb-8 max-w-sm mx-auto">
          <button
            (click)="onSelect('preta')"
            class="group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-[0.97]"
          >
            <div
              class="w-full h-16 sm:h-20 rounded-lg bg-white border border-border/60 flex items-center justify-center shadow-sm"
            >
              <div class="flex flex-col items-center gap-1.5">
                <div class="grid grid-cols-3 gap-0.5">
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-black/80 rounded-[1px]"></div>
                </div>
                <div class="h-0.5 w-8 bg-black/20 rounded-full mt-0.5"></div>
              </div>
            </div>
            <div class="text-center">
              <p
                class="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors"
              >
                Fundo Branco
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">QR code preto</p>
            </div>
          </button>

          <button
            (click)="onSelect('branca')"
            class="group flex flex-col items-center gap-3 p-4 sm:p-5 rounded-xl border-2 border-border hover:border-primary/60 hover:bg-primary/5 transition-all duration-200 active:scale-[0.97]"
          >
            <!-- Preview -->
            <div
              class="w-full h-16 sm:h-20 rounded-lg bg-gray-900 border border-border/60 flex items-center justify-center shadow-sm"
            >
              <div class="flex flex-col items-center gap-1.5">
                <div class="grid grid-cols-3 gap-0.5">
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-gray-900 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-gray-900 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-gray-900 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                  <div class="w-2 h-2 bg-white/90 rounded-[1px]"></div>
                </div>
                <div class="h-0.5 w-8 bg-white/20 rounded-full mt-0.5"></div>
              </div>
            </div>
            <div class="text-center">
              <p
                class="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary transition-colors"
              >
                Fundo Preto
              </p>
              <p class="text-[10px] text-muted-foreground mt-0.5">QR code branco</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZPrintVariantModalComponent {
  readonly Printer = Printer;
  readonly X = X;

  private dialogRef = inject(ZardDialogRef, { optional: true });

  @Output() varianteSelecionada = new EventEmitter<'preta' | 'branca'>();
  @Output() cancelado = new EventEmitter<void>();

  onSelect(variante: 'preta' | 'branca') {
    this.varianteSelecionada.emit(variante);
    this.dialogRef?.close(variante);
  }

  onCancel() {
    this.cancelado.emit();
    this.dialogRef?.close(null);
  }
}

import { ZardDialogService } from '@/shared/components/dialog/dialog.service';

@Component({
  selector: 'z-print-variant-button',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `<!-- use programaticamente via openDialog() -->`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZPrintVariantButtonComponent {
  private dialogService = inject(ZardDialogService);

  openDialog(): Promise<'preta' | 'branca' | null> {
    const ref = this.dialogService.create({
      zContent: ZPrintVariantModalComponent,
      zHideFooter: true,
      zWidth: 'min(460px, calc(100vw - 32px))',
      zClosable: true,
    });

    return new Promise((resolve) => {
      const instance = ref.componentInstance as ZPrintVariantModalComponent;
      instance?.varianteSelecionada.subscribe((v) => resolve(v));
      instance?.cancelado.subscribe(() => resolve(null));
      ref.afterClosed().subscribe((result) => resolve(result ?? null));
    });
  }
}

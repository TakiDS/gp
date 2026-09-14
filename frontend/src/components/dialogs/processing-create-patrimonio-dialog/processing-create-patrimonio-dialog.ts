import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { LucideAngularModule, Plus, Settings, Cog } from 'lucide-angular';

@Component({
  selector: 'z-processing-nota-fiscal',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  template: `
    <div
      class="w-full rounded-xl bg-card text-card-foreground px-5 py-8 sm:px-10 sm:py-12 border border-border/50 shadow-lg transition-colors duration-300"
    >
      <div class="text-center">
        <!-- Título e descrição -->
        <div class="mb-8 sm:mb-10 px-2">
          <h2 class="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Processando Nota Fiscal
          </h2>
          <p
            class="mx-auto mt-3 sm:mt-4 max-w-[500px] text-sm sm:text-base leading-relaxed text-muted-foreground"
          >
            Estamos lendo os dados da nota e gerando os registros de patrimônios automaticamente.
            Isso pode levar alguns momentos...
          </p>
        </div>

        <!-- Engrenagens — animações intactas, tamanhos responsivos -->
        <div class="relative flex justify-center items-center mb-8 sm:mb-10" style="height: 100px;">
          <!-- Engrenagem principal -->
          <div class="relative z-10">
            <lucide-angular
              [img]="Cog"
              size="64"
              strokeWidth="1.5"
              class="text-primary block animate-gear-rotate sm:hidden"
            ></lucide-angular>
            <lucide-angular
              [img]="Cog"
              size="80"
              strokeWidth="1.5"
              class="text-primary hidden sm:block animate-gear-rotate"
            ></lucide-angular>
          </div>

          <!-- Engrenagem secundária — posição proporcional -->
          <div class="absolute sm:hidden" style="transform: translate(40px, -20px);">
            <lucide-angular
              [img]="Settings"
              size="32"
              strokeWidth="2"
              class="text-muted-foreground/60 block animate-gear-rotate-reverse"
            ></lucide-angular>
          </div>
          <div class="absolute hidden sm:block" style="transform: translate(52px, -28px);">
            <lucide-angular
              [img]="Settings"
              size="40"
              strokeWidth="2"
              class="text-muted-foreground/60 block animate-gear-rotate-reverse"
            ></lucide-angular>
          </div>
        </div>

        <!-- Barra de progresso e status -->
        <div class="flex flex-col items-center gap-3 sm:gap-4">
          <div class="w-48 sm:w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary animate-progress-flow rounded-full"></div>
          </div>

          <div class="flex items-center gap-2 mt-1 sm:mt-2">
            <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <p class="text-[10px] sm:text-xs font-bold text-primary tracking-widest uppercase">
              Por favor, não feche esta janela
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      /* Rotação horária para a engrenagem principal */
      .animate-gear-rotate {
        animation: gear-spin 5s linear infinite;
        transform-origin: center !important;
      }

      /* Rotação anti-horária para a engrenagem secundária (mais rápida para encaixe mecânico) */
      .animate-gear-rotate-reverse {
        animation: gear-spin-reverse 2.5s linear infinite;
        transform-origin: center !important;
      }

      /* Animação da barra de progresso indeterminada */
      .animate-progress-flow {
        width: 40%;
        animation: progress-move 2s infinite ease-in-out;
      }

      @keyframes gear-spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      @keyframes gear-spin-reverse {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(-360deg);
        }
      }

      @keyframes progress-move {
        0% {
          transform: translateX(-150%);
        }
        50% {
          transform: translateX(100%);
        }
        100% {
          transform: translateX(250%);
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardProcessingNotaFiscalComponent {
  readonly Cog = Cog;
  readonly Settings = Settings;
}

@Component({
  selector: 'zard-processing-patrimonio-button',
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
      Criar patrimônio
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardProcessingPatrimonioButton {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  openDialog() {
    this.dialogService.create({
      zContent: ZardProcessingNotaFiscalComponent,
      zHideFooter: true,
      zWidth: 'min(800px, calc(100vw - 32px))',
      zClosable: false,
    });
  }
}

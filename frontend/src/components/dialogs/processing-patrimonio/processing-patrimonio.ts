import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideAngularModule, Cog, Settings } from 'lucide-angular';

@Component({
  selector: 'z-processing-patrimonio',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  template: `
    <div
      class="w-full rounded-xl bg-card text-card-foreground px-5 py-8 sm:px-10 sm:py-12 border border-border/50 shadow-lg transition-colors duration-300"
    >
      <div class="text-center">
        <div class="mb-8 sm:mb-10 px-2">
          <h2 class="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Criando Patrimônios
          </h2>
          <p
            class="mx-auto mt-3 sm:mt-4 max-w-[500px] text-sm sm:text-base leading-relaxed text-muted-foreground"
          >
            Estamos registrando seus itens no sistema e gerando as etiquetas de identificação. Isso
            pode levar alguns momentos...
          </p>
        </div>

        <div class="relative flex justify-center items-center mb-8 sm:mb-10" style="height: 100px;">
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

        <div class="flex flex-col items-center gap-3 sm:gap-4">
          <div class="w-48 sm:w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary animate-progress-flow rounded-full"></div>
          </div>

          <div class="flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <p class="text-xs sm:text-sm font-semibold text-primary tracking-wide">
              Gerando etiquetas de identificação...
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
export class ZardProcessingPatrimonioComponent {
  readonly Cog = Cog;
  readonly Settings = Settings;
}

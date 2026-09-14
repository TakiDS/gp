import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, Mail, Send } from 'lucide-angular';

@Component({
  selector: 'z-processing-user-invite',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  template: `
    <div
      class="w-full rounded-xl bg-card text-card-foreground px-5 py-8 sm:px-10 sm:py-12 border border-border/50 shadow-lg transition-colors duration-300"
    >
      <div class="text-center">
        <!-- Título -->
        <div class="mb-8 sm:mb-10 px-2">
          <h2 class="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
            Enviando Convite
          </h2>
          <p
            class="mx-auto mt-3 sm:mt-4 max-w-[420px] text-sm sm:text-base leading-relaxed text-muted-foreground"
          >
            Estamos preparando e enviando o e-mail de acesso para o novo usuário. Isso leva apenas
            alguns instantes...
          </p>
        </div>

        <!-- Animação: envelope voando -->
        <div class="relative flex justify-center items-center mb-8 sm:mb-10" style="height: 110px;">
          <!-- Envelope principal -->
          <div class="relative z-10 animate-envelope-float">
            <svg
              width="72"
              height="72"
              viewBox="0 0 72 72"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="drop-shadow-[0_4px_24px_rgba(99,102,241,0.25)]"
            >
              <!-- Corpo do envelope -->
              <rect
                x="6"
                y="18"
                width="60"
                height="42"
                rx="5"
                fill="currentColor"
                class="text-primary/20"
              />
              <rect
                x="6"
                y="18"
                width="60"
                height="42"
                rx="5"
                stroke="currentColor"
                stroke-width="3"
                class="text-primary"
                fill="none"
              />
              <!-- Aba do envelope -->
              <path
                d="M6 23 L36 44 L66 23"
                stroke="currentColor"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-primary"
                fill="none"
              />
              <!-- Linhas de papel interno -->
              <line
                x1="20"
                y1="34"
                x2="52"
                y2="34"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="text-primary/40"
              />
              <line
                x1="20"
                y1="41"
                x2="44"
                y2="41"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                class="text-primary/40"
              />
            </svg>
          </div>

          <!-- Partículas voando -->
          <div class="absolute animate-dot-1" style="top: 20px; right: calc(50% - 55px);">
            <span class="block w-2 h-2 rounded-full bg-primary/60"></span>
          </div>
          <div class="absolute animate-dot-2" style="top: 35px; right: calc(50% - 70px);">
            <span class="block w-1.5 h-1.5 rounded-full bg-primary/40"></span>
          </div>
          <div class="absolute animate-dot-3" style="top: 10px; right: calc(50% - 48px);">
            <span class="block w-1 h-1 rounded-full bg-primary/30"></span>
          </div>

          <!-- Ícone de destino (caixa de entrada) -->
          <div
            class="absolute right-[calc(50%-110px)] sm:right-[calc(50%-130px)] top-1/2 -translate-y-1/2 opacity-40"
          >
            <lucide-angular [img]="Mail" size="28" class="text-primary"></lucide-angular>
          </div>
        </div>

        <!-- Barra de progresso + status -->
        <div class="flex flex-col items-center gap-3 sm:gap-4">
          <div class="w-48 sm:w-64 h-2 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary animate-progress-flow rounded-full"></div>
          </div>

          <div class="flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <p class="text-[11px] sm:text-xs font-bold text-primary tracking-widest uppercase">
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

      /* Envelope flutuando e indo para direita */
      .animate-envelope-float {
        animation: envelope-fly 2.4s ease-in-out infinite;
      }

      /* Partículas que ficam para trás */
      .animate-dot-1 {
        animation: dot-trail 2.4s ease-in-out infinite;
      }
      .animate-dot-2 {
        animation: dot-trail 2.4s ease-in-out infinite;
        animation-delay: 0.15s;
      }
      .animate-dot-3 {
        animation: dot-trail 2.4s ease-in-out infinite;
        animation-delay: 0.3s;
      }

      /* Barra de progresso */
      .animate-progress-flow {
        width: 40%;
        animation: progress-move 2s infinite ease-in-out;
      }

      @keyframes envelope-fly {
        0% {
          transform: translateX(-8px) translateY(4px) rotate(-3deg);
          opacity: 1;
        }
        45% {
          transform: translateX(6px) translateY(-6px) rotate(2deg);
          opacity: 1;
        }
        80% {
          transform: translateX(18px) translateY(-4px) rotate(1deg);
          opacity: 0.6;
        }
        85% {
          transform: translateX(20px) translateY(-4px) rotate(0deg);
          opacity: 0;
        }
        86% {
          transform: translateX(-12px) translateY(4px) rotate(-3deg);
          opacity: 0;
        }
        100% {
          transform: translateX(-8px) translateY(4px) rotate(-3deg);
          opacity: 1;
        }
      }

      @keyframes dot-trail {
        0% {
          opacity: 0;
          transform: translateX(0) scale(0.5);
        }
        30% {
          opacity: 1;
          transform: translateX(-6px) scale(1);
        }
        60% {
          opacity: 0.5;
          transform: translateX(-14px) scale(0.8);
        }
        80% {
          opacity: 0;
          transform: translateX(-20px) scale(0.4);
        }
        100% {
          opacity: 0;
          transform: translateX(0) scale(0.5);
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
export class ZardProcessingUserInviteComponent {
  readonly Mail = Mail;
  readonly Send = Send;
}

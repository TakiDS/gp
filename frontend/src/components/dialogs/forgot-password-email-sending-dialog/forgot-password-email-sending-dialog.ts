import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'z-forgot-password-sending-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-backdrop-in"
    >
      <div
        class="relative bg-card text-card-foreground border border-border/60 rounded-2xl p-8 sm:p-10 w-full max-w-sm mx-4 shadow-2xl overflow-hidden animate-modal-in"
      >
        <!-- Glow de fundo -->
        <div
          class="absolute -top-10 -left-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        ></div>
        <div
          class="absolute -bottom-10 -right-10 w-40 h-40 rounded-full bg-primary/10 blur-3xl pointer-events-none"
        ></div>

        <div class="relative flex flex-col items-center gap-6 text-center">
          <!-- Animação do envelope -->
          <div
            class="relative flex items-center justify-center"
            style="height: 100px; width: 160px;"
          >
            <!-- Envelope principal -->
            <div class="absolute z-10 animate-envelope-send">
              <svg
                width="64"
                height="64"
                viewBox="0 0 72 72"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="drop-shadow-[0_4px_24px_rgba(33,45,107,0.3)]"
              >
                <rect
                  x="6"
                  y="18"
                  width="60"
                  height="42"
                  rx="5"
                  fill="currentColor"
                  class="text-primary/15"
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
                <!-- Aba aberta -->
                <path
                  d="M6 23 L36 44 L66 23"
                  stroke="currentColor"
                  stroke-width="3"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="text-primary"
                  fill="none"
                />
                <!-- Linhas do e-mail interno -->
                <line
                  x1="20"
                  y1="34"
                  x2="52"
                  y2="34"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  class="text-primary/35"
                />
                <line
                  x1="20"
                  y1="41"
                  x2="44"
                  y2="41"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  class="text-primary/35"
                />
              </svg>
            </div>

            <!-- Rastro de partículas -->
            <span class="absolute animate-spark-1" style="top: 22px; left: 12px;">
              <span class="block w-2 h-2 rounded-full bg-primary/60"></span>
            </span>
            <span class="absolute animate-spark-2" style="top: 38px; left: 6px;">
              <span class="block w-1.5 h-1.5 rounded-full bg-primary/40"></span>
            </span>
            <span class="absolute animate-spark-3" style="top: 14px; left: 18px;">
              <span class="block w-1 h-1 rounded-full bg-primary/25"></span>
            </span>

            <!-- Ícone alvo (caixa de entrada) à direita -->
            <div class="absolute right-0 top-1/2 -translate-y-1/2 opacity-35">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="text-primary"
              >
                <polyline points="22 12 16 12 14 15 10 15 8 12 2 12"></polyline>
                <path
                  d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"
                ></path>
              </svg>
            </div>
          </div>

          <!-- Texto -->
          <div class="flex flex-col gap-1">
            <h3 class="text-base font-bold tracking-tight text-foreground">
              Enviando código de recuperação
            </h3>
            <p class="text-xs text-muted-foreground leading-relaxed max-w-[220px]">
              Estamos processando seu e-mail. Isso leva apenas alguns instantes...
            </p>
          </div>

          <!-- Barra de progresso -->
          <div class="w-48 h-1.5 bg-muted rounded-full overflow-hidden">
            <div class="h-full bg-primary rounded-full animate-progress-sweep"></div>
          </div>

          <!-- Status pulsante -->
          <div class="flex items-center gap-2">
            <span class="flex h-2 w-2 rounded-full bg-primary animate-pulse shrink-0"></span>
            <p class="text-[10px] font-bold text-primary tracking-widest uppercase">
              Não feche esta janela
            </p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      @keyframes backdrop-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }
      @keyframes modal-in {
        from {
          opacity: 0;
          transform: scale(0.92) translateY(20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      /* Envelope vai da esquerda para a direita em loop */
      @keyframes envelope-send {
        0% {
          transform: translateX(-28px) translateY(4px) rotate(-4deg);
          opacity: 1;
        }
        40% {
          transform: translateX(4px) translateY(-6px) rotate(2deg);
          opacity: 1;
        }
        75% {
          transform: translateX(22px) translateY(-3px) rotate(1deg);
          opacity: 0.5;
        }
        82% {
          transform: translateX(26px) translateY(-3px) rotate(0deg);
          opacity: 0;
        }
        83% {
          transform: translateX(-32px) translateY(4px) rotate(-4deg);
          opacity: 0;
        }
        100% {
          transform: translateX(-28px) translateY(4px) rotate(-4deg);
          opacity: 1;
        }
      }

      @keyframes spark {
        0% {
          opacity: 0;
          transform: translateX(0) scale(0.4);
        }
        25% {
          opacity: 1;
          transform: translateX(-6px) scale(1);
        }
        55% {
          opacity: 0.5;
          transform: translateX(-14px) scale(0.7);
        }
        75% {
          opacity: 0;
          transform: translateX(-22px) scale(0.3);
        }
        100% {
          opacity: 0;
          transform: translateX(0) scale(0.4);
        }
      }

      @keyframes progress-sweep {
        0% {
          transform: translateX(-150%);
          width: 45%;
        }
        50% {
          transform: translateX(80%);
          width: 45%;
        }
        100% {
          transform: translateX(260%);
          width: 45%;
        }
      }

      .animate-backdrop-in {
        animation: backdrop-in 0.25s ease both;
      }
      .animate-modal-in {
        animation: modal-in 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .animate-envelope-send {
        animation: envelope-send 2.6s ease-in-out infinite;
      }
      .animate-spark-1 {
        animation: spark 2.6s ease-in-out infinite;
      }
      .animate-spark-2 {
        animation: spark 2.6s ease-in-out infinite 0.15s;
      }
      .animate-spark-3 {
        animation: spark 2.6s ease-in-out infinite 0.3s;
      }
      .animate-progress-sweep {
        animation: progress-sweep 2s ease-in-out infinite;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZForgotPasswordSendingModalComponent {}

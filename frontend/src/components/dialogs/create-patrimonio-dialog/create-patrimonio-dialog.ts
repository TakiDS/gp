import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { Z_MODAL_DATA, ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectItemComponent } from '@/shared/components/select/select-item.component';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ChangeDetectionStrategy, Component, inject, type AfterViewInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, X } from 'lucide-angular';

@Component({
  selector: 'zard-demo-dialog-basic',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectItemComponent,
    RouterLink,
    LucideAngularModule,
  ],
  styles: [
    `
      @keyframes slide-from-top {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes slide-from-bottom {
        from {
          opacity: 0;
          transform: translateY(24px) scale(0.98);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      @keyframes fade-in {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .anim-title {
        animation: slide-from-top 0.5s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-subtitle {
        animation: slide-from-top 0.5s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 60ms;
      }
      .anim-divider {
        animation: fade-in 0.4s ease both;
        animation-delay: 100ms;
      }
      .anim-card-left {
        animation: slide-from-bottom 0.55s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 150ms;
      }
      .anim-card-right {
        animation: slide-from-bottom 0.55s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 240ms;
      }
      .anim-close {
        animation: fade-in 0.35s ease both;
        animation-delay: 80ms;
      }
    `,
  ],
  template: `
    <div class="w-full rounded-2xl bg-background text-foreground px-6 py-7 sm:px-10 sm:py-8">
      <div class="relative mb-2 flex items-start justify-between">
        <div>
          <h2 class="text-xl sm:text-2xl font-bold tracking-tight anim-title">Criar patrimônio</h2>
          <p class="mt-1.5 text-sm text-muted-foreground anim-subtitle">
            Escolha uma opção para criar o patrimônio:
          </p>
        </div>
      </div>

      <div class="h-px bg-border my-6 anim-divider"></div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div
          class="anim-card-left group flex flex-col items-center rounded-xl border border-border px-6 py-7 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div
            class="mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          >
            <svg
              class="w-10 h-12 sm:w-[54px] sm:h-[64px] text-foreground"
              viewBox="0 0 54 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H34.0001L50.0001 15.3333V62H2V2Z"
                stroke="currentColor"
                stroke-width="4"
                stroke-linejoin="round"
              />
              <path
                d="M34 2V15.3333H50"
                stroke="currentColor"
                stroke-width="4"
                stroke-linejoin="round"
              />
              <path
                d="M9.99976 32H33.9998"
                stroke="#4D9476"
                stroke-width="4"
                stroke-linecap="round"
              />
              <path
                d="M9.99976 45.3333H25.9998"
                stroke="#4D9476"
                stroke-width="4"
                stroke-linecap="round"
              />
              <path
                d="M39.9998 53.6665C46.6272 53.6665 51.9998 49.1894 51.9998 43.6665C51.9998 38.1437 46.6272 33.6665 39.9998 33.6665C33.3723 33.6665 27.9998 38.1437 27.9998 43.6665C27.9998 49.1894 33.3723 53.6665 39.9998 53.6665Z"
                fill="#4B9475"
                stroke="#4B9475"
                stroke-width="4"
              />
              <path
                d="M34.8 43.6666L38.8001 46.9999L45.2001 41.3333"
                stroke="white"
                stroke-width="4"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h3 class="mb-2 text-base font-bold">Com nota fiscal</h3>

          <p class="mb-6 text-xs sm:text-sm leading-relaxed text-muted-foreground flex-1">
            Envie uma Nota Fiscal (PDF ou XML) e crie patrimônios automaticamente pelos dados da
            nota.
          </p>

          <button
            (click)="goToNotaFiscal()"
            class="mt-auto w-full rounded-md bg-brand-color py-3 cursor-pointer text-sm font-bold text-white
                   hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5
                   active:scale-95 active:translate-y-0
                   transition-all duration-200 shadow-sm"
          >
            Criar com Nota Fiscal
          </button>
        </div>

        <div
          class="anim-card-right group flex flex-col items-center rounded-xl border border-border px-6 py-7 text-center transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:-translate-y-1 cursor-default"
        >
          <div
            class="mb-5 transition-transform duration-300 group-hover:scale-110 group-hover:-translate-y-1"
          >
            <svg
              class="w-10 h-12 sm:w-[54px] sm:h-[64px] text-foreground"
              viewBox="0 0 54 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M2 2H30.5189L44.7783 15.3333V62H2V2Z"
                stroke="currentColor"
                stroke-width="4"
                stroke-linejoin="round"
              />
              <path
                d="M23.8674 2V15.3333H34.8012"
                stroke="currentColor"
                stroke-width="4"
                stroke-linejoin="round"
              />
              <path d="M10 32H26" stroke="#4B9475" stroke-width="4" stroke-linecap="round" />
              <path d="M10 45H24" stroke="#4B9475" stroke-width="4" stroke-linecap="round" />
              <path
                d="M32.4558 39.5L44.7563 24.5C46.3963 22.5 49.1298 22.5 50.7698 24.5C52.4099 26.5 52.4099 29.8333 50.7698 31.8333L38.4694 46.8333L31.0891 49.5L32.4558 39.5Z"
                stroke="#4B9475"
                stroke-width="4"
                stroke-linejoin="round"
              />
            </svg>
          </div>

          <h3 class="mb-2 text-base font-bold">Manual</h3>

          <p class="mb-6 text-xs sm:text-sm leading-relaxed text-muted-foreground flex-1">
            Preencha os dados do patrimônio manualmente através de um formulário.
          </p>

          <button
            (click)="goToManual()"
            class="mt-auto w-full rounded-md bg-brand-color py-3 cursor-pointer text-sm font-bold text-white
                   hover:brightness-110 hover:shadow-lg hover:-translate-y-0.5
                   active:scale-95 active:translate-y-0
                   transition-all duration-200 shadow-sm"
          >
            Criar manualmente
          </button>
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  exportAs: 'zardDemoDialogBasic',
})
export class ZardDemoDialogBasicInputComponent implements AfterViewInit {
  private dialogRef = inject(ZardDialogRef);
  private router = inject(Router);

  readonly X = X;

  close() {
    this.dialogRef.close();
  }

  goToManual() {
    this.dialogRef.close();
    this.router.navigate(['/create-patrimonio']);
  }

  goToNotaFiscal() {
    this.dialogRef.close();
    this.router.navigate(['/criapatrimonio']);
  }

  ngAfterViewInit(): void {}
}

@Component({
  selector: 'zard-create-patrimonio-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <z-button
      (click)="openDialog()"
      class="w-full sm:w-auto h-11 bg-brand-color hover:bg-brand-color/80 text-white transition-colors"
    >
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
export class ZardDemoDialogBasicComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  openDialog() {
    this.dialogService.create({
      zContent: ZardDemoDialogBasicInputComponent,
      zHideFooter: true,
      zWidth: '800px',
    });
  }
}

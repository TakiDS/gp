import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { environment } from 'src/environments/environment';
import { toast } from 'ngx-sonner';
import { LucideAngularModule, ShieldCheck, Upload, X, KeyRound, FileCheck } from 'lucide-angular';
import { ZardInputDirective } from '@/shared/components/input/input.directive';

@Component({
  selector: 'app-upload-certificado-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule, ZardInputDirective],
  styles: [
    `
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.95);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(14px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .anim-scale-in {
        animation: scale-in 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-fade-up {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .d-100 {
        animation-delay: 100ms;
      }
      .d-150 {
        animation-delay: 150ms;
      }
      .d-200 {
        animation-delay: 200ms;
      }
      .d-250 {
        animation-delay: 250ms;
      }
      .d-300 {
        animation-delay: 300ms;
      }

      .drop-zone.dragging {
        border-color: var(--primary);
        background-color: color-mix(in srgb, var(--primary) 8%, transparent);
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-6 py-6 sm:px-8 sm:py-7 anim-scale-in"
    >
      <div class="flex items-start justify-between mb-6 anim-fade-up">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"
          >
            <lucide-angular [img]="ShieldCheck" size="20" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-xl font-bold tracking-tight">Certificado Digital</h2>
            <p class="text-sm text-muted-foreground mt-0.5">
              Importe seu certificado A1 para leitura de notas fiscais.
            </p>
          </div>
        </div>
      </div>

      <div class="h-px bg-border mb-6 anim-fade-up d-100"></div>

      <form [formGroup]="form" (ngSubmit)="confirmar()" class="space-y-5">
        <div class="anim-fade-up d-150">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-2 block"
          >
            Arquivo do Certificado
          </label>

          <input
            #fileInput
            type="file"
            accept=".pfx,.p12"
            class="hidden"
            (change)="onFileSelected($event)"
          />

          <div
            class="drop-zone relative border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/30 transition-all"
            [class.border-primary]="arquivoSelecionado()"
            (click)="fileInput.click()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
          >
            @if (arquivoSelecionado()) {
              <div
                class="flex flex-col items-center gap-2 animate-in fade-in zoom-in-95 duration-300"
              >
                <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <lucide-angular [img]="FileCheck" size="22" class="text-primary"></lucide-angular>
                </div>
                <div>
                  <p class="text-sm font-bold text-foreground truncate max-w-[220px]">
                    {{ arquivoSelecionado()!.name }}
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">
                    {{ formatarTamanho(arquivoSelecionado()!.size) }}
                  </p>
                </div>
                <button
                  type="button"
                  (click)="removerArquivo($event)"
                  class="text-xs text-destructive hover:underline font-semibold mt-1 cursor-pointer"
                >
                  Remover arquivo
                </button>
              </div>
            } @else {
              <div class="flex flex-col items-center gap-2 text-muted-foreground">
                <div class="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                  <lucide-angular [img]="Upload" size="22" class="opacity-50"></lucide-angular>
                </div>
                <div>
                  <p class="text-sm font-semibold text-foreground">
                    Clique ou arraste o arquivo aqui
                  </p>
                  <p class="text-xs text-muted-foreground mt-0.5">Formatos aceitos: .pfx, .p12</p>
                </div>
              </div>
            }
          </div>

          @if (mostrarErroArquivo) {
            <p class="text-destructive text-xs mt-1.5 font-medium animate-in fade-in duration-200">
              Selecione um arquivo .pfx ou .p12 válido.
            </p>
          }
        </div>

        <div class="anim-fade-up d-200">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground mb-2 block"
          >
            Senha do Certificado
          </label>
          <div class="relative group">
            <lucide-angular
              [img]="KeyRound"
              size="16"
              class="absolute left-2 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none"
            ></lucide-angular>
            <input
              type="password"
              z-input
              formControlName="senha"
              placeholder="Digite a senha do certificado"
              class="w-full h-11 pl-10 pr-4 bg-muted/30 border border-input rounded-lg text-sm text-foreground placeholder:text-muted-foreground/50 outline-none transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary"
              [class.border-destructive]="form.get('senha')?.invalid && form.get('senha')?.touched"
            />
          </div>
          @if (form.get('senha')?.touched && form.get('senha')?.invalid) {
            <p class="text-destructive text-xs mt-1.5 font-medium animate-in fade-in duration-200">
              Campo obrigatório.
            </p>
          }
        </div>

        <div
          class="anim-fade-up d-250 rounded-xl bg-muted/40 border border-border p-3.5 flex gap-3"
        >
          <lucide-angular
            [img]="ShieldCheck"
            size="16"
            class="text-primary mt-0.5 flex-shrink-0"
          ></lucide-angular>
          <p class="text-xs text-muted-foreground leading-relaxed">
            Seu certificado é usado apenas para leitura e importação de notas fiscais. Os dados são
            transmitidos de forma segura.
          </p>
        </div>

        <div
          class="flex flex-col sm:flex-row gap-3 justify-end pt-2 border-t border-border anim-fade-up d-300"
        >
          <button
            type="button"
            (click)="close()"
            class="w-full sm:w-auto h-11 px-6 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="loading()"
            class="w-full sm:w-auto h-11 px-6 rounded-xl bg-brand-color text-white text-sm font-bold shadow-sm hover:brightness-110 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading()) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Enviando...
            } @else {
              <lucide-angular [img]="Upload" size="15"></lucide-angular>
              Enviar Certificado
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class UploadCertificadoDialogComponent {
  private dialogRef = inject(ZardDialogRef);
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private readonly API_URL = environment.apiUrl;

  readonly ShieldCheck = ShieldCheck;
  readonly Upload = Upload;
  readonly X = X;
  readonly KeyRound = KeyRound;
  readonly FileCheck = FileCheck;

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Output() certificadoEnviado = new EventEmitter<void>();

  form: FormGroup = this.fb.group({
    senha: ['', Validators.required],
  });

  arquivoSelecionado = signal<File | null>(null);
  loading = signal(false);
  mostrarErroArquivo = false;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.setArquivo(input.files[0]);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.add('dragging');
  }

  onDragLeave(event: DragEvent): void {
    (event.currentTarget as HTMLElement).classList.remove('dragging');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    (event.currentTarget as HTMLElement).classList.remove('dragging');
    const file = event.dataTransfer?.files[0];
    if (file) this.setArquivo(file);
  }

  private setArquivo(file: File): void {
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (ext !== 'pfx' && ext !== 'p12') {
      this.mostrarErroArquivo = true;
      return;
    }
    this.mostrarErroArquivo = false;
    this.arquivoSelecionado.set(file);
  }

  removerArquivo(event: MouseEvent): void {
    event.stopPropagation();
    this.arquivoSelecionado.set(null);
    if (this.fileInput?.nativeElement) this.fileInput.nativeElement.value = '';
  }

  formatarTamanho(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  confirmar(): void {
    if (!this.arquivoSelecionado()) {
      this.mostrarErroArquivo = true;
    }
    if (this.form.invalid || !this.arquivoSelecionado()) {
      this.form.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('arquivo', this.arquivoSelecionado()!);
    formData.append('senha', this.form.value.senha);

    const token = localStorage.getItem('auth-token');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    this.loading.set(true);

    this.http
      .post(`${this.API_URL}/certificados`, formData, { headers, responseType: 'text' })
      .subscribe({
        next: () => {
          this.loading.set(false);
          toast.success('Certificado importado!', {
            description: 'O sistema já está usando o novo certificado.',
          });
          this.certificadoEnviado.emit();
          this.dialogRef.close();
        },
        error: (err) => {
          this.loading.set(false);
          toast.error('Erro ao importar', {
            description: err.error || 'Não foi possível importar o certificado.',
          });
        },
      });
  }

  close(): void {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zard-certificado-button',
  standalone: true,
  imports: [ZardButtonComponent, ZardDialogModule, LucideAngularModule],
  template: `
    <button
      type="button"
      (click)="openDialog()"
      class="inline-flex items-center gap-2 h-10 px-4 rounded-xl border border-border bg-card text-muted-foreground text-sm font-semibold hover:text-foreground hover:border-primary/40 hover:bg-muted/60 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer whitespace-nowrap"
    >
      <lucide-angular [img]="ShieldCheck" size="16" class="text-primary"></lucide-angular>
      Configurar Certificado Digital
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCertificadoButtonComponent {
  readonly ShieldCheck = ShieldCheck;

  private dialogService = inject(ZardDialogService);

  @Output() aoCertificadoEnviado = new EventEmitter<void>();

  openDialog(): void {
    const dialogRef = this.dialogService.create({
      zContent: UploadCertificadoDialogComponent,
      zHideFooter: true,
      zWidth: 'min(95vw, 540px)',
    });

    const instance = dialogRef.componentInstance as UploadCertificadoDialogComponent;

    instance.certificadoEnviado.subscribe(() => {
      this.aoCertificadoEnviado.emit();
    });
  }
}

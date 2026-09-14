import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { ZardDialogModule } from '@/shared/components/dialog/dialog.component';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';
import { CommonModule, DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  inject,
  Output,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LucideAngularModule, Plus, Upload, FileText, Trash2 } from 'lucide-angular';

@Component({
  selector: 'zard-nota-dialog-input',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardDatePickerComponent,
    LucideAngularModule,
  ],
  providers: [DatePipe],
  template: `
    <div
      class="w-full max-h-[90vh] overflow-y-auto rounded-xl bg-background px-6 py-6 sm:px-8 text-foreground transition-colors duration-300 custom-scrollbar"
    >
      <div class="mb-6">
        <h2 class="text-xl font-bold tracking-tight">Nova Nota Fiscal</h2>
        <p class="mt-1 text-sm text-muted-foreground">
          Preencha os dados e anexe o arquivo da nota para processamento.
        </p>
      </div>

      <form [formGroup]="notaForm" (ngSubmit)="onSubmit()" class="space-y-5">
        <div class="flex flex-col gap-1.5">
          <label
            class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80"
            for="fornecedor"
          >
            Nome do Fornecedor
          </label>
          <input
            formControlName="fornecedor"
            class="h-11 w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            id="fornecedor"
            z-input
            placeholder="Ex: Razão Social Ltda"
          />
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80"
            for="cnpj"
          >
            CNPJ do Fornecedor
          </label>
          <input
            formControlName="cnpj"
            (input)="onCnpjInput($event)"
            class="h-11 w-full p-3 bg-background border border-border rounded-md focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            id="cnpj"
            z-input
            placeholder="00.000.000/0001-00"
          />
        </div>

        <div class="grid grid-cols-1 xs:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5">
            <label
              class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80"
              for="valorTotal"
            >
              Valor Total
            </label>
            <input
              formControlName="valorTotal"
              (input)="onValorInput($event)"
              class="h-11 w-full p-3 bg-background border border-border rounded-md"
              type="text"
              id="valorTotal"
              z-input
              placeholder="R$ 0,00"
            />
          </div>

          <div class="flex flex-col gap-1.5">
            <label
              class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80"
              for="quantidade"
            >
              Qtd. Itens
            </label>
            <input
              formControlName="quantidade"
              class="h-11 w-full p-3 bg-background border border-border rounded-md"
              id="quantidade"
              z-input
              type="number"
              placeholder="0"
            />
          </div>
        </div>

        <div class="flex flex-col gap-1.5">
          <label
            class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80"
            for="dataEmissao"
          >
            Data de Emissão
          </label>
          <z-date-picker
            formControlName="dataEmissao"
            zFormat="dd/MM/yyyy"
            placeholder="Selecione a data"
            zSize="lg"
            class="w-full"
          ></z-date-picker>
        </div>

        <div class="flex flex-col gap-2">
          <label class="text-[11px] uppercase font-bold tracking-wider text-muted-foreground/80">
            Anexo (PDF, XML, JPEG)
          </label>

          <input
            #fileInput
            type="file"
            class="hidden"
            accept=".pdf, .xml, .jpeg, .jpg"
            (change)="onFileSelected($event)"
          />

          <div
            *ngIf="!selectedFile"
            (click)="fileInput.click()"
            (dragover)="onDragOver($event)"
            (dragleave)="onDragLeave($event)"
            (drop)="onDrop($event)"
            class="flex flex-col items-center justify-center w-full py-8 border-2 border-dashed rounded-lg cursor-pointer transition-all group"
            [class.border-primary]="isDragging"
            [class.bg-primary/5]="isDragging"
            [class.border-border]="!isDragging"
            [class.hover:border-primary/50]="!isDragging"
          >
            <lucide-angular
              [img]="Upload"
              size="20"
              class="text-muted-foreground group-hover:text-primary mb-2"
            ></lucide-angular>
            <p class="text-xs text-muted-foreground">
              <span class="font-bold text-primary">Clique para enviar</span>
              <span class="hidden sm:inline"> ou arraste o arquivo</span>
            </p>
          </div>

          <div
            *ngIf="selectedFile"
            class="flex items-center justify-between p-3 bg-muted/50 border border-border rounded-lg"
          >
            <div class="flex items-center gap-3 overflow-hidden">
              <lucide-angular
                [img]="FileText"
                size="18"
                class="text-primary shrink-0"
              ></lucide-angular>
              <div class="flex flex-col overflow-hidden text-xs">
                <span class="font-semibold truncate max-w-[120px] sm:max-w-[200px]">{{
                  selectedFile.name
                }}</span>
                <span class="text-muted-foreground">{{ formatBytes(selectedFile.size) }}</span>
              </div>
            </div>
            <button
              type="button"
              (click)="removeFile()"
              class="p-1.5 text-destructive hover:bg-destructive/10 rounded-full transition-colors"
            >
              <lucide-angular [img]="Trash2" size="16"></lucide-angular>
            </button>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3 pt-4">
          <button
            (click)="close()"
            type="button"
            class="flex-1 rounded-md bg-muted px-4 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted/80 transition-colors cursor-pointer order-2 sm:order-1"
          >
            Cancelar
          </button>

          <button
            type="submit"
            class="flex-[2] rounded-md bg-brand-color hover:bg-brand-color/90 text-white py-2.5 text-sm font-bold shadow-sm disabled:opacity-50 transition-all cursor-pointer order-1 sm:order-2"
            [disabled]="loading || !notaForm.valid || !selectedFile"
          >
            {{ loading ? 'Enviando...' : 'Inserir Nota Fiscal' }}
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardNotaDialogBasicInputComponent {
  readonly Upload = Upload;
  readonly FileText = FileText;
  readonly Trash2 = Trash2;

  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef);
  private notaService = inject(NotaFiscalService);
  private datePipe = inject(DatePipe);

  @Output() notaCriada = new EventEmitter<any>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  loading = false;
  selectedFile: File | null = null;
  showFileError = false;

  isDragging = false;

  notaForm: FormGroup = this.fb.group({
    fornecedor: ['', [Validators.required, Validators.minLength(3)]],
    cnpj: ['', Validators.required],
    valorTotal: ['', Validators.required],
    dataEmissao: ['', Validators.required],
    quantidade: ['', Validators.required],
  });

  onFileSelected(event: any) {
    const file: File = event.target.files?.[0];
    if (file) {
      this.handleFile(file);
    }
  }

  // ✅ NOVO: handlers de drag & drop (sem mexer na lógica de envio)
  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.handleFile(file);

      // mantém o input sincronizado (opcional, mas ajuda quando o usuário quer "trocar")
      if (this.fileInput?.nativeElement) {
        this.fileInput.nativeElement.value = '';
      }
    }
  }

  // ✅ NOVO: valida tipo + seta selectedFile (mantém seu fluxo)
  private handleFile(file: File) {
    const allowed = ['application/pdf', 'text/xml', 'application/xml', 'image/jpeg'];

    // Alguns browsers podem mandar XML com type vazio; aceitamos pela extensão também
    const name = file.name.toLowerCase();
    const byExt =
      name.endsWith('.pdf') ||
      name.endsWith('.xml') ||
      name.endsWith('.jpg') ||
      name.endsWith('.jpeg');
    const byType = allowed.includes(file.type);

    if (!byType && !byExt) {
      // se quiser, pode mostrar mensagem depois; aqui só impede
      this.selectedFile = null;
      this.showFileError = true;
      return;
    }

    this.selectedFile = file;
    this.showFileError = false;
  }

  removeFile() {
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  formatBytes(bytes: number, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  onCnpjInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');
    if (value.length > 14) value = value.substring(0, 14);

    value = value
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2');

    this.notaForm.get('cnpj')?.patchValue(value, { emitEvent: false });
  }

  onValorInput(event: any) {
    let value = event.target.value.replace(/\D/g, '');

    if (!value) {
      this.notaForm.get('valorTotal')?.patchValue('', { emitEvent: false });
      return;
    }

    const numberValue = Number(value) / 100;

    const formatted = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numberValue);

    this.notaForm.get('valorTotal')?.patchValue(formatted, { emitEvent: false });
  }

  onSubmit() {
    if (!this.selectedFile) {
      this.showFileError = true;
      return;
    }

    if (this.notaForm.valid) {
      this.loading = true;

      const dadosFormulario = this.notaForm.value;

      const cnpjLimpo = dadosFormulario.cnpj.replace(/\D/g, '');

      const valorTotalLimpo = Number(dadosFormulario.valorTotal.replace(/\D/g, '')) / 100;

      const dataFormatada =
        this.datePipe.transform(dadosFormulario.dataEmissao, 'yyyy-MM-dd') || '';

      const dadosParaEnvio = {
        ...dadosFormulario,
        cnpj: cnpjLimpo,
        valorTotal: valorTotalLimpo,
        dataEmissao: dataFormatada,
      };

      this.notaService.create(dadosParaEnvio, this.selectedFile).subscribe({
        next: (notaCriada) => {
          this.notaCriada.emit(notaCriada);
          this.dialogRef.close();
        },
        error: (err) => {
          console.error('Erro ao criar nota', err);
          this.loading = false;
        },
      });
    } else {
      this.notaForm.markAllAsTouched();
    }
  }

  close() {
    this.dialogRef.close();
  }
}

@Component({
  selector: 'zard-create-nota-button',
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
      Inserir Nota Fiscal
    </z-button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ZardCreateNotaButtonComponent {
  readonly Plus = Plus;
  private dialogService = inject(ZardDialogService);

  @Output() aoCriarNota = new EventEmitter<any>();

  openDialog() {
    const dialogRef = this.dialogService.create({
      zContent: ZardNotaDialogBasicInputComponent,
      zHideFooter: true,
      zWidth: 'min(95vw, 640px)',
    });

    const instance = dialogRef.componentInstance as ZardNotaDialogBasicInputComponent;

    instance.notaCriada.subscribe((nota) => {
      this.aoCriarNota.emit(nota);
    });
  }
}

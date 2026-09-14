import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { toast } from 'ngx-sonner';

import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { ConfirmNotaDialogComponent } from 'src/components/dialogs/confirm-nota-dialog/confirm-nota-dialog';
import { ZardSucessDialogBasicInputComponent } from 'src/components/dialogs/sucess-create-patrimonio-dialog/sucess-create-patrimonio-dialog';
import { ZardProcessingNotaFiscalComponent } from 'src/components/dialogs/processing-create-patrimonio-dialog/processing-create-patrimonio-dialog';
import { ZardErrorCreatePatrimonioDialogComponent } from 'src/components/dialogs/error-create-patrimonio-dialog/error-create-patrimonio-dialog';

@Component({
  selector: 'app-create-patrimonio',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './create-patrimonio.html',
  styleUrl: './create-patrimonio.css',
})
export class CreatePatrimonio {
  private router = inject(Router);
  private dialogService = inject(ZardDialogService);
  private patrimonioService = inject(PatrimonioService);

  isDragging = false;
  selectedFile: File | null = null;
  isUploading = false;

  private readonly MAX_SIZE = 10 * 1024 * 1024;

  readonly recomendacoes = [
    'Use arquivos legíveis e completos',
    'Certifique-se que a Nota Fiscal contenha todos os itens',
    'Antes de selecionar o arquivo, verifique o tamanho',
    'Antes de selecionar NF em PDF, verifique se a mesma foi emitida no período de 180 dias',
  ];

  onDragEnter(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging = false;
    const file = e.dataTransfer?.files?.[0];
    if (file) this.handleFile(file);
  }

  onFileSelected(e: Event) {
    const input = e.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) this.handleFile(file);
    input.value = '';
  }

  private handleFile(file: File) {
    const nameLower = file.name.toLowerCase();

    const isXml = nameLower.endsWith('.xml') || file.type.includes('xml');
    const isPdf = nameLower.endsWith('.pdf') || file.type.includes('pdf');

    if (!isXml && !isPdf) {
      this.selectedFile = null;
      toast.error('Arquivo inválido', {
        description: 'Envie apenas arquivos XML ou PDF.',
      });
      return;
    }

    if (file.size > this.MAX_SIZE) {
      this.selectedFile = null;
      toast.error('Arquivo muito grande', {
        description: 'O tamanho máximo permitido é 10MB.',
      });
      return;
    }

    this.selectedFile = file;
  }

  removerArquivo() {
    this.selectedFile = null;
  }

  podeEnviar(): boolean {
    return !!this.selectedFile && !this.isUploading;
  }

  enviarNotaFiscal() {
    if (!this.selectedFile) {
      toast.error('Nenhum arquivo selecionado', {
        description: 'Selecione um arquivo XML ou PDF para continuar.',
      });
      return;
    }

    const dialogRef = this.dialogService.create({
      zContent: ConfirmNotaDialogComponent,
      zWidth: '500px',
      zHideFooter: true,
    });

    const instance = dialogRef.componentInstance as ConfirmNotaDialogComponent;

    instance.onConfirmar.subscribe((result: { categoria: string; local: string }) => {
      this.realizarUploadReal(result.categoria, result.local);
    });
  }

  private realizarUploadReal(categoriaId: string, localId: string) {
    if (!this.selectedFile) return;

    this.isUploading = true;

    const loadingRef = this.dialogService.create({
      zContent: ZardProcessingNotaFiscalComponent,
      zHideFooter: true,
      zWidth: '600px',
      zMaskClosable: false,
      zClosable: false,
    });

    this.patrimonioService.uploadNotaFiscal(this.selectedFile, categoriaId, localId).subscribe({
      next: (response: any) => {
        loadingRef.close();
        this.isUploading = false;
        this.selectedFile = null;

        this.dialogService.create({
          zContent: ZardSucessDialogBasicInputComponent,
          zHideFooter: true,
          zWidth: '600px',
          zData: response,
        });
      },
      error: (err) => {
        console.error('Erro ao enviar nota fiscal:', err);
        loadingRef.close();
        this.isUploading = false;

        this.dialogService.create({
          zContent: ZardErrorCreatePatrimonioDialogComponent,
          zHideFooter: true,
          zWidth: '600px',
        });
      },
    });
  }

  cancelar() {
    window.history.back();
  }
}

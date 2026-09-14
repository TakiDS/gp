import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';
import { ZardDialogComponent } from '@/shared/components/dialog/dialog.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { CommonModule } from '@angular/common';
import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FileCheck, ChevronDown, LucideAngularModule } from 'lucide-angular';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { CategoriaApiResponse } from '../list-categories/list-categories';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { Local } from '@/shared/core/models/local.model';
import { LocalService } from '@/shared/core/services/local/local.service';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';
import { ZardProcessingPatrimonioComponent } from 'src/components/dialogs/processing-patrimonio/processing-patrimonio';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { forkJoin } from 'rxjs';
import {
  PatrimonioCreatedData,
  ZardPatrimonioCreatedDialogComponent,
} from 'src/components/dialogs/created-patrimonio-dialog/created-patrimonio-dialog';

@Component({
  selector: 'app-create-patrimonio-form',
  standalone: true,
  imports: [
    ZardSelectComponent,
    ZardInputDirective,
    ZardDatePickerComponent,
    LucideAngularModule,
    ReactiveFormsModule,
    ZardDialogComponent,
    CommonModule,
    RouterLink,
    ZardSelectImports,
  ],
  templateUrl: './create-patrimonio-form.html',
  styleUrl: './create-patrimonio-form.css',
})
export class CreatePatrimonioForm implements OnInit {
  private fb = inject(FormBuilder);

  patrimonioForm: FormGroup = this.fb.group({
    descricao: ['', [Validators.required, Validators.minLength(3)]],
    dataAquisicao: ['', Validators.required],
    valorAquisicao: ['', Validators.required],
    uuid_categoria: ['', Validators.required],
    uuid_localizacao: ['', Validators.required],
    quantidade: [1, [Validators.required, Validators.min(1)]],
    uuid_notaFiscalId: [''],
    numSerie: ['', Validators.pattern(/^[a-zA-Z0-9\-\/]*$/)],
  });

  private readonly categoryService = inject(CategoryService);
  private readonly patrimonioService = inject(PatrimonioService);
  private readonly notaFiscalService = inject(NotaFiscalService);
  private readonly localService = inject(LocalService);
  private readonly dialogService = inject(ZardDialogService);

  readonly categories = signal<CategoriaApiResponse[]>([]);
  readonly locais = signal<Local[]>([]);
  readonly notasFiscais = signal<any[]>([]);

  selectedValue = '';
  readonly ChevronDown = ChevronDown;
  readonly FileCheck = FileCheck;

  isDragging = false;
  loading = false;
  errorMessage = '';
  selectedFileName = '';
  ready = signal(false);

  selectedFileSizeMB = '';
  private selectedFile: File | null = null;

  ngOnInit() {
    this.carregarDados();
    this.setupExclusividadeQuantidadeSerie();
  }

  private carregarDados() {
    this.ready.set(false);

    forkJoin({
      categorias: this.categoryService.listAll(),
      locais: this.localService.listAll(),
      notasFiscais: this.notaFiscalService.listAll(),
    }).subscribe({
      next: (res: any) => {
        this.categories.set(
          res.categorias.content.map((item: any) => ({
            uuid: item.uuid,
            nome: item.nome,
            descricao: item.descricao,
            totalPatrimonio: item.totalPatrimonio,
            patrimonioGeral: item.patrimonioGeral,
          })),
        );
        this.locais.set(
          res.locais.content.map((item: any) => ({
            uuid: item.uuid,
            local: item.local,
            dataCriacao: item.dataCriacao,
            totalPatrimonio: item.totalPatrimonio,
          })),
        );
        this.notasFiscais.set(
          (res.notasFiscais?.content ?? []).map((item: any) => ({
            uuid: item.uuid,
            codigoNota: item.codigoNota,
            fornecedor: item.fornecedor,
            status: item.status,
          })),
        );
        this.ready.set(true);
      },
      error: (err) => {
        console.error('Erro ao carregar dados das APIs:', err);
        this.ready.set(true);
      },
    });
  }

  onInputChange(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    let regex: RegExp;
    let value = input.value;

    if (controlName === 'numSerie') {
      regex = /[^a-zA-Z0-9\-\/]/g;
      value = value.replace(regex, '').toUpperCase();
    } else {
      regex = /[^a-zA-ZÀ-ÿ0-9\s.\-\/]/g;
      value = value.replace(regex, '');
    }

    if (input.value !== value) {
      input.value = value;
      this.patrimonioForm.get(controlName)?.setValue(value, { emitEvent: false });
    }
  }

  private setupExclusividadeQuantidadeSerie() {
    const quantidadeCtrl = this.patrimonioForm.get('quantidade');
    const numSerieCtrl = this.patrimonioForm.get('numSerie');

    quantidadeCtrl?.valueChanges.subscribe((value) => {
      if (value > 1) {
        numSerieCtrl?.disable({ emitEvent: false });
        numSerieCtrl?.setValue('', { emitEvent: false });
      } else {
        numSerieCtrl?.enable({ emitEvent: false });
      }
    });

    numSerieCtrl?.valueChanges.subscribe((value) => {
      if (value && value.trim().length > 0) {
        quantidadeCtrl?.setValue(1, { emitEvent: false });
        quantidadeCtrl?.disable({ emitEvent: false });
      } else {
        quantidadeCtrl?.enable({ emitEvent: false });
      }
    });
  }

  formatarMoeda(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');

    if (!value) {
      this.patrimonioForm.get('valorAquisicao')?.setValue('');
      return;
    }
    let numericValue = (parseInt(value, 10) / 100).toFixed(2);
    let formatted = numericValue.replace('.', ',');
    formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    this.patrimonioForm.get('valorAquisicao')?.setValue(`R$ ${formatted}`);
  }

  onSubmit() {
    if (this.patrimonioForm.invalid) {
      this.patrimonioForm.markAllAsTouched();
      return;
    }

    const processingDialog = this.dialogService.create({
      zContent: ZardProcessingPatrimonioComponent,
      zHideFooter: true,
      zWidth: '600px',
      zClosable: false,
    });

    this.loading = true;
    const formValues = { ...this.patrimonioForm.getRawValue() };
    if (typeof formValues.valorAquisicao === 'string') {
      const valorLimpo = formValues.valorAquisicao.replace(/[^\d,-]/g, '').replace(',', '.');
      formValues.valorAquisicao = parseFloat(valorLimpo);
    }

    this.patrimonioService.create(formValues).subscribe({
      next: (res) => {
        processingDialog.close();
        this.loading = false;
        this.patrimonioForm.reset();

        const dialogData: PatrimonioCreatedData = {
          nome: formValues.descricao,
          quantidade: formValues.quantidade || 1,
        };

        this.dialogService.create({
          zContent: ZardPatrimonioCreatedDialogComponent,
          zData: dialogData,
          zHideFooter: true,
          zWidth: 'min(480px, calc(100vw - 32px))',
        });
      },
      error: (err) => {
        console.error('Erro ao criar patrimônio:', err);
        processingDialog.close();
        this.loading = false;
      },
    });
  }
}

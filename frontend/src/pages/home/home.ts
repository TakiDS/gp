import { Component, computed, signal, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Plus, Tags, Search, Printer } from 'lucide-angular';
import { debounceTime, finalize, Subject } from 'rxjs';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardToastComponent } from '@/shared/components/toast/toast.component';
import { ZardDemoDialogBasicComponent } from 'src/components/dialogs/create-patrimonio-dialog/create-patrimonio-dialog';

import { ZardDialogService } from '@/shared/components/dialog/dialog.service';

import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { LocalService } from '@/shared/core/services/local/local.service';
import { CategoriaApiResponse } from '../list-categories/list-categories';
import { Local } from '@/shared/core/models/local.model';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { ZPrintVariantModalComponent } from 'src/components/dialogs/variant-modal-dialog/variant-modal-dialog';

interface PatrimonioTela {
  id: string;
  numero: string;
  descricao: string;
  categoria: string;
  local: string;
  status: string;
  statusLabel: string;
  notaFiscal: string;
  /** URL fundo branco / QR preto */
  etiquetaUrlPreta: string;
  /** URL fundo preto / QR branco */
  etiquetaUrlBranca: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ZardButtonComponent,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectImports,
    ZardPaginationCustomComponent,
    ZardToastComponent,
    RouterLink,
    ZardDemoDialogBasicComponent,
    ZardSkeletonComponent,
    ZPrintVariantModalComponent,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  readonly Plus = Plus;
  readonly Tags = Tags;
  readonly Search = Search;
  readonly Printer = Printer;

  private readonly patrimonioService = inject(PatrimonioService);
  private readonly categoryService = inject(CategoryService);
  private readonly localService = inject(LocalService);
  private readonly dialogService = inject(ZardDialogService);

  readonly patrimonioForm = new FormGroup({
    search: new FormControl<string>(''),
    categoria: new FormControl<string>('todos'),
    status: new FormControl<string>('todos'),
    local: new FormControl<string>('todos'),
    notaFiscal: new FormControl<string>('todas'),
  });

  filtros = {
    categoria: '',
    estado: '',
    local: '',
    termoBusca: '',

    possuiNota: '',
  };

  readonly patrimonios = signal<PatrimonioTela[]>([]);
  readonly categories = signal<CategoriaApiResponse[]>([]);
  readonly locais = signal<Local[]>([]);
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);
  readonly isSelectionMode = signal(false);
  readonly selectedItems = signal<PatrimonioTela[]>([]);

  private busca$ = new Subject<void>();

  readonly selectedIds = computed(() => this.selectedItems().map((item) => item.id));

  readonly itensPorPagina = 7;
  readonly paginaAtual = signal(1);

  readonly patrimoniosPaginados = computed(() => this.patrimonios());

  readonly totalPaginas = computed(() => Math.ceil(this.totalElements() / this.itensPorPagina));

  constructor() {
    this.patrimonioForm.valueChanges.subscribe(() => this.paginaAtual.set(1));
  }

  ngOnInit() {
    this.patrimonioForm.valueChanges.subscribe((value) => {
      this.filtros = {
        categoria: value.categoria !== 'todos' ? (value.categoria ?? '') : '',
        estado: value.status !== 'todos' ? (value.status ?? '') : '',
        local: value.local !== 'todos' ? (value.local ?? '') : '',
        termoBusca: value.search ?? '',

        possuiNota: value.notaFiscal !== 'todas' ? (value.notaFiscal ?? '') : '',
      };
      this.paginaAtual.set(1);
      this.busca$.next();
    });

    this.busca$.pipe(debounceTime(400)).subscribe(() => this.buscarPatrimonios());

    this.buscarPatrimonios();
    this.carregarCategorias();
    this.carregarLocais();
  }

  readonly isAllSelected = computed(() => {
    const items = this.patrimoniosPaginados();
    return items.length > 0 && items.every((item) => this.selectedIds().includes(item.id));
  });

  toggleSelection(id: string) {
    const current = this.selectedItems();
    const itemNaPagina = this.patrimoniosPaginados().find((p) => p.id === id);
    if (current.some((i) => i.id === id)) {
      this.selectedItems.set(current.filter((i) => i.id !== id));
    } else if (itemNaPagina) {
      this.selectedItems.set([...current, itemNaPagina]);
    }
  }

  toggleAll() {
    const itemsOnPage = this.patrimoniosPaginados();
    const current = this.selectedItems();
    if (this.isAllSelected()) {
      const pageIds = itemsOnPage.map((p) => p.id);
      this.selectedItems.set(current.filter((i) => !pageIds.includes(i.id)));
    } else {
      const itemsToAdd = itemsOnPage.filter((p) => !current.some((c) => c.id === p.id));
      this.selectedItems.set([...current, ...itemsToAdd]);
    }
  }

  toggleSelectionMode() {
    this.isSelectionMode.set(!this.isSelectionMode());
    if (!this.isSelectionMode()) this.selectedItems.set([]);
  }

  imprimirSelecionados() {
    const ref = this.dialogService.create({
      zContent: ZPrintVariantModalComponent,
      zHideFooter: true,
      zWidth: 'min(460px, calc(100vw - 32px))',
      zClosable: true,
    });

    const instance = ref.componentInstance as ZPrintVariantModalComponent;

    instance?.varianteSelecionada.subscribe((variante) => {
      ref.close(variante);
      this.gerarDocumentoImpressao(this.selectedItems(), variante);
    });

    instance?.cancelado.subscribe(() => ref.close(null));
  }

  gerarDocumentoImpressao(patrimonios: PatrimonioTela[], variante: 'preta' | 'branca') {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataHoraAtual = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const etiquetasHtml = patrimonios
      .map((p) => {
        const url = variante === 'preta' ? p.etiquetaUrlPreta : p.etiquetaUrlBranca;
        return `
          <div class="etiqueta">
            <img src="${this.getPreviewUrl(url)}" alt="Etiqueta ${p.numero}" />
          </div>`;
      })
      .join('');

    const htmlContent = `
      <html>
        <head>
          <title>Impressão em Lote - WebAcademy</title>
          <style>
            @page { size: A4; margin: 0; }
            body { font-family: Arial, sans-serif; padding: 10mm 15mm; }
            .header-print { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 2px; }
            .divider { border-top: 0.5pt solid #000; margin-bottom: 25px; }
            .container-etiquetas { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm 4mm; }
            .etiqueta { width: 88mm; display: flex; page-break-inside: avoid; }
            .etiqueta img { width: 100%; height: auto; display: block; }
          </style>
        </head>
        <body>
          <div class="header-print">
            <span>${dataHoraAtual}</span>
            <span>Relatório de Etiquetas - WebAcademy</span>
          </div>
          <div class="divider"></div>
          <div class="container-etiquetas">${etiquetasHtml}</div>
          <script>window.onload = () => { setTimeout(() => { window.print(); }, 500); };</script>
        </body>
      </html>`;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  getPreviewUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder.png';
    return url.replace('/raw/upload/', '/image/upload/').replace('.pdf', '.jpg');
  }

  buscarPatrimonios() {
    this.isLoading.set(true);
    const params = { ...this.filtros, page: this.paginaAtual() - 1, size: this.itensPorPagina };

    this.patrimonioService
      .filtrarPatrimonios(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data: any) => {
          const lista = data?.content || [];
          const total = data?.totalElements || 0;
          this.patrimonios.set(this.mapToPatrimonioTela(lista));
          this.totalElements.set(total);
        },
        error: (err) => {
          this.patrimonios.set([]);
          this.totalElements.set(0);
          console.error('Erro na busca:', err);
        },
      });
  }

  private mapToPatrimonioTela(content: any[]): PatrimonioTela[] {
    if (!content) return [];
    const statusLabelMap: Record<string, string> = {
      GUARDADO: 'Guardado',
      USO: 'Em uso',
      DEFEITO: 'Defeito',
      EMPRESTIMO: 'Empréstimo',
      MANUTENCAO: 'Em manutenção',
      EXTRAVIADO: 'Extraviado',
      BAIXA: 'Baixa',
      DOACAO: 'Doação',
    };

    return content.map((item: any) => ({
      id: item.uuid,
      numero: item.numPatrimonio || 'S/N',
      descricao: item.patrimonioGeral?.descricao || 'Sem descrição',
      categoria: item.patrimonioGeral?.categoria?.nome || 'Sem Categoria',
      local: item.localizacao?.local || 'Sem Local',
      status: item.estado,
      statusLabel: statusLabelMap[item.estado] ?? item.estado,
      notaFiscal: item.patrimonioGeral?.notaFiscal ? 'Com Nota' : 'Sem Nota',
      etiquetaUrlPreta: item.etiquetaUrlPreta ?? '',
      etiquetaUrlBranca: item.etiquetaUrlBranca ?? '',
    }));
  }

  private carregarCategorias() {
    this.categoryService.listAll().subscribe({
      next: (res: any) => {
        this.categories.set(
          res.content.map((item: any) => ({
            uuid: item.uuid,
            nome: item.nome,
            descricao: item.descricao,
            totalPatrimonio: item.totalPatrimonio,
          })),
        );
      },
    });
  }

  private carregarLocais() {
    this.localService.listAll().subscribe({
      next: (res: any) => {
        this.locais.set(
          res.content.map((item: any) => ({
            uuid: item.uuid,
            local: item.local,
            totalPatrimonio: item.totalPatrimonio,
          })),
        );
      },
    });
  }

  onPaginaChange(page: number) {
    this.paginaAtual.set(page);
    this.buscarPatrimonios();
  }

  setManualValue(controlName: string, value: string) {
    this.patrimonioForm.get(controlName)?.setValue(value);
    setTimeout(() => document.body.click());
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'GUARDADO':
        return 'bg-teal-500/10 text-teal-400';
      case 'USO':
        return 'bg-amber-500/10 text-amber-400';
      case 'DEFEITO':
        return 'bg-red-500/10 text-red-400';
      case 'EMPRESTIMO':
        return 'bg-sky-500/10 text-sky-400';
      case 'MANUTENCAO':
        return 'bg-purple-500/10 text-purple-400';
      case 'EXTRAVIADO':
        return 'bg-rose-500/10 text-rose-400';
      case 'BAIXA':
        return 'bg-gray-500/10 text-gray-400';
      case 'DOACAO':
        return 'bg-cyan-500/10 text-cyan-400';
      default:
        return 'bg-gray-500/10 text-gray-400';
    }
  }

  onFiltroChange() {
    this.paginaAtual.set(1);
    this.buscarPatrimonios();
  }
  onBuscaChange() {
    this.busca$.next();
  }
}

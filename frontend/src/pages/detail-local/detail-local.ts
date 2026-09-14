import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  House,
  MapPin,
  ReceiptCent,
  Tag,
  Receipt,
  Plus,
  ArrowLeftRight,
  PieChart,
  Search,
  ClipboardCheck,
  Loader2,
} from 'lucide-angular';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
} from 'ng-apexcharts';
import { CHART_CONSTANTS } from '../../app/shared/core/config/chart-colors';
import { MoveMultiplePatrimoniosButtonComponent } from 'src/components/dialogs/move-multiple-patrimonios-dialog/move-multiple-patrimonios-dialog';
import { EditLocalButtonComponent } from 'src/components/dialogs/edit-local-dialog/edit-local-dialog';
import { LocalService } from '@/shared/core/services/local/local.service';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
};

export interface PatrimonioView {
  uuid: string;
  id: string;
  descricao: string;
  categoria: string;
  notaFiscal: string;
  status: string;
  selected: boolean;
}

export interface PatrimonioItemResponse {
  uuid: string;
  numPatrimonio: string;
  estado: string;
  patrimonioGeral: {
    id: string;
    descricao: string;
    categoria: {
      uuid: string;
      nome: string;
    };
    notaFiscal: {
      codigoNota: string;
      uuid?: string;
    };
  };
}

export interface LocalDetailResponse {
  uuid: string;
  local: string;
  totalPatrimonio: number | string;
  patrimonio: PatrimonioItemResponse[];
}

@Component({
  selector: 'app-detail-local',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    NgApexchartsModule,
    ZardPaginationCustomComponent,
    ZardBreadcrumbImports,
    MoveMultiplePatrimoniosButtonComponent,
    EditLocalButtonComponent,
    ZardSkeletonComponent,
  ],
  templateUrl: './detail-local.html',
})
export class DetailLocal implements OnInit {
  private readonly localService = inject(LocalService);
  private readonly route = inject(ActivatedRoute);

  readonly House = House;
  readonly MapPin = MapPin;
  readonly ReceiptCent = ReceiptCent;
  readonly Tag = Tag;
  readonly Receipt = Receipt;
  readonly Plus = Plus;
  readonly ArrowLeftRight = ArrowLeftRight;
  readonly PieChart = PieChart;
  readonly Search = Search;
  readonly ClipboardCheck = ClipboardCheck;
  readonly Loader2 = Loader2;

  isGeneratingAuditoria = signal(false);

  readonly nomeLocal = signal<string>('Carregando...');
  readonly currentUuid = signal<string>('');
  readonly patrimonios = signal<PatrimonioView[]>([]);
  readonly termoBusca = signal<string>('');
  readonly currentPage = signal(1);
  readonly itemsPerPage = 7;

  readonly totalItensLocal = signal<number>(0);

  isSelectionMode = signal(false);

  private normalizar(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  readonly filteredPatrimonios = computed(() => {
    const list = this.patrimonios();
    const termo = this.normalizar(this.termoBusca().trim());

    if (!termo) return list;

    return list.filter(
      (item) =>
        (item.descricao && this.normalizar(item.descricao).includes(termo)) ||
        (item.id && this.normalizar(item.id).includes(termo)) ||
        (item.notaFiscal && this.normalizar(item.notaFiscal).includes(termo)) ||
        (item.categoria && this.normalizar(item.categoria).includes(termo)),
    );
  });

  gerarAuditoria() {
    const uuid = this.currentUuid();
    if (!uuid) return;

    this.isGeneratingAuditoria.set(true);

    this.localService.gerarRelatorioAuditoria(uuid).subscribe({
      next: (arquivo: Blob) => {
        const url = window.URL.createObjectURL(arquivo);
        window.open(url, '_blank');
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
        this.isGeneratingAuditoria.set(false);
      },
      error: (err) => {
        console.error('Erro ao processar o PDF:', err);
        this.isGeneratingAuditoria.set(false);
      },
    });
  }

  readonly paginatedPatrimonios = computed(() => {
    const items = this.filteredPatrimonios();
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  });

  readonly totalFiltrados = computed(() => this.filteredPatrimonios().length);

  readonly totalPages = computed(() => {
    return Math.ceil(this.totalFiltrados() / this.itemsPerPage) || 1;
  });

  toggleSelectionMode() {
    this.isSelectionMode.set(!this.isSelectionMode());
    if (!this.isSelectionMode()) {
      this.patrimonios.update((list) => list.map((p) => ({ ...p, selected: false })));
    }
  }

  toggleSelection(item: PatrimonioView) {
    this.patrimonios.update((list) =>
      list.map((p) => (p.uuid === item.uuid ? { ...p, selected: !p.selected } : p)),
    );
  }

  toggleAll(event: any) {
    const isChecked = event.target.checked;

    const pageUuids = new Set(this.paginatedPatrimonios().map((p) => p.uuid));

    this.patrimonios.update((list) =>
      list.map((p) => (pageUuids.has(p.uuid) ? { ...p, selected: isChecked } : p)),
    );
  }

  readonly isAllSelected = computed(() => {
    const pagina = this.paginatedPatrimonios();
    if (pagina.length === 0) return false;
    return pagina.every((p) => p.selected);
  });

  readonly selectedCount = computed(() => this.patrimonios().filter((p) => p.selected).length);

  readonly chartData = computed(() => {
    const lista = this.filteredPatrimonios();

    if (lista.length === 0) return { series: [], labels: [], colors: [] };

    const contagem: Record<string, number> = {};
    lista.forEach((item) => {
      const cat = item.categoria || 'Sem Categoria';
      contagem[cat] = (contagem[cat] || 0) + 1;
    });

    const todosStats = Object.keys(contagem)
      .map((key) => ({ label: key, qtd: contagem[key] }))
      .sort((a, b) => b.qtd - a.qtd);

    let statsFinais = [];

    if (todosStats.length <= CHART_CONSTANTS.MAX_SLICES) {
      statsFinais = todosStats;
    } else {
      const topItems = todosStats.slice(0, CHART_CONSTANTS.MAX_SLICES);
      const restoItems = todosStats.slice(CHART_CONSTANTS.MAX_SLICES);
      const qtdOutros = restoItems.reduce((acc, item) => acc + item.qtd, 0);
      statsFinais = [...topItems, { label: 'Outros', qtd: qtdOutros, isOutros: true }];
    }

    return {
      series: statsFinais.map((s) => s.qtd),
      labels: statsFinais.map((s) => s.label),
      colors: statsFinais.map((s, i) =>
        (s as any).isOutros
          ? CHART_CONSTANTS.COLOR_OTHER
          : CHART_CONSTANTS.PALETTE[i % CHART_CONSTANTS.PALETTE.length],
      ),
    };
  });

  readonly chartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 250,
      fontFamily: 'inherit',
      animations: { enabled: true },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '24px',
              fontWeight: 600,
              color: 'currentColor',
              offsetY: 8,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '14px',
              color: 'currentColor',
              formatter: function (w: any) {
                return w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
              },
            },
          },
        },
      },
    },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const uuid = params.get('uuid');
      if (uuid) {
        this.currentUuid.set(uuid);
        this.carregarDetalhes(uuid);
      }
    });
  }

  reloadData() {
    const uuid = this.currentUuid();
    if (uuid) {
      this.carregarDetalhes(uuid);
    }
  }

  private carregarDetalhes(id: string) {
    this.localService.listLocal(id).subscribe({
      next: (data: LocalDetailResponse) => {
        this.nomeLocal.set(data.local);

        const listaMapeada: PatrimonioView[] = (data.patrimonio || []).map((item) => ({
          uuid: item.uuid,
          id: item.numPatrimonio || 'S/N',
          descricao: item.patrimonioGeral?.descricao || 'Sem descrição',
          categoria: item.patrimonioGeral?.categoria?.nome || 'Outros',
          notaFiscal: item.patrimonioGeral?.notaFiscal?.codigoNota,
          status: this.formatarStatus(item.estado),
          selected: false,
        }));

        this.patrimonios.set(listaMapeada);

        this.totalItensLocal.set(Number(data.totalPatrimonio) || listaMapeada.length);

        this.currentPage.set(1);
        this.isSelectionMode.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do local:', err);
        this.nomeLocal.set('Local não encontrado');
      },
    });
  }

  updateLocalName(newName: string) {
    this.nomeLocal.set(newName);
  }

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }

  onSearchChange(texto: string) {
    this.termoBusca.set(texto);
    this.currentPage.set(1);
  }

  private formatarStatus(status: string): string {
    if (!status) return 'Indefinido';
    const lower = status.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  getStatusClass(status: string): string {
    const s = status?.toUpperCase();
    switch (s) {
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

  getStatusDotColorItem(status: string): string {
    const s = status?.toUpperCase();
    switch (s) {
      case 'GUARDADO':
        return 'bg-[#488479]';
      case 'USO':
      case 'EM USO':
        return 'bg-[#D4A340]';
      case 'DEFEITO':
        return 'bg-[#FF1F40]';
      case 'MANUTENCAO':
      case 'MANUTENÇÃO':
        return 'bg-[#7E22CE]';
      case 'EMPRESTIMO':
      case 'EMPRÉSTIMO':
        return 'bg-[#0369A1]';
      default:
        return 'bg-gray-500';
    }
  }
}

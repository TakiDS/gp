import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink, RouterModule } from '@angular/router';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { CHART_CONSTANTS } from '../../app/shared/core/config/chart-colors';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexChart,
  ApexResponsive,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
  ApexTooltip,
} from 'ng-apexcharts';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import {
  House,
  MapPin,
  Tag,
  CalendarDays,
  Receipt,
  BadgeDollarSign,
  MoreHorizontal,
  LucideAngularModule,
  Search,
  PieChart,
  DollarSign,
} from 'lucide-angular';
import { ZardDeleteComodatoDialogComponent } from 'src/components/dialogs/confirm-delete-comodato-dialog/confirm-delete-comodato-dialog';
import { ZardDeletePatrimonioButtonComponent } from 'src/components/dialogs/delete-patrimonio-dialog/delete-patrimonio-dialog';
import { ZardCreateCategoryButtonComponent } from 'src/components/dialogs/create-category-dialog/create-category-dialog';
import { DeleteCategoryButtonComponent } from 'src/components/dialogs/delete-category-dialog/delete-category-dialog';
import { EditCategoriaButtonComponent } from 'src/components/dialogs/edit-category-dialog/edit-category-dialog';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { debounceTime, finalize, Subject } from 'rxjs';

export type ChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  responsive: ApexResponsive[];
  labels: any;
  colors: string[];
  legend: ApexLegend;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  tooltip: ApexTooltip;
};

interface PatrimonioGeral {
  id: string;
  descricao: string;
  dataAquisicao: string;
  valorAquisicao: number;
  notaFiscal: {
    uuid: string;
    codigoNota: string;
  } | null;
  categoria: {
    uuid: string;
    nome: string;
  };
}

interface Localizacao {
  uuid: string;
  local: string;
}

export interface PatrimonioItem {
  uuid: string;
  numPatrimonio: string;
  numSerie: string | null;
  estado: string;
  localizacao: Localizacao;
  patrimonioGeral: PatrimonioGeral;
}

export interface CategoryDetailResponse {
  uuid: string;
  nome: string;
  descricao: string;
  totalPatrimonio: number;
  patrimonio: {
    content: PatrimonioItem[];
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
}

export interface DashboardCategoryResponse {
  patrimonios: {
    valorTotal: number;
  };
  graficoCategoria: Array<{
    categoria: string;
    totalValor: number;
  }>;
}

@Component({
  selector: 'app-category-detail',
  standalone: true,
  imports: [
    CommonModule,
    ZardPaginationCustomComponent,
    NgApexchartsModule,
    ZardInputDirective,
    ZardBreadcrumbImports,
    LucideAngularModule,
    DeleteCategoryButtonComponent,
    EditCategoriaButtonComponent,
    RouterLink,
    ZardSkeletonComponent,
  ],
  templateUrl: './category-detail-component.html',
})
export class CategoryDetailComponent implements OnInit {
  readonly House = House;
  readonly MapPin = MapPin;
  readonly Tag = Tag;
  readonly CalendarDays = CalendarDays;
  readonly Receipt = Receipt;
  readonly BadgeDollarSign = BadgeDollarSign;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Search = Search;

  private route = inject(ActivatedRoute);
  private categoryService = inject(CategoryService);
  private router = inject(Router);

  category = signal<CategoryDetailResponse | null>(null);
  loadingCategory = signal(true);

  dashboardData = signal<DashboardCategoryResponse | null>(null);
  loadingChart = signal(true);

  loading = true;

  readonly searchTerm = signal('');
  private busca$ = new Subject<void>();

  readonly patrimonios = computed(() => this.category()?.patrimonio?.content ?? []);
  readonly itemsPerPage = 7;
  readonly currentPage = signal(1);

  readonly paginatedPatrimonios = computed(() => {
    const list = this.patrimonios();
    const page = this.currentPage();
    const start = (page - 1) * this.itemsPerPage;
    return list.slice(start, start + this.itemsPerPage);
  });

  readonly totalPages = computed(() => {
    return Math.ceil(this.patrimonios().length / this.itemsPerPage);
  });

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');

    if (uuid) {
      this.busca$.pipe(debounceTime(400)).subscribe(() => {
        this.fetchCategoryInfo(uuid);
      });

      this.fetchCategoryInfo(uuid);
      this.fetchDashboardData();
    } else {
      this.loadingCategory.set(false);
      this.loadingChart.set(false);
      this.loading = false;
    }
  }

  onCategoryDeleted() {
    this.router.navigate(['/categories']);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1);
    this.busca$.next();
  }

  fetchCategoryInfo(uuid: string): void {
    this.loadingCategory.set(true);
    this.categoryService
      .listInfoCategory(uuid, {
        termoBusca: this.searchTerm(),
      })
      .pipe(finalize(() => this.loadingCategory.set(false)))
      .subscribe({
        next: (data) => {
          this.category.set(data);
          this.currentPage.set(1);
          this.loading = false;
        },
        error: (err) => {
          console.error('Erro ao buscar categoria', err);
          this.loading = false;
        },
      });
  }

  fetchDashboardData(): void {
    this.loadingChart.set(true);
    this.categoryService.getDashboardData().subscribe({
      next: (data) => {
        this.dashboardData.set(data);
        this.loadingChart.set(false);
      },
      error: (err) => {
        console.error('Erro ao buscar dados do gráfico', err);
        this.loadingChart.set(false);
      },
    });
  }

  getEstadoColor(estado: string): string {
    const est = estado?.toLowerCase() || '';
    if (est.includes('novo') || est.includes('ativo') || est.includes('bom'))
      return 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20';
    if (est.includes('manutenção') || est.includes('regular') || est.includes('reparo'))
      return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
    if (
      est.includes('ruim') ||
      est.includes('inativo') ||
      est.includes('baixado') ||
      est.includes('quebrado')
    )
      return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-600 border-slate-500/20';
  }

  readonly valorTotalCategoria = computed(() => {
    const itens = this.patrimonios();
    if (!itens || itens.length === 0) return 0;
    return itens.reduce((acc, item) => acc + (item.patrimonioGeral.valorAquisicao || 0), 0);
  });

  readonly valorTotalGlobal = computed(() => {
    return this.dashboardData()?.patrimonios.valorTotal ?? 0;
  });

  readonly chartData = computed(() => {
    const rawData = this.dashboardData()?.graficoCategoria || [];
    if (rawData.length === 0) return { series: [], labels: [], colors: [] };

    const sortedData = [...rawData].sort((a, b) => b.totalValor - a.totalValor);
    let statsFinais = [];

    if (sortedData.length <= CHART_CONSTANTS.MAX_SLICES) {
      statsFinais = sortedData;
    } else {
      const topItems = sortedData.slice(0, CHART_CONSTANTS.MAX_SLICES);
      const restoItems = sortedData.slice(CHART_CONSTANTS.MAX_SLICES);
      const valorOutros = restoItems.reduce((acc, item) => acc + item.totalValor, 0);
      statsFinais = [...topItems, { categoria: 'Outros', totalValor: valorOutros, isOutros: true }];
    }

    return {
      series: statsFinais.map((s) => s.totalValor),
      labels: statsFinais.map((s) => s.categoria),
      colors: statsFinais.map((s, i) =>
        (s as any).isOutros
          ? CHART_CONSTANTS.COLOR_OTHER
          : CHART_CONSTANTS.PALETTE[i % CHART_CONSTANTS.PALETTE.length],
      ),
    };
  });

  onCategoryUpdated(event: { nome: string; descricao: string }) {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    this.category.update((prev) =>
      prev ? { ...prev, nome: event.nome, descricao: event.descricao } : null,
    );
    if (uuid) this.fetchCategoryInfo(uuid);
  }

  readonly chartOptions: Partial<ChartOptions> = {
    chart: { type: 'donut', height: 230, fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    legend: { show: false },
    tooltip: {
      y: {
        formatter: (val) =>
          new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val),
      },
    },
    plotOptions: {
      pie: {
        donut: {
          size: '75%',
          labels: {
            show: true,
            name: { show: true, offsetY: -10 },
            value: {
              show: true,
              fontSize: '20px',
              fontWeight: 600,
              offsetY: 0,
              color: 'currentColor',
              formatter: (val) =>
                new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                  Number(val),
                ),
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total Geral',
              fontSize: '14px',
              color: 'currentColor',
              formatter: (w) => {
                const total = w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0);
                return new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(total);
              },
            },
          },
        },
      },
    },
    responsive: [{ breakpoint: 480, options: { chart: { width: 200 } } }],
  };

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

  onPageChange(page: number): void {
    this.currentPage.set(page);
  }
}

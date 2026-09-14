import {
  Component,
  OnInit,
  inject,
  signal,
  computed,
  HostListener,
  ElementRef,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { merge } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import {
  LucideAngularModule,
  DollarSign,
  Package,
  Archive,
  AlertCircle,
  FileWarning,
  AlertTriangle,
  Activity,
  CheckCircle,
  FilterX,
  PlusCircle,
  Edit2,
  ArrowRightLeft,
  UserPlus,
  Check,
  ChevronDown,
  MapPin,
  X,
} from 'lucide-angular';
import {
  NgApexchartsModule,
  ApexNonAxisChartSeries,
  ApexAxisChartSeries,
  ApexChart,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexXAxis,
  ApexYAxis,
  ApexGrid,
} from 'ng-apexcharts';
import {
  DashboardData,
  DashboardService,
} from '@/shared/core/services/dashboards/dashboard.service';
import { LocalService } from '@/shared/core/services/local/local.service';
import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';

export type ChartOptions = {
  series: ApexNonAxisChartSeries | ApexAxisChartSeries;
  chart: ApexChart;
  labels?: any;
  colors?: string[];
  legend?: ApexLegend;
  plotOptions?: ApexPlotOptions;
  dataLabels?: ApexDataLabels;
  stroke?: ApexStroke;
  tooltip?: ApexTooltip;
  xaxis?: ApexXAxis;
  yaxis?: ApexYAxis;
  grid?: ApexGrid;
};

export interface DevolucaoView {
  iniciais: string;
  nome: string;
  patrimonioDesc: string;
  patrimonioNum: string;
  diasRestantes: number;
  badgeText: string;
  badgeClass: string;
  avatarClass: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    NgApexchartsModule,
    ReactiveFormsModule,
    ZardDatePickerComponent,
  ],
  templateUrl: './dashboard.html',
})
export class DashboardComponent implements OnInit {
  readonly DollarSign = DollarSign;
  readonly Package = Package;
  readonly Archive = Archive;
  readonly AlertCircle = AlertCircle;
  readonly FileWarning = FileWarning;
  readonly AlertTriangle = AlertTriangle;
  readonly Activity = Activity;
  readonly CheckCircle = CheckCircle;
  readonly FilterX = FilterX;
  readonly PlusCircle = PlusCircle;
  readonly Edit2 = Edit2;
  readonly ArrowRightLeft = ArrowRightLeft;
  readonly UserPlus = UserPlus;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly MapPin = MapPin;
  readonly X = X;

  private dashboardService = inject(DashboardService);
  private localService = inject(LocalService);
  private elRef = inject(ElementRef);

  readonly dados = signal<DashboardData | null>(null);
  readonly locais = signal<any[]>([]);
  readonly ultimasMovimentacoes = signal<any[]>([]);
  readonly devolucoesProximas = signal<any[]>([]);
  readonly ready = signal(false);
  readonly activeStatusFilter = signal<string | null>(null);

  readonly chartLocais = signal<string[]>([]);
  readonly isDropdownOpen = signal(false);

  localFilter = new FormControl<string>('TODOS');
  dataInicioFilter = new FormControl<Date | null>(null);
  dataFimFilter = new FormControl<Date | null>(null);

  private readonly localFilterSignal = toSignal(this.localFilter.valueChanges, {
    initialValue: 'TODOS' as string,
  });

  readonly localNomeAtivo = computed(() => {
    const uuid = this.localFilterSignal();
    if (!uuid || uuid === 'TODOS') return null;
    return this.locais().find((l) => l.uuid === uuid)?.local ?? null;
  });

  readonly chartLocaisNomes = computed(() =>
    this.chartLocais().map((uuid) => this.locais().find((l) => l.uuid === uuid)?.local ?? uuid),
  );

  readonly summaryCards = computed(() => {
    const d = this.dados();
    return [
      {
        label: 'Valor Imobilizado',
        value: d ? this.formatarMoeda(d.cards.valorImobilizadoTotal) : 'R$ 0,00',
        icon: this.DollarSign,
        iconBg: 'bg-emerald-500/10',
        iconColor: 'text-emerald-500',
        borderClass: 'border-border',
        sub: null,
        subIcon: null,
        subColor: '',
      },
      {
        label: 'Total de Ativos',
        value: d?.cards?.totalAtivos ?? 0,
        icon: this.Package,
        iconBg: 'bg-blue-500/10',
        iconColor: 'text-blue-500',
        borderClass: 'border-border',
        sub: 'Equipamentos registrados',
        subColor: 'text-muted-foreground',
        subIcon: null,
      },
      {
        label: 'Em Estoque',
        value: d
          ? `${d.cards.totalGuardados} (${this.calcularPercentual(d.cards.totalGuardados, d.cards.totalAtivos)})`
          : '0',
        icon: this.Archive,
        iconBg: 'bg-amber-500/10',
        iconColor: 'text-amber-500',
        borderClass: 'border-border',
        sub: 'Guardados',
        subColor: 'text-amber-500',
        subIcon: this.AlertCircle,
      },
      {
        label: 'Pendência de NF',
        value: d?.cards?.pendenciasNotaFiscal ?? 0,
        icon: this.FileWarning,
        iconBg: 'bg-destructive/10',
        iconColor: 'text-destructive',
        borderClass: 'border-destructive/20',
        sub: 'Requer atenção',
        subColor: 'text-destructive',
        subIcon: this.AlertTriangle,
      },
    ];
  });

  readonly barChartData = computed(() => {
    const valorPorLocal: { local: string; valorTotal: number }[] =
      this.dados()?.graficos?.valorPorLocal || [];
    const nomesSelecionados = this.chartLocaisNomes();

    if (!Array.isArray(valorPorLocal) || valorPorLocal.length === 0) {
      return {
        series: [{ name: 'Valor Investido', data: [] as number[] }],
        categories: [] as string[],
      };
    }

    const base =
      nomesSelecionados.length > 0
        ? valorPorLocal.filter((l) => nomesSelecionados.includes(l.local))
        : [...valorPorLocal].sort((a, b) => b.valorTotal - a.valorTotal).slice(0, 5);

    const ordenados = [...base].sort((a, b) => b.valorTotal - a.valorTotal);

    return {
      series: [{ name: 'Valor Investido', data: ordenados.map((l) => l.valorTotal) }],
      categories: ordenados.map((l) => l.local),
    };
  });

  private readonly BAR_PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

  readonly barChartColors = computed((): string[] => {
    const { categories } = this.barChartData();
    const nomeAtivo = this.localNomeAtivo();
    return categories.map((cat, i) => {
      const base = this.BAR_PALETTE[i % this.BAR_PALETTE.length];
      return !nomeAtivo || cat === nomeAtivo ? base : 'rgba(75,85,99,0.28)';
    });
  });

  readonly barChartPlotOptions = computed((): ApexPlotOptions => {
    const count = this.barChartData().series[0]?.data?.length || 1;
    const width = count === 1 ? '22%' : count <= 2 ? '32%' : count <= 3 ? '42%' : '58%';
    return {
      bar: {
        horizontal: false,
        borderRadius: 5,
        borderRadiusApplication: 'end',
        dataLabels: { position: 'top' },
        columnWidth: width,
        distributed: true,
      },
    };
  });

  readonly donutChartData = computed(() => {
    const colorsMap: Record<string, string> = {
      GUARDADO: '#3b82f6',
      USO: '#f59e0b',
      'EM USO': '#f59e0b',
      DEFEITO: '#ef4444',
      MANUTENCAO: '#8b5cf6',
      EMPRESTIMO: '#06b6d4',
    };

    const nomeAtivo = this.localNomeAtivo();
    if (nomeAtivo) {
      const valorPorLocal: any[] = this.dados()?.graficos?.valorPorLocal || [];
      const localData = valorPorLocal.find((l) => l.local === nomeAtivo);
      const statusDoLocal: { status: string; quantidade: number }[] = localData?.status || [];

      const filtered = statusDoLocal.filter((d) => d.quantidade > 0);
      if (filtered.length === 0) return { series: [], labels: [], colors: [] };
      return {
        series: filtered.map((d) => d.quantidade),
        labels: filtered.map((d) => d.status),
        colors: filtered.map((d) => colorsMap[d.status.toUpperCase()] || '#6b7280'),
      };
    }

    const distribuicao = this.dados()?.graficos?.distribuicaoStatus || [];
    if (!Array.isArray(distribuicao) || distribuicao.length === 0)
      return { series: [], labels: [], colors: [] };

    const filtered = distribuicao.filter((d) => d.quantidade > 0);
    return {
      series: filtered.map((d) => d.quantidade),
      labels: filtered.map((d) => d.status),
      colors: filtered.map((d) => colorsMap[d.status.toUpperCase()] || '#6b7280'),
    };
  });

  /**
   * Legenda do donut: derivada de donutChartData() para garantir
   * que só aparecem status presentes no local/filtro ativo, com quantidade > 0.
   */
  readonly donutLegendItems = computed(() => {
    const { labels, series, colors } = this.donutChartData();
    return labels.map((label, i) => ({
      status: label,
      quantidade: series[i] as number,
      color: colors[i],
    }));
  });

  readonly donutChartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'donut',
      height: 220,
      fontFamily: 'inherit',
      background: 'transparent',
      animations: { enabled: true, speed: 400 },
      events: {
        dataPointSelection: (_e: any, _ctx: any, config: any) => {
          this.toggleStatusFilter(config.w.config.labels[config.dataPointIndex]);
        },
      },
    },
    dataLabels: { enabled: false },
    legend: { show: false },
    stroke: { show: false, width: 0 },
    tooltip: { theme: 'dark' },
    plotOptions: {
      pie: {
        donut: {
          size: '72%',
          labels: {
            show: true,
            name: { show: false },
            value: {
              show: true,
              fontSize: '22px',
              fontWeight: '700',
              color: '#ffffff',
              offsetY: 8,
            },
            total: {
              show: true,
              showAlways: true,
              label: 'Total',
              fontSize: '12px',
              color: '#9ca3af',
              formatter: (w: any) => w.globals.seriesTotals.reduce((a: any, b: any) => a + b, 0),
            },
          },
        },
      },
    },
  };

  readonly barChartOptions: Partial<ChartOptions> = {
    chart: {
      type: 'bar',
      height: 270,
      fontFamily: 'inherit',
      background: 'transparent',
      toolbar: { show: false },
      animations: { enabled: true, speed: 350 },
      events: {
        dataPointSelection: (_e: any, _ctx: any, config: any) => {
          const idx: number = config.dataPointIndex;
          const categories = this.barChartData().categories;
          if (idx < 0 || idx >= categories.length) return;
          this.selecionarLocalPorNome(categories[idx]);
        },
      },
    },
    colors: this.BAR_PALETTE,
    legend: { show: false },
    dataLabels: {
      enabled: true,
      style: { colors: ['#fff'], fontSize: '10px', fontWeight: '600' },
      formatter: (val: number) => this.formatarMoedaResumida(val),
      offsetY: -20,
    },
    xaxis: {
      labels: {
        rotate: -25,
        style: { colors: '#9ca3af', fontSize: '10px' },
        trim: true,
        maxHeight: 65,
      },
    },
    yaxis: {
      labels: {
        style: { colors: '#9ca3af', fontSize: '11px' },
        formatter: (val: number) => this.formatarMoedaResumida(val),
      },
    },
    grid: {
      borderColor: '#1f2937',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      yaxis: { lines: { show: true } },
    },
    tooltip: { theme: 'dark' },
  };

  ngOnInit(): void {
    this.localService.listAll().subscribe({
      next: (res: any) => this.locais.set(res.content || []),
    });
    this.carregarDados();

    merge(
      this.localFilter.valueChanges,
      this.dataInicioFilter.valueChanges,
      this.dataFimFilter.valueChanges,
    )
      .pipe(debounceTime(300))
      .subscribe(() => this.carregarDados());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if (!this.elRef.nativeElement.contains(event.target)) {
      this.isDropdownOpen.set(false);
    }
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.isDropdownOpen.update((v) => !v);
  }

  toggleChartLocal(uuid: string, event: MouseEvent) {
    event.stopPropagation();
    const atual = this.chartLocais();
    this.chartLocais.set(
      atual.includes(uuid)
        ? atual.filter((u) => u !== uuid)
        : atual.length < 5
          ? [...atual, uuid]
          : atual,
    );
  }

  isLocalInChart(uuid: string): boolean {
    return this.chartLocais().includes(uuid);
  }

  selecionarTop5() {
    const valorPorLocal: { local: string; valorTotal: number }[] =
      this.dados()?.graficos?.valorPorLocal || [];
    const uuids = [...valorPorLocal]
      .sort((a, b) => b.valorTotal - a.valorTotal)
      .slice(0, 5)
      .map((l) => this.locais().find((loc) => loc.local === l.local)?.uuid)
      .filter(Boolean) as string[];
    this.chartLocais.set(uuids);
  }

  limparChartLocais(event?: MouseEvent) {
    event?.stopPropagation();
    this.chartLocais.set([]);
  }

  getLocalValor(nome: string): number {
    const valorPorLocal: { local: string; valorTotal: number }[] =
      this.dados()?.graficos?.valorPorLocal || [];
    return valorPorLocal.find((l) => l.local === nome)?.valorTotal ?? 0;
  }

  toggleStatusFilter(status: string) {
    this.activeStatusFilter.set(this.activeStatusFilter() === status ? null : status);
    this.carregarDados();
  }

  selecionarLocalPorNome(nome: string) {
    const localObj = this.locais().find((l) => l.local === nome);
    if (!localObj?.uuid) return;
    const novoUuid = this.localFilter.value === localObj.uuid ? 'TODOS' : localObj.uuid;
    this.localFilter.setValue(novoUuid);
  }

  limparLocalFilter() {
    this.localFilter.setValue('TODOS');
  }

  limparFiltros() {
    this.activeStatusFilter.set(null);
    this.localFilter.setValue('TODOS');
    this.dataInicioFilter.setValue(null, { emitEvent: false });
    this.dataFimFilter.setValue(null, { emitEvent: false });
  }

  limparDatas() {
    this.dataInicioFilter.setValue(null, { emitEvent: false });
    this.dataFimFilter.setValue(null, { emitEvent: false });
    this.carregarDados();
  }

  carregarDados() {
    this.ready.set(false);
    const params: Record<string, any> = {};
    if (this.localFilter.value && this.localFilter.value !== 'TODOS')
      params['localUuid'] = this.localFilter.value;
    if (this.activeStatusFilter()) params['status'] = this.activeStatusFilter();
    if (this.dataInicioFilter.value)
      params['dataInicio'] = this.formatDateParam(this.dataInicioFilter.value);
    if (this.dataFimFilter.value)
      params['dataFim'] = this.formatDateParam(this.dataFimFilter.value);

    this.dashboardService.getDashboardCompleto(params).subscribe({
      next: (res) => {
        this.dados.set(res);
        this.processarDevolucoes(res?.devolucoesProximas || []);
        this.ultimasMovimentacoes.set(Array.isArray(res?.historico) ? res.historico : []);
        if (this.chartLocais().length === 0) this.selecionarTop5();
        this.ready.set(true);
      },
      error: (err) => {
        console.error('Erro ao buscar dados', err);
        this.ready.set(true);
      },
    });
  }

  private formatDateParam(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private processarDevolucoes(devolucoesJSON: any[]) {
    if (!devolucoesJSON || !Array.isArray(devolucoesJSON)) {
      this.devolucoesProximas.set([]);
      return;
    }
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const listaFormatada: DevolucaoView[] = [];
    const avatarColors = [
      'bg-blue-500/10 text-blue-500',
      'bg-indigo-500/10 text-indigo-500',
      'bg-cyan-500/10 text-cyan-500',
      'bg-emerald-500/10 text-emerald-500',
    ];
    devolucoesJSON.forEach((dev) => {
      const nomeStr = dev.responsavel || 'Desconhecido';
      const iniciais =
        nomeStr
          .split(' ')
          .map((n: string) => n[0])
          .slice(0, 2)
          .join('')
          .toUpperCase() || '??';
      const avatarClass = avatarColors[nomeStr.length % avatarColors.length];
      const dataFim = new Date(dev.dataPrevista + 'T00:00:00');
      const diffDays = Math.ceil((dataFim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
      const badgeText =
        diffDays < 0
          ? `Atrasado ${Math.abs(diffDays)}d`
          : diffDays === 0
            ? 'Vence Hoje'
            : `Em ${diffDays}d`;
      const badgeClass =
        diffDays <= 0 ? 'bg-destructive/10 text-destructive' : 'bg-amber-500/10 text-amber-500';
      if (dev.patrimonio && Array.isArray(dev.patrimonio)) {
        dev.patrimonio.forEach((p: any) => {
          if (p.comodato?.estado !== 'DEVOLVIDO' && p.comodato?.estado !== 'CANCELADO') {
            listaFormatada.push({
              iniciais,
              nome: nomeStr,
              patrimonioDesc: 'Equipamento',
              patrimonioNum: p.numPatrimonio,
              diasRestantes: diffDays,
              badgeText,
              badgeClass,
              avatarClass,
            });
          }
        });
      }
    });
    listaFormatada.sort((a, b) => a.diasRestantes - b.diasRestantes);
    this.devolucoesProximas.set(listaFormatada);
  }

  getLogIcon(acao: string) {
    const map: Record<string, any> = {
      CRIACAO: { icon: this.PlusCircle, color: 'text-emerald-500' },
      EDICAO: { icon: this.Edit2, color: 'text-amber-500' },
      MOVIMENTACAO: { icon: this.ArrowRightLeft, color: 'text-blue-500' },
      EMPRESTIMO: { icon: this.UserPlus, color: 'text-indigo-500' },
    };
    return map[acao] ?? { icon: this.Activity, color: 'text-muted-foreground' };
  }

  formatarMoeda(valor: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      valor || 0,
    );
  }

  formatarMoedaResumida(valor: number): string {
    if (valor >= 1_000_000) return `R$${(valor / 1_000_000).toFixed(1)}M`;
    if (valor >= 1_000) return `R$${(valor / 1_000).toFixed(1)}k`;
    return `R$${valor}`;
  }

  calcularPercentual(parte: number, total: number): string {
    if (!total) return '0%';
    return `${((parte / total) * 100).toFixed(0)}%`;
  }
}

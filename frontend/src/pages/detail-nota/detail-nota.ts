import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  House,
  FileText,
  Calendar,
  DollarSign,
  Box,
  MapPin,
  Pencil,
} from 'lucide-angular';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';
import { EditNotaDialogComponent } from 'src/components/dialogs/edit-notafiscal-dialog/edit-notafiscal-dialog';

export interface NotaFiscalDetailResponse {
  uuid: string;
  codigoNota: string;
  fornecedor: string;
  cnpj: string;
  valorTotalNota: number;
  dataEmissao: string;
  status: string;
  notaFiscalUrl: string;
  criadoAutomatico: boolean;
  quantidade?: number;
  patrimonios: Array<{
    uuid: string;
    descricao: string;
    valorAquisicao: number;
    itens: Array<{
      uuid: string;
      numPatrimonio: string;
      numSerie: string;
      estadoConservacao: string;
    }>;
  }>;
}

export interface PatrimonioNotaView {
  uuid: string;
  numPatrimonio: string;
  descricao: string;
  valorAquisicao: number;
  numSerie: string;
  estadoConservacao: string;
}

@Component({
  selector: 'app-detail-nota',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    LucideAngularModule,
    ZardPaginationCustomComponent,
    ZardBreadcrumbImports,
  ],
  templateUrl: './detail-nota.html',
})
export class DetailNota implements OnInit {
  private readonly notaService = inject(NotaFiscalService);
  private readonly dialogService = inject(ZardDialogService);
  private readonly route = inject(ActivatedRoute);

  readonly House = House;
  readonly FileText = FileText;
  readonly Calendar = Calendar;
  readonly DollarSign = DollarSign;
  readonly Box = Box;
  readonly MapPin = MapPin;
  readonly Pencil = Pencil;

  readonly notaDetalhe = signal<NotaFiscalDetailResponse | null>(null);
  readonly patrimonios = signal<PatrimonioNotaView[]>([]);
  readonly isLoading = signal(true);
  readonly termoBusca = signal('');
  readonly currentPage = signal(1);
  readonly itemsPerPage = 8;

  readonly filteredPatrimonios = computed(() => {
    const list = this.patrimonios();
    const termo = this.termoBusca().toLowerCase().trim();
    if (!termo) return list;
    return list.filter(
      (item) =>
        item.descricao?.toLowerCase().includes(termo) ||
        item.numPatrimonio?.toLowerCase().includes(termo) ||
        item.numSerie?.toLowerCase().includes(termo),
    );
  });

  readonly paginatedPatrimonios = computed(() => {
    const items = this.filteredPatrimonios();
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return items.slice(start, start + this.itemsPerPage);
  });

  readonly totalItensVinculados = computed(
    () => this.patrimonios().filter((p) => p.numPatrimonio !== 'S/N').length,
  );

  readonly totalItensNota = computed(
    () => this.notaDetalhe()?.quantidade || this.patrimonios().length,
  );

  readonly totalItensFiltrados = computed(() => this.filteredPatrimonios().length);

  readonly totalPages = computed(
    () => Math.ceil(this.totalItensFiltrados() / this.itemsPerPage) || 1,
  );

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const uuid = params.get('uuid');
      if (uuid) this.carregarDetalhes(uuid);
    });
  }

  private carregarDetalhes(id: string) {
    this.isLoading.set(true);
    this.notaService.listNota(id).subscribe({
      next: (data: NotaFiscalDetailResponse) => {
        this.notaDetalhe.set(data);

        const listaMapeada: PatrimonioNotaView[] = [];
        (data.patrimonios || []).forEach((p: any) => {
          if (p.itens?.length > 0) {
            p.itens.forEach((item: any) => {
              listaMapeada.push({
                uuid: item.uuid || p.uuid,
                descricao: p.descricao || 'Sem descrição',
                valorAquisicao: p.valorAquisicao || 0,
                numPatrimonio: item.numPatrimonio || 'S/N',
                numSerie: item.numSerie || '-',
                estadoConservacao: item.estadoConservacao || 'Desconhecido',
              });
            });
          } else {
            listaMapeada.push({
              uuid: p.uuid,
              descricao: p.descricao || 'Sem descrição',
              valorAquisicao: p.valorAquisicao || 0,
              numPatrimonio: 'S/N',
              numSerie: '-',
              estadoConservacao: 'Desconhecido',
            });
          }
        });

        this.patrimonios.set(listaMapeada);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  onEditNota() {
    const nota = this.notaDetalhe();
    if (!nota || nota.criadoAutomatico) return;

    const dialogRef = this.dialogService.create({
      zContent: EditNotaDialogComponent,
      zHideFooter: true,
      zWidth: 'min(560px, calc(100vw - 32px))',
      zData: {
        uuid: nota.uuid,
        fornecedor: nota.fornecedor,
        cnpj: nota.cnpj,
        valorTotalNota: nota.valorTotalNota,
        quantidadeItensNota: nota.quantidade,
        dataEmissao: nota.dataEmissao,
      },
    });

    const instance = dialogRef.componentInstance as EditNotaDialogComponent;
    instance?.notaAtualizada.subscribe(() => {
      this.carregarDetalhes(nota.uuid);
    });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
  }

  onSearchChange(texto: string) {
    this.termoBusca.set(texto);
    this.currentPage.set(1);
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      value || 0,
    );
  }

  formatDate(dateString: string): string {
    if (!dateString) return '-';
    return new Date(dateString + 'T12:00:00').toLocaleDateString('pt-BR');
  }

  getStatusClass(status: string): string {
    const s = status?.toUpperCase();
    switch (s) {
      case 'GUARDADO':
        return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'USO':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DEFEITO':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EMPRESTIMO':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'MANUTENCAO':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'EXTRAVIADO':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'BAIXA':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'DOACAO':
        return 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'TOTALMENTE_VINCULADA':
        return 'Totalmente vinculada';
      case 'PARCIALMENTE_VINCULADA':
        return 'Parcialmente vinculada';
      case 'SEM_PATRIMONIOS':
        return 'Sem patrimônios';
      default:
        return status;
    }
  }

  getStatusClasse(status: string): string {
    const base = 'inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold w-fit';
    switch (status) {
      case 'TOTALMENTE_VINCULADA':
        return `${base} bg-teal-500/10 text-teal-400`;
      case 'PARCIALMENTE_VINCULADA':
        return `${base} bg-amber-500/10 text-amber-400`;
      case 'SEM_PATRIMONIOS':
        return `${base} bg-gray-500/10 text-gray-400`;
      default:
        return `${base} bg-gray-500/10 text-gray-400`;
    }
  }

  getStatusDotColor(status: string): string {
    switch (status) {
      case 'TOTALMENTE_VINCULADA':
        return 'bg-emerald-500';
      case 'PARCIALMENTE_VINCULADA':
        return 'bg-yellow-500';
      case 'SEM_PATRIMONIOS':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
}

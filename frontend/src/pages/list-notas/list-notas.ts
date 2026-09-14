import { Component, computed, signal, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Search,
  Plus,
  ChevronRight,
  ArrowUpDown,
  House,
  ShieldCheck,
} from 'lucide-angular';
import { debounceTime, finalize, Subject } from 'rxjs';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardCreateNotaButtonComponent } from 'src/components/dialogs/create-nota-dialog/create-nota-dialog';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { RouterLink } from '@angular/router';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import {
  UploadCertificadoDialogComponent,
  ZardCertificadoButtonComponent,
} from 'src/components/dialogs/upload-certificado-dialog/upload-certificado-dialog';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { toast } from 'ngx-sonner';

export interface NotaFiscal {
  uuid: string;
  codigoNota: string;
  fornecedor: string;
  cnpj: string;
  valorTotalNota: number;
  dataEmissao: string;
  status: 'TOTALMENTE_VINCULADA' | 'PARCIALMENTE_VINCULADA' | 'SEM_PATRIMONIOS';
  notaFiscalUrl: string;
  dataCriacao: string;
  chaveAcesso: string;
}

@Component({
  selector: 'app-list-notas',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ZardSelectComponent,
    ZardSelectImports,
    ZardPaginationCustomComponent,
    ZardCreateNotaButtonComponent,
    ZardCertificadoButtonComponent,
    ZardBreadcrumbImports,
    RouterLink,
    ZardSkeletonComponent,
  ],
  providers: [CurrencyPipe, DatePipe],
  templateUrl: './list-notas.html',
  styleUrls: ['./list-notas.css'],
})
export class ListNotas implements OnInit {
  private readonly notaService = inject(NotaFiscalService);
  private readonly dialogService = inject(ZardDialogService);

  readonly Search = Search;
  readonly Plus = Plus;
  readonly ChevronRight = ChevronRight;
  readonly ArrowUpDown = ArrowUpDown;
  readonly House = House;
  readonly ShieldCheck = ShieldCheck;

  readonly form = new FormGroup({
    search: new FormControl<string>(''),
    ordenacao: new FormControl<string>('emissaoDesc'),
  });

  readonly filtrosTabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'TOTALMENTE_VINCULADA', label: 'Totalmente vinculada' },
    { id: 'PARCIALMENTE_VINCULADA', label: 'Parcialmente vinculada' },
    { id: 'SEM_PATRIMONIOS', label: 'Sem patrimônios' },
  ];

  readonly tabAtual = signal<string>('todos');
  readonly isLoading = signal(false);
  readonly searchSignal = signal('');
  readonly ordenacaoSignal = signal('emissaoDesc');

  readonly notas = signal<NotaFiscal[]>([]);
  readonly totalElements = signal(0);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 6;

  private busca$ = new Subject<void>();

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.totalElements() / this.itensPorPagina) || 1;
  });

  private mapOrdenacaoToSort(ordenacao: string): string {
    switch (ordenacao) {
      case 'emissaoDesc':
        return 'dataEmissao,desc';
      case 'emissaoAsc':
        return 'dataEmissao,asc';
      case 'valorDesc':
        return 'valorTotalNota,desc';
      default:
        return 'dataEmissao,desc';
    }
  }

  ngOnInit() {
    this.form.valueChanges.subscribe(() => {
      this.paginaAtual.set(1);
      this.busca$.next();
    });

    this.busca$.pipe(debounceTime(400)).subscribe(() => {
      this.carregarNotas();
    });

    this.carregarNotas();
  }

  setOrdenacao(value: string) {
    this.form.get('ordenacao')?.setValue(value);
    setTimeout(() => document.body.click());
  }

  carregarNotas() {
    this.isLoading.set(true);

    const params: Record<string, any> = {
      termoBusca: this.form.value.search || '',
      sort: this.mapOrdenacaoToSort(this.form.value.ordenacao || 'emissaoDesc'),
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
    };

    if (this.tabAtual() !== 'todos') {
      params['status'] = this.tabAtual();
    }

    this.notaService
      .listAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          this.notas.set(res?.content || []);
          this.totalElements.set(res?.totalElements || 0);
        },
        error: (err) => {
          console.error('Erro ao buscar notas fiscais:', err);
          this.notas.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onNovaNotaCriada() {
    this.paginaAtual.set(1);
    this.carregarNotas();
  }

  onCertificadoEnviado(): void {
    toast.success('Certificado atualizado!', {
      description: 'O sistema já está usando o novo certificado digital.',
      duration: 5000,
    });
  }

  setTabFilter(tabId: string) {
    this.tabAtual.set(tabId);
    this.paginaAtual.set(1);
    this.carregarNotas();
  }

  onPaginaChange(page: number) {
    this.paginaAtual.set(page);
    this.carregarNotas();
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

  getStatusClass(status: string): string {
    const base =
      'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold w-fit';
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
        return 'bg-yellow-700';
      case 'SEM_PATRIMONIOS':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }
}

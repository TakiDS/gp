import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subject, debounceTime, delay, finalize, fromEvent, takeUntil } from 'rxjs';
import { toast } from 'ngx-sonner';

import {
  LucideAngularModule,
  Search,
  Plus,
  MoreHorizontal,
  Box,
  CheckCircle,
  Trash2,
  XCircle,
  LogOut,
  Info,
  Eye,
} from 'lucide-angular';

import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';
import {
  ZardPopoverComponent,
  ZardPopoverDirective,
} from '@/shared/components/popover/popover.component';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardCreateComodatoButtonComponent } from 'src/components/dialogs/create-comodato-dialog/create-comodato-dialog';

import { ComodatoService } from '@/shared/core/services/comodato/comodato-service';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardDeleteComodatoDialogComponent } from 'src/components/dialogs/confirm-delete-comodato-dialog/confirm-delete-comodato-dialog';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { RouterLink } from '@angular/router';

export interface Patrimonio {
  uuid: string;
  descricao: string;
  numPatrimonio: string;
}

export interface ComodatoTela {
  uuid: string;
  nome: string;
  email: string;
  patrimonios: Patrimonio[];
  dataInicio: string;
  dataFimEsperado: string;
  dataFimEsperadoRaw: Date;
  validacaoTermo: boolean;
  estado: string;
  estadoOriginal: string;
}

@Component({
  selector: 'comodatos-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    RouterLink,
    ZardSelectComponent,
    ZardSelectImports,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardPaginationCustomComponent,
    ZardCreateComodatoButtonComponent,
    ZardSkeletonComponent,
  ],
  templateUrl: './comodatos-list.html',
  styleUrls: ['./comodatos-list.css'],
})
export class ComodatosComponent implements OnInit {
  readonly Search = Search;
  readonly Plus = Plus;
  readonly MoreHorizontal = MoreHorizontal;
  readonly Box = Box;
  readonly CheckCircle = CheckCircle;
  readonly Trash2 = Trash2;
  readonly XCircle = XCircle;
  readonly LogOut = LogOut;
  readonly Info = Info;
  readonly Eye = Eye;

  private comodatosService = inject(ComodatoService);
  private dialogService = inject(ZardDialogService);

  readonly comodatos = signal<ComodatoTela[]>([]);
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);
  private destroy$ = new Subject<void>();
  readonly currentPage = signal(1);
  readonly itemsPerPage = 8;
  readonly tabAtual = signal<string>('todos');

  readonly filtrosForm = new FormGroup({
    search: new FormControl<string>('', { nonNullable: true }),
    ordenacao: new FormControl<string>('vencimento', { nonNullable: true }),
  });

  readonly filtrosTabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'assinado', label: 'Assinado' },
    { id: 'pendente', label: 'Pendente' },
    { id: 'atrasado', label: 'Atrasado' },
  ];

  private busca$ = new Subject<string>();

  readonly totalPages = computed(() => {
    return Math.ceil(this.totalElements() / this.itemsPerPage) || 1;
  });

  ngOnInit() {
    this.busca$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(1);
      this.carregarComodatos();
    });

    fromEvent(window, 'focus')
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.carregarComodatos();
      });

    this.filtrosForm.get('search')?.valueChanges.subscribe((value) => {
      this.busca$.next(value || '');
    });

    this.filtrosForm.get('ordenacao')?.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.carregarComodatos();
    });

    this.carregarComodatos();
  }

  carregarComodatos() {
    this.isLoading.set(true);

    const params = {
      termoBusca: this.filtrosForm.value.search || '',
      ordenacao: this.filtrosForm.value.ordenacao || '',
      tab: this.tabAtual() !== 'todos' ? this.tabAtual() : '',
      page: this.currentPage() - 1,
      size: this.itemsPerPage,
    };

    this.comodatosService
      .listAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const listaAPI = res?.content || [];
          this.totalElements.set(res?.totalElements || 0);

          const formatados: ComodatoTela[] = listaAPI.map((item: any) => {
            const dtInicio = new Date(item.dataInicio + 'T00:00:00');
            const dtFim = new Date(item.dataFimEsperado + 'T00:00:00');

            return {
              uuid: item.uuid,
              nome: item.nome || 'Não informado',
              email: item.email || '-',
              patrimonios: item.patrimonios || [],
              dataInicio: dtInicio.toLocaleDateString('pt-BR'),
              dataFimEsperado: dtFim.toLocaleDateString('pt-BR'),
              dataFimEsperadoRaw: dtFim,
              validacaoTermo: item.validacaoTermo,
              estadoOriginal: item.estado,
              estado: this.formatarEstado(item.estado, item.validacaoTermo),
            };
          });

          this.comodatos.set(formatados);
        },
        error: (err) => {
          console.error('Erro ao buscar comodatos', err);
          this.comodatos.set([]);
          this.totalElements.set(0);
        },
      });
  }

  private formatarEstado(estado: string, assinado: boolean): string {
    if (!estado) return 'Pendente';
    const e = estado.toUpperCase();
    if (e === 'CANCELADO') return 'Cancelado';
    if (e === 'DEVOLVIDO') return 'Devolvido';
    if (e === 'ASSINATURA') return 'Aguardando Assinatura';
    if (e === 'PENDENTE' && !assinado) return 'Pendente';
    return estado.charAt(0).toUpperCase() + estado.slice(1).toLowerCase();
  }

  setTabFilter(tabId: string) {
    this.tabAtual.set(tabId);
    this.currentPage.set(1);
    this.carregarComodatos();
  }

  onPageChange(page: any) {
    this.currentPage.set(page);
    this.carregarComodatos();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onComodatoCriado(novo: any) {
    this.carregarComodatos();
    toast.success('Comodato criado com sucesso!');
  }

  onConfirmarEntrega(item: ComodatoTela) {
    this.comodatosService.atualizarEstado(item.uuid, 'DEVOLVIDO').subscribe({
      next: () => {
        toast.success(`Patrimônio(s) de ${item.nome} devolvido(s) com sucesso!`);
        this.carregarComodatos();
      },
      error: () => toast.error('Erro ao confirmar devolução.'),
    });
  }

  onCancelarComodato(item: ComodatoTela) {
    this.comodatosService.atualizarEstado(item.uuid, 'CANCELADO').subscribe({
      next: () => {
        toast.warning(`Comodato de ${item.nome} foi cancelado.`);
        this.carregarComodatos();
      },
      error: () => toast.error('Erro ao cancelar comodato.'),
    });
  }

  onExcluirComodato(item: ComodatoTela) {
    const dialogRef = this.dialogService.create({
      zContent: ZardDeleteComodatoDialogComponent,
      zWidth: '550px',
      zHideFooter: true,
      zData: item,
    });

    const instance = dialogRef.componentInstance as ZardDeleteComodatoDialogComponent;

    instance.onConfirm.subscribe(() => {
      this.comodatosService.delete(item.uuid).subscribe({
        next: () => {
          toast.success(`Registro de ${item.nome} removido.`);
          this.carregarComodatos();
        },
        error: () => toast.error('Erro ao excluir o registro.'),
      });
    });
  }
}

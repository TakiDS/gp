import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
  Info,
  Ban,
  Search,
  History,
  ArrowLeft,
  ChevronRight,
  FileText,
  Hash,
  MessageSquare,
  MapPin,
  Edit2,
  Truck,
  Inbox,
  ExternalLink,
  ArrowRight,
  Edit3,
  PlusCircle,
  User,
  Barcode,
  Monitor,
  Activity,
  CornerDownRight,
  Calendar,
  DollarSign,
  Layers,
  UserPlus,
  LogOut,
  Undo2,
  FileCheck,
  FileX,
  AlertCircle,
  Signature,
  ArrowDown,
} from 'lucide-angular';
import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';

@Component({
  selector: 'app-patrimonio-history',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    DecimalPipe,
    DatePipe,
    CurrencyPipe,
    RouterLink,
    ZardPaginationCustomComponent,
  ],
  templateUrl: './patrimonio-history.html',
})
export class PatrimonioHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly patrimonioService = inject(PatrimonioService);

  readonly Icons = {
    History,
    ArrowLeft,
    Search,
    ChevronRight,
    FileText,
    Hash,
    MessageSquare,
    MapPin,
    Plus,
    Edit2,
    Truck,
    Info,
    Inbox,
    ExternalLink,
    ArrowRight,
    Edit3,
    PlusCircle,
    User,
    Barcode,
    Monitor,
    Activity,
    ArrowRightLeft,
    CornerDownRight,
    Calendar,
    DollarSign,
    Layers,
    UserPlus,
    Trash2,
    LogOut,
    Undo2,
    FileCheck,
    AlertCircle,
    Signature,
    ArrowDown,
  };

  constructor(private router: Router) {}

  readonly acaoConfigs: Record<string, { icone: any; cor: string; label: string; bg: string }> = {
    CRIACAO: {
      icone: Plus,
      cor: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      label: 'Criação',
    },
    MOVIMENTACAO: {
      icone: ArrowRightLeft,
      cor: 'text-blue-500',
      bg: 'bg-blue-500/10',
      label: 'Movimentação',
    },
    EDICAO: {
      icone: Pencil,
      cor: 'text-amber-500',
      bg: 'bg-amber-500/10',
      label: 'Edição',
    },
    EMPRESTIMO: {
      icone: UserPlus,
      cor: 'text-indigo-500',
      bg: 'bg-indigo-500/10',
      label: 'Empréstimo',
    },
    SAIDA_PATRIMONIAL: {
      icone: LogOut,
      cor: 'text-rose-500',
      bg: 'bg-rose-500/10',
      label: 'Saída Patrimonial',
    },
    BAIXA: {
      icone: Ban,
      cor: 'text-slate-500',
      bg: 'bg-slate-500/10',
      label: 'Baixa Definitiva',
    },
    COMODATO_CRIADO: {
      icone: FileText,
      cor: 'text-cyan-500',
      bg: 'bg-cyan-500/10',
      label: 'Comodato Criado',
    },
    COMODATO_ASSINADO: {
      icone: FileCheck,
      cor: 'text-teal-500',
      bg: 'bg-teal-500/10',
      label: 'Comodato Assinado',
    },
    COMODATO_DEVOLUCAO: {
      icone: Undo2,
      cor: 'text-fuchsia-500',
      bg: 'bg-fuchsia-500/10',
      label: 'Comodato Devolvido',
    },
    COMODATO_CANCELADO: {
      icone: FileX,
      cor: 'text-amber-500',
      bg: 'bg-amber-500/5',
      label: 'Comodato Cancelado',
    },
    COMODATO_DELETADO: {
      icone: Trash2,
      cor: 'text-rose-500',
      bg: 'bg-rose-500/5',
      label: 'Comodato Excluído',
    },
  };

  readonly historico = signal<any[]>([]);
  readonly totalElements = signal(0);

  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 5;

  readonly totalPaginas = computed(
    () => Math.ceil(this.totalElements() / this.itensPorPagina) || 1,
  );

  ngOnInit() {
    this.carregarHistorico();
  }

  carregarHistorico() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (!uuid) return;

    const params = {
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
    };

    this.patrimonioService.getHistorico(uuid, params).subscribe({
      next: (res: any) => {
        this.historico.set(res?.content || []);
        this.totalElements.set(res?.totalElements || 0);
      },
      error: (err) => {
        console.error('Erro ao buscar histórico:', err);
        this.historico.set([]);
        this.totalElements.set(0);
      },
    });
  }

  onPaginaChange(page: number) {
    this.paginaAtual.set(page);
    this.carregarHistorico();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getConfig(acao: string) {
    return (
      this.acaoConfigs[acao] || {
        icone: Info,
        cor: 'text-muted-foreground',
        bg: 'bg-muted',
        label: 'Ação Realizada',
      }
    );
  }

  countChanges(detalhes: any): number {
    if (!detalhes?.para) return 0;
    return Object.keys(detalhes.para).length;
  }

  getBadgeClass(status: string): string {
    const s = status?.toUpperCase();
    switch (s) {
      case 'GUARDADO':
        return 'bg-teal-500/10 text-teal-600 border-teal-500/20';
      case 'USO':
        return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      case 'DEFEITO':
        return 'bg-rose-500/10 text-rose-600 border-rose-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  voltar() {
    this.router.navigate(['/detail-patrimonio', this.route.snapshot.paramMap.get('uuid')]);
  }
}

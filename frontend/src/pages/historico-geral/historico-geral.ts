import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import {
  LucideAngularModule,
  Icons,
  Plus,
  Edit2,
  Truck,
  Info,
  Inbox,
  ExternalLink,
  Hash,
  MapPin,
  ArrowRight,
  Edit3,
  PlusCircle,
  User,
  Barcode,
  Monitor,
  Activity,
  ArrowLeft,
  ArrowRightLeft,
  CornerDownRight,
  FileText,
  Calendar,
  DollarSign,
  Layers,
  UserPlus,
  Trash2,
  MessageSquare,
  LogOut,
  PackageX,
  FilePlus,
  FileCheck,
  FileX,
  AlertCircle,
  Signature,
  PackageCheck,
  ArrowDown,
} from 'lucide-angular';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { environment } from 'src/environments/environment';
import { delay, finalize } from 'rxjs';

@Component({
  selector: 'app-historico-geral',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, RouterModule, ZardPaginationCustomComponent],
  templateUrl: './historico-geral.html',
})
export class HistoricoGeralComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  Icons = {
    History,
    Plus,
    Edit2,
    Truck,
    Info,
    Inbox,
    ExternalLink,
    Hash,
    MapPin,
    ArrowRight,
    Edit3,
    PlusCircle,
    User,
    Barcode,
    Monitor,
    Activity,
    ArrowLeft,
    ArrowRightLeft,
    CornerDownRight,
    FileText,
    Calendar,
    DollarSign,
    Layers,
    UserPlus,
    Trash2,
    MessageSquare,
    LogOut,
    PackageX,
    FilePlus,
    FileCheck,
    FileX,
    AlertCircle,
    Signature,
    PackageCheck,
    ArrowDown,
  };

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

  historico = signal<any[]>([]);
  totalElements = signal<number>(0);
  paginaAtual = signal<number>(1);
  itensPorPagina = 10;
  isLoading = signal<boolean>(true);

  totalPaginas = computed(() => {
    return Math.ceil(this.totalElements() / this.itensPorPagina) || 1;
  });

  ngOnInit() {
    this.carregarHistoricoGeral();
  }

  carregarHistoricoGeral() {
    this.isLoading.set(true);

    const params = {
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
    };

    this.http
      .get<any>(`${environment.apiUrl}/api/historico/todos`, { params })
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          this.historico.set(res.content || []);
          this.totalElements.set(res.totalElements || 0);
        },
        error: (erro) => {
          console.error('Erro ao buscar histórico geral', erro);
          this.historico.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onPaginaChange(novaPagina: number) {
    this.paginaAtual.set(novaPagina);
    this.carregarHistoricoGeral();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  voltar() {
    this.router.navigate(['/patrimonios']);
  }

  getConfig(acao: string) {
    switch (acao) {
      case 'CRIACAO':
        return { cor: 'text-emerald-500', icone: this.Icons.Plus, label: 'Criação' };
      case 'EDICAO':
        return { cor: 'text-amber-500', icone: this.Icons.Edit2, label: 'Edição' };
      case 'MOVIMENTACAO':
        return { cor: 'text-blue-500', icone: this.Icons.ArrowRightLeft, label: 'Movimentação' };
      case 'EMPRESTIMO':
        return { cor: 'text-indigo-500', icone: this.Icons.UserPlus, label: 'Empréstimo' };
      case 'SAIDA_PATRIMONIAL':
        return { cor: 'text-orange-500', icone: this.Icons.LogOut, label: 'Saída' }; // Use LogOut ou ClipboardX
      case 'APAGADO':
        return {
          label: 'Excluído',
          icone: this.Icons.Trash2,
          cor: 'text-rose-500 border-rose-500/20 bg-rose-500/5',
        };

      case 'COMODATO_CRIADO':
        return {
          cor: 'text-emerald-500',
          bg: 'bg-emerald-500/5',
          border: 'border-emerald-500/10',
          icone: this.Icons.FilePlus,
          label: 'Comodato Iniciado',
        };
      case 'COMODATO_ASSINADO':
        return {
          cor: 'text-blue-500',
          bg: 'bg-blue-500/5',
          border: 'border-blue-500/10',
          icone: this.Icons.FileCheck,
          label: 'Comodato Assinado',
        };
      case 'COMODATO_CANCELADO':
        return {
          cor: 'text-amber-500',
          bg: 'bg-amber-500/5',
          border: 'border-amber-500/10',
          icone: this.Icons.FileX,
          label: 'Comodato Cancelado',
        };
      case 'COMODATO_DEVOLUCAO':
        return {
          cor: 'text-purple-500',
          bg: 'bg-purple-500/5',
          border: 'border-purple-500/10',
          icone: this.Icons.PackageCheck,
          label: 'Comodato Devolvido',
        };
      case 'COMODATO_DELETADO':
        return {
          cor: 'text-rose-500',
          bg: 'bg-rose-500/5',
          border: 'border-rose-500/10',
          icone: this.Icons.Trash2,
          label: 'Comodato Excluído',
        };

      default:
        return { cor: 'text-muted-foreground', icone: this.Icons.Info, label: 'Log' };
    }
  }

  countChanges(detalhes: any): number {
    if (!detalhes || !detalhes.para) return 0;
    return Object.keys(detalhes.para).length;
  }
}

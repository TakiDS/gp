import { Component, Input } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import {
  LucideAngularModule,
  Plus,
  ArrowRightLeft,
  Pencil,
  Trash2,
  Info,
  Ban,
  UserPlus,
  PackageX,
  LogOut,
  FilePlus,
  Signature,
  PackageCheck,
  FileCheck,
  FileX,
  AlertCircle,
  ArrowRight,
  FileText,
} from 'lucide-angular';

@Component({
  selector: 'app-log-timeline-item',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, DecimalPipe, DatePipe],
  templateUrl: './log-timeline-item.html',
})
export class LogTimelineItemComponent {
  @Input() log: any;

  readonly ArrowRight = ArrowRight;
  readonly FileText = FileText;

  readonly acaoConfigs: Record<string, { icone: any; cor: string; label: string }> = {
    CRIACAO: { icone: Plus, cor: 'text-green-600', label: 'Patrimônio Registrado' },
    MOVIMENTACAO: { icone: ArrowRightLeft, cor: 'text-blue-600', label: 'Movimentação' },
    EDICAO: { icone: Pencil, cor: 'text-orange-500', label: 'Dados Atualizados' },
    EXCLUSAO: { icone: Trash2, cor: 'text-red-600', label: 'Patrimônio Excluído' },
    APAGADO: { icone: Trash2, cor: 'text-red-600', label: 'Patrimônio Excluído' },
    BAIXA: { icone: Ban, cor: 'text-red-500', label: 'Baixa de Patrimônio' },
    SAIDA_PATRIMONIAL: { icone: LogOut, cor: 'text-red-500', label: 'Saída Patrimonial' },
    EMPRESTIMO: { icone: UserPlus, cor: 'text-indigo-600', label: 'Empréstimo Realizado' },
    COMODATO_CRIADO: { icone: FilePlus, cor: 'text-blue-500', label: 'Comodato Iniciado' },
    COMODATO_ASSINADO: { icone: Signature, cor: 'text-emerald-600', label: 'Termo Assinado' },
    COMODATO_DEVOLUCAO: {
      icone: PackageCheck,
      cor: 'text-purple-600',
      label: 'Comodato Devolvido',
    },
    COMODATO_CANCELADO: { icone: AlertCircle, cor: 'text-amber-500', label: 'Comodato Cancelado' },
    COMODATO_DELETADO: { icone: Trash2, cor: 'text-rose-600', label: 'Comodato Excluído' },
  };

  get config() {
    return (
      this.acaoConfigs[this.log?.detalhesLog?.acao] || {
        icone: Info,
        cor: 'text-gray-400',
        label: 'Ação Desconhecida',
      }
    );
  }

  getBadgeClass(status: string): string {
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

  formatarDataHora(dataIso: string): string {
    if (!dataIso) return '';
    const data = new Date(dataIso);
    return `${data.toLocaleDateString('pt-BR')} às ${data.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })}`;
  }
}

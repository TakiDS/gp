import { ZardBreadcrumbComponent } from '@/shared/components/breadcrumb';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ComodatoService } from '@/shared/core/services/comodato/comodato-service';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  LucideAngularModule,
  House,
  Handshake,
  FileDown,
  Printer,
  CheckCircle,
  Clock,
  Calendar,
  CalendarClock,
  Package,
  Box,
  Eye,
  FileText,
  User,
  Mail,
} from 'lucide-angular';

@Component({
  selector: 'app-detail-comodato',
  standalone: true,
  imports: [RouterLink, CommonModule, LucideAngularModule, ZardBreadcrumbImports],
  templateUrl: './detail-comodato.html',
  styleUrl: './detail-comodato.css',
})
export class DetailComodato implements OnInit {
  // Injeções
  private route = inject(ActivatedRoute);
  private comodatoService = inject(ComodatoService);

  // Ícones Lucide
  readonly House = House;
  readonly Handshake = Handshake;
  readonly FileDown = FileDown;
  readonly Printer = Printer;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly Calendar = Calendar;
  readonly CalendarClock = CalendarClock;
  readonly Package = Package;
  readonly Box = Box;
  readonly Eye = Eye;
  readonly FileText = FileText;
  readonly Mail = Mail;
  readonly User = User; // ← ADICIONAR

  // Signals para estado da tela
  comodato = signal<any>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) {
      this.carregarDados(uuid);
    }
  }

  carregarDados(uuid: string) {
    this.isLoading.set(true);
    this.comodatoService.getById(uuid).subscribe({
      next: (dados) => {
        this.comodato.set(dados);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Erro ao carregar detalhes do comodato:', err);
        this.isLoading.set(false);
      },
    });
  }

  getStatusBadgeClass(estado: string): string {
    const s = estado?.toUpperCase(); // ← era "status" (undefined)
    const base =
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ';
    switch (s) {
      case 'PENDENTE':
        return base + 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ATRASADO':
        return base + 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'FINALIZADO':
      case 'DEVOLVIDO':
        return base + 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'GUARDADO':
        return base + 'bg-teal-500/10 text-teal-400 border-teal-500/20';
      case 'USO':
        return base + 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DEFEITO':
        return base + 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'EMPRESTIMO':
        return base + 'bg-sky-500/10 text-sky-400 border-sky-500/20';
      case 'MANUTENCAO':
        return base + 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'EXTRAVIADO':
        return base + 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      case 'BAIXA':
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      case 'DOACAO':
        return base + 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
      default:
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    // Garante que a data seja tratada corretamente independente do fuso
    const date = new Date(dateStr + 'T12:00:00');
    return date.toLocaleDateString('pt-BR');
  }
}

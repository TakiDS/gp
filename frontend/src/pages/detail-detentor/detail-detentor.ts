import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  House,
  User,
  Mail,
  GraduationCap,
  BookOpen,
  BadgeCheck,
  Award,
  Package,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  Handshake,
  AlertCircle,
  FileText,
  FileDown,
} from 'lucide-angular';
import { DetentorService } from '@/shared/core/services/detentor/detentor-service';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';

@Component({
  selector: 'app-detail-detentor',
  standalone: true,
  imports: [CommonModule, RouterLink, LucideAngularModule, ZardBreadcrumbImports],
  templateUrl: './detail-detentor.html',
})
export class DetailDetentorComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private detentorService = inject(DetentorService);

  readonly House = House;
  readonly User = User;
  readonly Mail = Mail;
  readonly GraduationCap = GraduationCap;
  readonly BookOpen = BookOpen;
  readonly BadgeCheck = BadgeCheck;
  readonly Award = Award;
  readonly Package = Package;
  readonly Calendar = Calendar;
  readonly CalendarClock = CalendarClock;
  readonly CheckCircle = CheckCircle;
  readonly Clock = Clock;
  readonly Handshake = Handshake;
  readonly AlertCircle = AlertCircle;
  readonly FileText = FileText;
  readonly FileDown = FileDown;

  detentor = signal<any>(null);
  isLoading = signal(true);

  readonly totalItens = computed(
    () =>
      this.detentor()?.comodatos?.reduce(
        (acc: number, c: any) => acc + (c.patrimonios?.length || 0),
        0,
      ) || 0,
  );

  readonly comodatosAtivos = computed(
    () => this.detentor()?.comodatos?.filter((c: any) => !c.dataFim).length || 0,
  );

  readonly statusGeral = computed(() => {
    const comodatos = this.detentor()?.comodatos || [];
    const temAtrasado = comodatos.some((c: any) =>
      c.patrimonios?.some((p: any) => p.estadoFinalComodato === 'ATRASADO'),
    );
    const temPendente = comodatos.some((c: any) =>
      c.patrimonios?.some((p: any) => p.estadoFinalComodato === 'PENDENTE'),
    );
    if (temAtrasado) return 'Atrasado';
    if (temPendente) return 'Pendente';
    return 'Regular';
  });

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) this.carregar(uuid);
  }

  carregar(uuid: string) {
    this.isLoading.set(true);
    this.detentorService.getById(uuid).subscribe({
      next: (dados) => {
        this.detentor.set(dados);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR');
  }

  diasRestantes(dataFimEsperado: string): number {
    if (!dataFimEsperado) return 0;
    const hoje = new Date();
    const fim = new Date(dataFimEsperado + 'T12:00:00');
    return Math.ceil((fim.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
  }

  getPerfilLabel(tipoPerfil: string): string {
    if (!tipoPerfil) return 'Desconhecido';
    const p = tipoPerfil.toUpperCase();
    if (p === 'SERVIDORINTERNO') return 'Servidor';
    if (p === 'MONITOR') return 'Monitor';
    if (p === 'ALUNO') return 'Aluno';
    if (p === 'PROFESSOR') return 'Professor';
    return tipoPerfil;
  }

  getPerfilClass(tipoPerfil: string): string {
    if (!tipoPerfil) return '';
    const p = this.getPerfilLabel(tipoPerfil).toLowerCase();
    const base =
      'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wide ';
    switch (p) {
      case 'aluno':
        return base + 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'professor':
        return base + 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'monitor':
        return base + 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'servidor':
        return base + 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getPerfilIcon(tipoPerfil: string): any {
    if (!tipoPerfil) return this.User;
    const p = this.getPerfilLabel(tipoPerfil).toLowerCase();
    switch (p) {
      case 'aluno':
        return this.GraduationCap;
      case 'professor':
        return this.BookOpen;
      case 'monitor':
        return this.Award;
      case 'servidor':
        return this.BadgeCheck;
      default:
        return this.User;
    }
  }

  getComodatoStatusClass(comodato: any): string {
    const base =
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ';
    if (comodato.dataFim) return base + 'bg-green-500/10 text-green-400 border-green-500/20';
    if (comodato.estado === 'ATRASADO')
      return base + 'bg-red-500/10 text-red-400 border-red-500/20';
    return base + 'bg-blue-500/10 text-blue-400 border-blue-500/20';
  }

  getComodatoStatusLabel(comodato: any): string {
    if (comodato.dataFim) return 'DEVOLVIDO';
    if (comodato.estado === 'PENDENTE') return 'EM POSSE';
    return comodato.estado;
  }

  getEstadoFinalClass(estado: string): string {
    const base = 'inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold border ';
    switch (estado?.toUpperCase()) {
      case 'PENDENTE':
        return base + 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'ATRASADO':
        return base + 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'DEVOLVIDO':
        return base + 'bg-green-500/10 text-green-400 border-green-500/20';
      default:
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getStatusGeralClass(): string {
    const base =
      'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ';
    switch (this.statusGeral()) {
      case 'Regular':
        return base + 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'Pendente':
        return base + 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Atrasado':
        return base + 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return base + 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }
}

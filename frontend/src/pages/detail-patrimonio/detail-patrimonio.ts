import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import {
  LucideAngularModule,
  Trash2,
  Pencil,
  ArrowLeftRight,
  ChevronDown,
  House,
  Download,
  FileX2,
  Info,
  History,
  Plus,
  ArrowRightLeft,
  Printer,
} from 'lucide-angular';

import { PatrimonioService } from '@/shared/core/services/patrimonio/patrimonio.service';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { LogTimelineItemComponent } from '../log-timeline-item/log-timeline-item';

import { ZardEditPatrimonioButtonComponent } from 'src/components/dialogs/edit-patrimonio-dialog/edit-patrimonio-dialog';
import { ZardMovePatrimonioButtonComponent } from 'src/components/dialogs/move-patrimonio-dialog/move-patrimonio-dialog';
import { ZardDeletePatrimonioButtonComponent } from 'src/components/dialogs/delete-patrimonio-dialog/delete-patrimonio-dialog';

@Component({
  selector: 'app-detail-patrimonio',
  standalone: true,
  imports: [
    CommonModule,
    DecimalPipe,
    RouterLink,
    LucideAngularModule,
    ZardBreadcrumbImports,
    ZardButtonComponent,
    ZardSkeletonComponent,
    LogTimelineItemComponent,
    ZardEditPatrimonioButtonComponent,
    ZardMovePatrimonioButtonComponent,
    ZardDeletePatrimonioButtonComponent,
  ],
  templateUrl: './detail-patrimonio.html',
  styleUrl: './detail-patrimonio.css',
})
export class DetailPatrimonio implements OnInit {
  readonly House = House;
  readonly Info = Info;
  readonly Download = Download;
  readonly FileX2 = FileX2;
  readonly History = History;
  readonly Printer = Printer;

  readonly patrimonio = signal<any>(null);
  readonly historicoLogs = signal<any[]>([]);
  readonly totalLogs = signal(0);
  readonly isLoading = signal(true);
  readonly isLoadingHistorico = signal(true);

  /** Qual variante de etiqueta está selecionada para preview/download/impressão */
  readonly etiquetaSelecionada = signal<'preta' | 'branca'>('preta');

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private patrimonioService = inject(PatrimonioService);

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) this.carregarDadosIniciais(uuid);
  }

  carregarDadosIniciais(id: string) {
    this.isLoading.set(true);
    this.patrimonioService
      .listInfoPatrimonio(id)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => {
          this.patrimonio.set(data);
          this.buscarHistorico(id);
        },
        error: (err) => {
          console.error('Erro ao carregar patrimônio:', err);
          toast.error('Erro ao carregar dados do patrimônio.');
        },
      });
  }

  /** URL da etiqueta atualmente selecionada */
  get etiquetaUrlAtiva(): string | null {
    const p = this.patrimonio();
    if (!p) return null;
    return this.etiquetaSelecionada() === 'preta'
      ? (p.etiquetaUrlPreta ?? null)
      : (p.etiquetaUrlBranca ?? null);
  }

  /** Verdadeiro se ao menos uma das etiquetas existe */
  get temEtiqueta(): boolean {
    const p = this.patrimonio();
    return !!(p?.etiquetaUrlPreta || p?.etiquetaUrlBranca);
  }

  imprimirEtiqueta() {
    const url = this.etiquetaUrlAtiva;
    if (!url) {
      toast.error('Nenhuma etiqueta disponível para impressão.');
      return;
    }
    this.gerarDocumentoImpressao([{ ...this.patrimonio(), _etiquetaAtiva: url }]);
  }

  readonly summaryCards = computed(() => [
    { label: 'Categoria', value: this.patrimonio().patrimonioGeral.categoria.nome, type: 'text' },
    { label: 'Status', value: this.patrimonio().estado, type: 'status' },
    {
      label: 'Local',
      value: this.patrimonio()?.localizacao?.local ?? 'Indisponível',
      type: 'text',
    },
    { label: 'Valor', value: '', type: 'valor' },
  ]);

  gerarDocumentoImpressao(patrimonios: any[]) {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const dataHoraAtual = new Date().toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    const etiquetasHtml = patrimonios
      .map((p) => {
        const url = p._etiquetaAtiva ?? p.etiquetaUrlPreta ?? p.etiquetaUrlBranca ?? '';
        return `
          <div class="etiqueta">
            <img src="${this.getPreviewUrl(url)}" alt="Etiqueta ${p.numPatrimonio}" />
          </div>`;
      })
      .join('');

    const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Impressão de Patrimônio - WebAcademy</title>
        <style>
          @page { size: A4; margin: 0; }
          body { font-family: Arial, sans-serif; margin: 0; padding: 10mm 15mm; background: white; }
          .header-print { display: flex; justify-content: space-between; align-items: center; font-size: 11px; color: #333; margin-bottom: 2px; }
          .divider { border-top: 0.5pt solid #000; margin-bottom: 25px; width: 100%; }
          .container-etiquetas { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm 4mm; }
          .etiqueta { width: 88mm; height: auto; display: flex; justify-content: flex-start; }
          .etiqueta img { width: 100%; height: auto; display: block; border: none; }
        </style>
      </head>
      <body>
        <div class="header-print">
          <span>${dataHoraAtual}</span>
          <span>Impressão de Patrimônio - WebAcademy</span>
        </div>
        <div class="divider"></div>
        <div class="container-etiquetas">${etiquetasHtml}</div>
        <script>
          window.onload = () => { setTimeout(() => { window.print(); }, 500); };
        </script>
      </body>
    </html>`;

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  private buscarHistorico(id: string) {
    this.isLoadingHistorico.set(true);
    this.patrimonioService.getHistorico(id, { page: 0, size: 3 }).subscribe({
      next: (res: any) => {
        this.isLoadingHistorico.set(false);
        const logs = Array.isArray(res) ? res : res?.content || [];
        this.historicoLogs.set(logs);
        this.totalLogs.set(res?.totalElements || logs.length);
      },
      error: (err) => {
        console.error('Erro ao buscar histórico:', err);
        this.isLoadingHistorico.set(false);
        this.historicoLogs.set([]);
      },
    });
  }

  irParaHistorico() {
    const uuid = this.patrimonio()?.uuid;
    if (uuid) this.router.navigate(['/patrimonio-history', uuid]);
  }

  aoExcluirPatrimonio() {
    this.router.navigate(['/patrimonios']);
    toast.success('Patrimônio deletado com sucesso!');
  }

  aoMovimentarPatrimonio() {
    const uuid = this.patrimonio()?.uuid;
    if (uuid) this.carregarDadosIniciais(uuid);
  }

  aoEditarPatrimonio() {
    const uuid = this.patrimonio()?.uuid;
    toast.success('Patrimônio atualizado com sucesso!');
    if (uuid) this.carregarDadosIniciais(uuid);
  }

  downloadFile(url: string) {
    window.open(url, '_blank');
  }

  getPreviewUrl(url: string | undefined): string {
    if (!url) return 'assets/placeholder.png';
    return url.replace('/raw/upload/', '/image/upload/').replace('.pdf', '.jpg');
  }

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
}

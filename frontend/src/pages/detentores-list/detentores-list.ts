import { Component, OnInit, signal, computed, inject } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Subject, debounceTime, finalize } from 'rxjs';
import { toast } from 'ngx-sonner';

import {
  LucideAngularModule,
  Search,
  Plus,
  MoreHorizontal,
  GraduationCap,
  BookOpen,
  BadgeCheck,
  Box,
  User,
  Monitor,
  ShieldAlert,
  Trash2,
  CheckCircle,
  XCircle,
  Award,
} from 'lucide-angular';

import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardCreateDetentorButtonComponent } from 'src/components/dialogs/create-detentor-dialog/create-detentor-dialog';
import { DetentorService } from '@/shared/core/services/detentor/detentor-service';
import {
  ZardPopoverComponent,
  ZardPopoverDirective,
} from '@/shared/components/popover/popover.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { ZardDeleteDetentorDialogComponent } from 'src/components/dialogs/confirm-delete-detentor/confirm-delete-detentor';
import { ZardSelectImports } from '@/shared/components/select/select.imports';

interface PatrimonioAPI {
  uuid: string;
  descricao: string;
  numPatrimonio: string;
  estado: string;
  estadoFinalComodato: string;
}

interface ComodatoAPI {
  uuid: string;
  estado: string;
  dataFim: string | null;
  patrimonios: PatrimonioAPI[];
}

interface DetentorAPI {
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  tipoPerfil: string;
  statusPerfil?: string;
  comodatos: ComodatoAPI[];
}

interface PatrimonioView {
  uuid: string;
  descricao: string;
  numPatrimonio: string;
  statusContrato: string;
}

interface DetentorView {
  uuid: string;
  nome: string;
  email: string;
  cpf: string;
  tipoPerfilOriginal: string;
  tipoPerfilFormatted: string;
  patrimoniosView: PatrimonioView[];
  statusGeral: 'Regular' | 'Pendente' | 'Atrasado';
  ativo: boolean;
}

@Component({
  selector: 'app-detentores',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ZardSelectComponent,
    ZardPaginationCustomComponent,
    ZardInputDirective,
    ZardCreateDetentorButtonComponent,
    ZardDeleteDetentorDialogComponent,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardSkeletonComponent,
    ZardSelectImports,
  ],
  templateUrl: './detentores-list.html',
  styleUrls: ['./detentores-list.css'],
})
export class DetentoresComponent implements OnInit {
  private detentoresService = inject(DetentorService);
  private dialogService = inject(ZardDialogService);

  readonly icons = {
    Search,
    Plus,
    MoreHorizontal,
    GraduationCap,
    BookOpen,
    BadgeCheck,
    Box,
    User,
    Monitor,
    ShieldAlert,
    Trash2,
    CheckCircle,
    XCircle,
    Award,
  };

  readonly detentores = signal<DetentorView[]>([]);
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);
  readonly currentPage = signal(1);
  readonly itemsPerPage = 8;

  readonly detentoresForm = new FormGroup({
    search: new FormControl(''),
    filtroPerfil: new FormControl('todos'),
    filtroStatus: new FormControl('todos'),
  });

  private busca$ = new Subject<string>();

  readonly totalPages = computed(() => {
    return Math.ceil(this.totalElements() / this.itemsPerPage) || 1;
  });

  ngOnInit(): void {
    this.busca$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(1);
      this.carregarDetentores();
    });

    this.detentoresForm.get('search')?.valueChanges.subscribe((value) => {
      this.busca$.next(value || '');
    });

    this.detentoresForm.get('filtroPerfil')?.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.carregarDetentores();
    });

    this.detentoresForm.get('filtroStatus')?.valueChanges.subscribe(() => {
      this.currentPage.set(1);
      this.carregarDetentores();
    });

    this.carregarDetentores();
  }

  carregarDetentores() {
    this.isLoading.set(true);

    const statusSelecionado = this.detentoresForm.value.filtroStatus;
    let statusMapeado = '';

    if (statusSelecionado === 'ativos') {
      statusMapeado = 'ATIVO';
    } else if (statusSelecionado === 'inativos') {
      statusMapeado = 'INATIVO';
    }

    const params = {
      termoBusca: this.detentoresForm.value.search || '',
      perfil:
        this.detentoresForm.value.filtroPerfil !== 'todos'
          ? this.detentoresForm.value.filtroPerfil
          : '',
      statusPerfil: statusMapeado,
      page: this.currentPage() - 1,
      size: this.itemsPerPage,
    };

    this.detentoresService
      .listAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const listaAPI = res?.content || [];
          this.totalElements.set(res?.totalElements || 0);
          console.log('comodatos do primeiro detentor:', listaAPI[0]?.comodatos);

          const viewData: DetentorView[] = listaAPI.map((d: DetentorAPI) => {
            const allPatrimonios: PatrimonioView[] = [];
            let hasPendente = false;
            let hasAtrasado = false;

            if (d.comodatos) {
              d.comodatos.forEach((c) => {
                // Ignorar comodatos já devolvidos — não entram na lista nem no statusGeral
                if (c.dataFim) return;

                if (c.patrimonios) {
                  c.patrimonios.forEach((p) => {
                    if (p.estadoFinalComodato === 'PENDENTE') hasPendente = true;
                    if (p.estadoFinalComodato === 'ATRASADO') hasAtrasado = true;

                    allPatrimonios.push({
                      uuid: p.uuid,
                      descricao: p.descricao,
                      numPatrimonio: p.numPatrimonio,
                      statusContrato: p.estadoFinalComodato,
                    });
                  });
                }
              });
            }

            let statusGeral: 'Regular' | 'Pendente' | 'Atrasado' = 'Regular';
            if (hasAtrasado) statusGeral = 'Atrasado';
            else if (hasPendente) statusGeral = 'Pendente';

            return {
              uuid: d.uuid,
              nome: d.nome,
              email: d.email,
              cpf: d.cpf || '',
              tipoPerfilOriginal: d.tipoPerfil,
              tipoPerfilFormatted: this.formatarPerfil(d.tipoPerfil),
              patrimoniosView: allPatrimonios,
              statusGeral,
              ativo: d.statusPerfil !== 'INATIVO',
            };
          });

          this.detentores.set(viewData);
        },
        error: () => {
          this.detentores.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.carregarDetentores();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onDetentorCriado() {
    toast.success('Detentor cadastrado com sucesso!');
    this.currentPage.set(1);
    this.carregarDetentores();
  }

  onToggleStatus(item: DetentorView) {
    this.detentoresService.getById(item.uuid).subscribe({
      next: (fullDetentorData) => {
        const payload = {
          ...fullDetentorData,
          statusPerfil: item.ativo ? 'INATIVO' : 'ATIVO',
        };

        this.detentoresService.update(item.uuid, payload).subscribe({
          next: () => {
            const acao = item.ativo ? 'desativado' : 'ativado';
            toast.success(`Detentor ${acao} com sucesso!`);
            this.carregarDetentores();
          },
        });
      },
      error: () => {
        toast.error('Erro ao buscar dados completos do detentor para atualização.');
      },
    });
  }

  onExcluir(item: DetentorView) {
    const dialogRef = this.dialogService.create({
      zContent: ZardDeleteDetentorDialogComponent,
      zWidth: '550px',
      zHideFooter: true,
      zData: item,
    });

    const instance = dialogRef.componentInstance as ZardDeleteDetentorDialogComponent;

    instance.onConfirm.subscribe(() => {
      this.detentoresService.delete(item.uuid).subscribe({
        next: () => {
          toast.success('Detentor excluído com sucesso!');
          this.currentPage.set(1);
          this.carregarDetentores();
        },
        error: () => {
          toast.error('Erro ao excluir detentor.');
        },
      });
    });
  }

  setFiltroStatus(value: string) {
    this.detentoresForm.get('filtroStatus')?.setValue(value);
    setTimeout(() => document.body.click());
  }
  
  formatarPerfil(perfilRaw: string): string {
    if (!perfilRaw) return 'Desconhecido';
    const p = perfilRaw.toUpperCase();
    if (p === 'SERVIDORINTERNO') return 'Servidor';
    if (p === 'MONITOR') return 'Monitor';
    if (p === 'ALUNO') return 'Aluno';
    if (p === 'PROFESSOR') return 'Professor';
    return p.charAt(0).toUpperCase() + p.slice(1).toLowerCase();
  }

  getPerfilClass(perfil: string): string {
    if (!perfil) return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    const p = perfil.toLowerCase();
    switch (p) {
      case 'aluno':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'professor':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      case 'monitor':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'servidor':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  getPerfilIcon(perfil: string): any {
    if (!perfil) return this.icons.User;
    const p = perfil.toLowerCase();
    switch (p) {
      case 'aluno':
        return this.icons.GraduationCap;
      case 'professor':
        return this.icons.BookOpen;
      case 'monitor':
        return this.icons.Award;
      case 'servidor':
        return this.icons.BadgeCheck;
      default:
        return this.icons.User;
    }
  }
}

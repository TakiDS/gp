import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ZardDialogService } from '@/shared/components/dialog/dialog.service';
import { CreateUserDialog } from 'src/components/dialogs/create-user-dialog/create-user-dialog';
import { EditUserDialogComponent } from 'src/components/dialogs/edit-user-dialog/edit-user-dialog';
import { DeleteUserDialogComponent } from 'src/components/dialogs/delete-user-dialog/delete-user-dialog';
import { UserService, UsuarioDTO } from '@/shared/core/services/user/user.service';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { environment } from 'src/environments/environment';
import { toast } from 'ngx-sonner';
import { debounceTime, Subject } from 'rxjs';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  Search,
  Plus,
  MoreHorizontal,
  Trash2,
  Pencil,
  Shield,
  User,
  Lock,
} from 'lucide-angular';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import {
  ZardPopoverComponent,
  ZardPopoverDirective,
} from '@/shared/components/popover/popover.component';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';
import { ZardProcessingUserInviteComponent } from 'src/components/dialogs/processing-user-dialog/processing-user-dialog';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    HttpClientModule,
    LucideAngularModule,
    ZardPaginationCustomComponent,
    ReactiveFormsModule,
    ZardInputDirective,
    ZardPopoverComponent,
    ZardPopoverDirective,
    ZardSkeletonComponent,
  ],
  templateUrl: './users.html',
  styleUrls: ['./users.css'],
})
export class Users implements OnInit {
  private fb = inject(FormBuilder);
  private dialogService = inject(ZardDialogService);
  private userService = inject(UserService);
  private router = inject(Router);

  readonly icons = { Search, Plus, MoreHorizontal, Trash2, Pencil, Shield, User, Lock };

  usersForm: FormGroup = this.fb.group({ search: [''] });

  readonly users = signal<UsuarioDTO[]>([]);
  readonly totalElements = signal(0);
  readonly paginaAtual = signal(1);
  readonly itensPorPagina = 6;

  private busca$ = new Subject<string>();
  isAdmin = false;

  private meuUuid = '';

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.totalElements() / this.itensPorPagina) || 1;
  });

  ngOnInit(): void {
    this.verificarPermissao();

    if (this.isAdmin) {
      this.busca$.pipe(debounceTime(400)).subscribe(() => {
        this.paginaAtual.set(1);
        this.carregarUsuarios();
      });
      this.usersForm.get('search')?.valueChanges.subscribe((v) => this.busca$.next(v || ''));
      this.carregarUsuarios();
    }
  }

  carregarUsuarios() {
    const params = {
      termoBusca: this.usersForm.value.search || '',
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
    };
    this.userService.listar(params).subscribe({
      next: (res: any) => {
        this.users.set(res?.content || []);
        this.totalElements.set(res?.totalElements || 0);
      },
      error: () => {
        this.users.set([]);
        this.totalElements.set(0);
      },
    });
  }

  onPaginaChange(page: any) {
    this.paginaAtual.set(page);
    this.carregarUsuarios();
  }

  verificarPermissao() {
    this.isAdmin = false;
    const token = localStorage.getItem('auth-token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roleToken = (payload.role || payload.roles || '').toString().toUpperCase();
        if (roleToken.includes('ADMIN') || roleToken.includes('GESTOR')) this.isAdmin = true;

        this.meuUuid = payload.uuid || payload.sub || '';
      } catch (e) {}
    }
  }

  openCreate() {
    const dialogRef = this.dialogService.create({
      zContent: CreateUserDialog,
      zHideFooter: true,
      zWidth: 'min(500px, calc(100vw - 32px))',
    });
    const instance = dialogRef.componentInstance as CreateUserDialog;

    instance.userCreated.subscribe((payload: any) => {
      dialogRef.close();

      const processingRef = this.dialogService.create({
        zContent: ZardProcessingUserInviteComponent,
        zHideFooter: true,
        zClosable: false,
        zWidth: 'min(560px, calc(100vw - 32px))',
      });

      this.userService.convidar(payload).subscribe({
        next: () => {
          processingRef.close();
          toast.success('Convite enviado com sucesso!');
          this.carregarUsuarios();
        },
        error: (err) => {
          processingRef.close();
          toast.error(err.error?.message || 'Erro ao enviar convite. Tente novamente.');
        },
      });
    });
  }

  onEdit(user: UsuarioDTO) {
    this.dialogService.create({
      zContent: EditUserDialogComponent,
      zHideFooter: true,
      zWidth: '480px',
      zData: {
        uuid: user.uuid,
        nomeAtual: user.nome,
        onSuccess: (payload: { nome: string }) => {
          this.userService.atualizar(user.uuid, payload).subscribe({
            next: () => {
              toast.success('Nome atualizado!');
              this.carregarUsuarios();
            },
            error: () => toast.error('Erro ao atualizar.'),
          });
        },
      },
    });
  }

  onToggleStatus(user: UsuarioDTO) {
    const novoStatus = user.status === 'ATIVO' ? 'INATIVO' : 'ATIVO';
    this.userService.atualizar(user.uuid, { status: novoStatus }).subscribe({
      next: () => {
        toast.success(`Status alterado para ${novoStatus}.`);
        this.carregarUsuarios();
      },
    });
  }

  onTornarAdmin(user: UsuarioDTO) {
    this.userService.alterarRole(user.uuid, 'ADMIN').subscribe({
      next: (res) => {
        toast.success(`"${user.nome}" agora é o novo Administrador!`);
        if (res?.logoutImediato) {
          localStorage.removeItem('auth-token');
          localStorage.removeItem('user');
          setTimeout(() => this.router.navigate(['/login']), 800);
        } else {
          this.carregarUsuarios();
        }
      },
    });
  }

  onDelete(user: UsuarioDTO) {
    const dialogRef = this.dialogService.create({
      zContent: DeleteUserDialogComponent,
      zHideFooter: true,
      zWidth: '440px',
      zData: {
        uuid: user.uuid,
        nome: user.nome,
        login: user.login,
      },
    });

    const instance = dialogRef.componentInstance as DeleteUserDialogComponent;

    instance.confirmado.subscribe(() => {
      this.userService.excluir(user.uuid).subscribe({
        next: () => {
          toast.success('Usuário removido com sucesso.');
          instance.closeSuccess();
          this.carregarUsuarios();
        },
        
      });
    });
  }

  isMySelf(user: UsuarioDTO): boolean {
    return user.uuid === this.meuUuid;
  }
}

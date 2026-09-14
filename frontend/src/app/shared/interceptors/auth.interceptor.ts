import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { toast } from 'ngx-sonner';
import { ZardDialogService } from '../components/dialog/dialog.service';
import { AuthService } from '../core/services/auth/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const dialogService = inject(ZardDialogService);

  const token = authService.getToken();
  const authReq = token ? addToken(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        dialogService.closeAll();
        authService.logout();
        toast.error('Sessão expirada', { description: 'Faça login novamente.' });
        router.navigate(['/login']);
        return throwError(() => error);
      }

      return handleOtherErrors(error, router, dialogService);
    }),
  );
};

function addToken(req: HttpRequest<any>, token: string): HttpRequest<any> {
  return req.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}

function handleOtherErrors(
  error: HttpErrorResponse,
  router: Router,
  dialogService: ZardDialogService,
) {
  if (error.status === 0) {
    toast.error('Erro de Conexão', {
      description: 'Não foi possível conectar ao servidor.',
    });
  } else if (error.status === 400 && Array.isArray(error.error)) {
    error.error.forEach((err: any) => {
      toast.error(`Erro no campo ${err.campo}`, { description: err.mensagem });
    });
  } else if (error.status === 403) {
    dialogService.closeAll();
    toast.error('Acesso Negado', {
      description: 'Você não tem permissão para acessar este recurso.',
    });
    router.navigate(['/login']);
  } else if (error.error?.message) {
    toast.error('Atenção', { description: error.error.message });
  }

  return throwError(() => error);
}

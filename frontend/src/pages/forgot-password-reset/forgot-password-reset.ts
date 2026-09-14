import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ZardButtonComponent } from '../../app/shared/components/button/button.component';
import { ZardInputDirective } from '../../app/shared/components/input/input.directive';
import { LucideAngularModule, ArrowRight, Eye, EyeOff } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { environment } from 'src/environments/environment';
import { ZardDarkMode } from '@/shared/services';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';

@Component({
  selector: 'app-forgot-password-reset',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ZardInputDirective,
    ZardButtonComponent,
    LucideAngularModule,
    ZardIconComponent,
  ],
  templateUrl: './forgot-password-reset.html',
  styleUrl: './forgot-password-reset.css',
})
export class ForgotPasswordReset implements OnInit {
  readonly ArrowRight = ArrowRight;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  mostrarSenha = false;
  mostrarConfirmar = false;

  senhaModel = '';
  confirmarSenhaModel = '';
  token = '';
  currentYear = new Date().getFullYear();

  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private darkModeService = inject(ZardDarkMode);

  toggleTheme(): void {
    this.darkModeService.toggleTheme();
  }

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.token = params['token'] || '';
    });
  }

  definirNovaSenha() {
    if (!this.senhaModel || this.senhaModel.trim().length < 6) {
      toast.warning('Atenção', { description: 'A senha deve ter no mínimo 8 caracteres.' });
      return;
    }

    if (this.senhaModel !== this.confirmarSenhaModel) {
      toast.error('Senhas não coincidem', {
        description: 'Verifique os campos e tente novamente.',
      });
      return;
    }

    this.http
      .post(`${environment.apiUrl}/auth/definir-senha`, {
        token: this.token,
        novaSenha: this.senhaModel,
        confirmarSenha: this.confirmarSenhaModel,
      })
      .subscribe({
        next: () => {
          toast.success('Senha alterada com sucesso!');
          this.router.navigate(['/login']);
        },
      });
  }
}

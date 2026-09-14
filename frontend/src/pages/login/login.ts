import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { toast } from 'ngx-sonner';

import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { environment } from 'src/environments/environment';
import { ZardDarkMode } from '@/shared/services';
import { ZardIconComponent } from '@/shared/components/icon/icon.component';
import { Eye, EyeOff, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    LucideAngularModule,
    ReactiveFormsModule,
    RouterModule,
    RouterLink,
    ZardInputDirective,
    ZardButtonComponent,
    ZardIconComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  loginForm: FormGroup;
  currentYear = new Date().getFullYear();
  isLoading = false;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  mostrarSenha = false;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private http = inject(HttpClient);

  private readonly darkModeService = inject(ZardDarkMode);

  toggleTheme(): void {
    this.darkModeService.toggleTheme();
  }

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;

    const dadosLogin = {
      login: this.loginForm.value.email,
      senha: this.loginForm.value.password,
    };

    this.http.post<any>(`${environment.apiUrl}/auth/login`, dadosLogin).subscribe({
      next: (resposta) => {
        localStorage.setItem('auth-token', resposta.token);

        this.http.get<any>(`${environment.apiUrl}/usuarios/me`).subscribe({
          next: (user) => {
            localStorage.setItem('user', JSON.stringify(user));

            toast.success('Login Realizado!', {
              description: `Bem-vindo, ${user.nome || 'Usuário'}!`,
            });

            this.router.navigate(['/patrimonios']).then(() => {});
          },
          error: (errProfile) => {
            console.error('Erro ao carregar perfil:', errProfile);
            this.router.navigate(['/patrimonios']);
          },
        });
      },
      error: (erro) => {
        console.error('Erro:', erro);
        this.isLoading = false;

        const mensagemErro =
          erro.status === 403 || erro.status === 401
            ? 'Email ou senha inválidos.'
            : 'Erro ao conectar com o servidor.';

        toast.error('Falha no Login', {
          description: mensagemErro,
        });
      },
    });
  }
}

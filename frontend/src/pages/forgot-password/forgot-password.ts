import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

import { ZardButtonComponent } from '../../app/shared/components/button/button.component';
import { ZardInputDirective } from '../../app/shared/components/input/input.directive';
import { LucideAngularModule, ArrowRight } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { environment } from 'src/environments/environment';
import { ZForgotPasswordSendingModalComponent } from 'src/components/dialogs/forgot-password-email-sending-dialog/forgot-password-email-sending-dialog';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ZardInputDirective,
    ZardButtonComponent,
    LucideAngularModule,
    ZForgotPasswordSendingModalComponent,
  ],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css',
})
export class ForgotPassword {
  readonly ArrowRight = ArrowRight;
  emailModel: string = '';

  isSending = signal(false);

  private http = inject(HttpClient);
  private router = inject(Router);

  enviarCodigo() {
    if (!this.emailModel || this.emailModel.trim() === '') {
      toast.warning('Atenção', { description: 'Por favor, digite seu e-mail corporativo.' });
      return;
    }

    const payload = { email: this.emailModel };

    // Exibe o modal de loading
    this.isSending.set(true);

    this.http.post(`${environment.apiUrl}/auth/recuperar-senha`, payload).subscribe({
      next: () => {
        this.isSending.set(false);
        toast.success('E-mail enviado!', { description: 'Verifique sua caixa de entrada.' });

        this.router.navigate(['/forgot-password-confirm'], {
          queryParams: { email: this.emailModel },
        });
      },
      error: (erro) => {
        this.isSending.set(false);
        console.error('Erro ao enviar:', erro);
        toast.error('Falha no envio', { description: 'Verifique se o e-mail está correto.' });
      },
    });
  }
}

import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { BadgeCheck, Download, LucideAngularModule, Loader2, AlertCircle } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-confirm-assinar-termo',
  standalone: true,
  imports: [LucideAngularModule, CommonModule],
  templateUrl: './confirm-assinar-termo.html',
  styleUrl: './confirm-assinar-termo.css',
})
export class ConfirmAssinarTermo implements OnInit {
  readonly BadgeCheck = BadgeCheck;
  readonly Download = Download;
  readonly Loader2 = Loader2;
  readonly AlertCircle = AlertCircle;

  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  status = signal<'loading' | 'success' | 'error'>('loading');
  mensagemErro = signal<string>('');
  termoUrl = signal<string | null>(null);

  ngOnInit() {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (token) {
      this.enviarAssinatura(token);
    } else {
      this.status.set('error');
      this.mensagemErro.set('Token de assinatura não encontrado na URL.');
    }
  }

  enviarAssinatura(token: string) {
    const url = `${environment.apiUrl}/comodato/assinar-termo`;

    this.http.get(url, { params: { token } }).subscribe({
      next: (response: any) => {
        this.termoUrl.set(response.url);
        this.status.set('success');
      },
      error: (err) => {
        console.error('Erro ao assinar:', err);
        this.status.set('error');
        this.mensagemErro.set(
          'Não foi possível processar sua assinatura. O link pode ter expirado.',
        );
      },
    });
  }

  baixarTermo() {
    const url = this.termoUrl();
    if (url) {
      window.open(url, '_blank');
    } else {
      console.error('URL do termo não encontrada.');
    }
  }
}

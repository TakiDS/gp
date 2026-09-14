import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-public-patrimonio',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './public-patrimonio-detail.html'
})
export class PublicPatrimonioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private http = inject(HttpClient);

  readonly patrimonio = signal<any>(null);
  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  ngOnInit() {
    const uuid = this.route.snapshot.paramMap.get('uuid');
    if (uuid) this.carregarPatrimonio(uuid);
  }

  private carregarPatrimonio(uuid: string) {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.http
      .get<any>(`${environment.apiUrl}/public/patrimonio/${uuid}`)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (data) => this.patrimonio.set(data),
        error: () => this.hasError.set(true),
      });
  }

  getStatusClasses(status: string): string {
    const s = (status || '').toUpperCase();
    
    // Classes com suporte a dark mode para manter a leitura em ambos os temas
    switch (s) {
      case 'GUARDADO':
        return 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-500/10 dark:text-teal-400 dark:border-teal-500/20';
      case 'USO':
      case 'EM USO':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
      case 'DEFEITO':
        return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20';
      case 'EMPRESTIMO':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20';
      case 'MANUTENCAO':
        return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-400 dark:border-purple-500/20';
      case 'EXTRAVIADO':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
      case 'BAIXA':
        return 'bg-gray-100 text-gray-700 border-gray-300 dark:bg-gray-500/10 dark:text-gray-400 dark:border-gray-500/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  }

  formatarData(data: string | null | undefined): string {
    if (!data) return '—';
    const [year, month, day] = data.split('-');
    return `${day}/${month}/${year}`;
  }
}

import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { LucideAngularModule, Search, ChevronRight, House, MapPin } from 'lucide-angular';
import { debounceTime, delay, finalize, Subject } from 'rxjs';
import { toast } from 'ngx-sonner';

import { CardDefaultComponent } from '../card-default/card-default';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardCreateLocalButtonComponent } from 'src/components/dialogs/create-local-dialog/create-local-dialog';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { LocalService } from '@/shared/core/services/local/local.service';
import { ZardBreadcrumbImports } from '@/shared/components/breadcrumb/breadcrumb.imports';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';

interface LocalApiResponse {
  uuid: string;
  local: string;
  totalPatrimonio: string;
}

@Component({
  selector: 'app-list-locals',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardDefaultComponent,
    LucideAngularModule,
    ZardInputDirective,
    ZardCreateLocalButtonComponent,
    ZardPaginationCustomComponent,
    RouterLink,
    ZardBreadcrumbImports,
    ZardSkeletonComponent,
  ],
  templateUrl: './list-locals.html',
})
export class ListLocalsComponent implements OnInit {
  readonly Search = Search;
  readonly ChevronRight = ChevronRight;
  readonly House = House;
  readonly MapPin = MapPin;

  private readonly localService = inject(LocalService);

  readonly locaisForm = new FormGroup({
    search: new FormControl(''),
  });

  readonly locais = signal<any[]>([]);
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);

  readonly itemsPerPage = 8;
  readonly currentPage = signal(1);

  private busca$ = new Subject<string>();

  readonly totalPages = computed(() => {
    return Math.ceil(this.totalElements() / this.itemsPerPage);
  });

  ngOnInit() {
    this.busca$.pipe(debounceTime(400)).subscribe(() => {
      this.currentPage.set(1);
      this.carregarLocais();
    });

    this.locaisForm.get('search')?.valueChanges.subscribe((value) => {
      this.busca$.next(value || '');
    });

    this.carregarLocais();
  }

  carregarLocais() {
    this.isLoading.set(true);

    const params = {
      termoBusca: this.locaisForm.value.search || '',
      page: this.currentPage() - 1,
      size: this.itemsPerPage,
    };

    this.localService
      .listAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const lista = res?.content || [];
          const total = res?.totalElements || 0;

          const dadosMapeados = lista.map((item: LocalApiResponse) => ({
            uuid: item.uuid,
            nome: item.local,
            totalPatrimonio: item.totalPatrimonio,
          }));

          this.locais.set(dadosMapeados);
          this.totalElements.set(total);
        },
        error: (err) => {
          console.error('Erro na API:', err);
          this.locais.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onLocalCriado(localApi: LocalApiResponse) {
    toast.success('Local adicionado com sucesso!');

    this.currentPage.set(1);
    this.carregarLocais();
  }

  onPageChange(page: number) {
    this.currentPage.set(page);
    this.carregarLocais();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

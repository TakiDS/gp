import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Search, ChevronRight } from 'lucide-angular';
import { toast } from 'ngx-sonner';
import { CategoryService } from '@/shared/core/services/category/category.service';
import { ZardCreateCategoryButtonComponent } from 'src/components/dialogs/create-category-dialog/create-category-dialog';
import { ZardDemoDialogBasicComponent } from 'src/components/dialogs/create-patrimonio-dialog/create-patrimonio-dialog';
import { ZardPaginationCustomComponent } from 'src/components/pagination/pagination';
import { debounceTime, delay, finalize, Subject } from 'rxjs';
import { ZardSkeletonComponent } from '@/shared/components/skeleton';

export interface CategoriaApiResponse {
  uuid: string;
  nome: string;
  descricao: string;
  patrimonioGeral: any[];
  totalPatrimonio: number;
}

@Component({
  selector: 'app-list-categories',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LucideAngularModule,
    ZardDemoDialogBasicComponent,
    ZardPaginationCustomComponent,
    ZardCreateCategoryButtonComponent,
    ZardSkeletonComponent,
  ],
  templateUrl: './list-categories.html',
  styleUrl: './list-categories.css',
})
export class ListCategories implements OnInit {
  readonly Search = Search;
  readonly ChevronRight = ChevronRight;

  private readonly patrimonioService = inject(CategoryService);

  categoriasForm = new FormGroup({
    search: new FormControl(''),
  });

  readonly categorias = signal<any[]>([]);
  readonly searchTerm = signal<string>('');
  readonly totalElements = signal(0);
  readonly isLoading = signal(false);

  private busca$ = new Subject<string>();

  readonly itensPorPagina = 8;
  readonly paginaAtual = signal(1);

  readonly totalPaginas = computed(() => {
    return Math.ceil(this.totalElements() / this.itensPorPagina);
  });

  ngOnInit() {
    this.busca$.pipe(debounceTime(400)).subscribe(() => {
      this.paginaAtual.set(1);
      this.carregarCategorias();
    });

    this.categoriasForm.get('search')?.valueChanges.subscribe((value) => {
      this.busca$.next(value || '');
    });

    this.carregarCategorias();
  }

  private carregarCategorias() {
    this.isLoading.set(true);

    const params = {
      termoBusca: this.categoriasForm.value.search || '',
      page: this.paginaAtual() - 1,
      size: this.itensPorPagina,
    };

    this.patrimonioService
      .listAll(params)
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          const lista = res?.content || [];
          const total = res?.totalElements || 0;

          const dadosMapeados = lista.map((item: CategoriaApiResponse) => ({
            id: item.uuid,
            nome: item.nome,
            descricao: item.descricao,
            totalPatrimonio: item.totalPatrimonio,
          }));

          this.categorias.set(dadosMapeados);
          this.totalElements.set(total);
        },
        error: (err) => {
          console.error('Erro na API:', err);
          this.categorias.set([]);
          this.totalElements.set(0);
        },
      });
  }

  onCategoriaCriada() {
    toast.success('Categoria criada com sucesso!');
    this.paginaAtual.set(1);
    this.carregarCategorias();
  }

  onPaginaChange(page: number) {
    this.paginaAtual.set(page);
    this.carregarCategorias();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

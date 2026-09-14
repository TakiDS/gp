import { Component, input, output, computed } from '@angular/core';
import { ZardPaginationImports } from '@/shared/components/pagination/pagination.imports';

@Component({
  selector: 'zard-pagination-custom',
  imports: [ZardPaginationImports],
  standalone: true,
  template: `
    @if (totalPaginas() > 0) {
      <z-pagination
        [zTotal]="totalPaginas() * 10"
        [zPageIndex]="paginaAtual()"
        (zPageIndexChange)="paginaChange.emit($event)"
        [zContent]="content"
      />
    }

    <ng-template #content>
      <ul z-pagination-content>
        <li z-pagination-item>
          <z-pagination-previous (click)="previous()" [zDisabled]="paginaAtual() === 1" />
        </li>

        @for (page of pages(); track page) {
          <li z-pagination-item>
            <button
              z-pagination-button
              [zActive]="page === paginaAtual()"
              (click)="paginaChange.emit(page)"
            >
              {{ page }}
            </button>
          </li>
        }

        <li z-pagination-item>
          <z-pagination-next (click)="next()" [zDisabled]="paginaAtual() === totalPaginas()" />
        </li>
      </ul>
    </ng-template>
  `,
})
export class ZardPaginationCustomComponent {
  // Usando Signal Inputs para garantir reatividade total
  paginaAtual = input.required<number>();
  totalPaginas = input.required<number>();
  paginaChange = output<number>();

  // Este computed vai "esperar" o totalPaginas mudar de 0 para 2
  readonly pages = computed(() => {
    const total = this.totalPaginas();
    if (total <= 0) return [];
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  previous() {
    if (this.paginaAtual() > 1) this.paginaChange.emit(this.paginaAtual() - 1);
  }

  next() {
    if (this.paginaAtual() < this.totalPaginas()) this.paginaChange.emit(this.paginaAtual() + 1);
  }
}

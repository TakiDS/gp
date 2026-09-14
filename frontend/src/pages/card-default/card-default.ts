import { Component, Input } from '@angular/core';
import { ChevronRight, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-card-default',
  imports: [LucideAngularModule],
  templateUrl: './card-default.html',
  standalone: true,
})
export class CardDefaultComponent {
  @Input() titulo: string = '';
  @Input() quantidade: number = 0;
  @Input() labelQuantidade: string = 'Quantidade de Patrimônios';
  @Input() icone: string = 'assets/icons/pin.svg'; 

  readonly ChevronRight = ChevronRight;
}
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  inject,
  OnInit,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  LucideAngularModule,
  FileText,
  Building2,
  Hash,
  DollarSign,
  Calendar,
  Package,
} from 'lucide-angular';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';
import { Z_MODAL_DATA } from '@/shared/components/dialog/dialog.service';
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardDatePickerComponent } from '@/shared/components/date-picker/date-picker.component';
import { NotaFiscalService } from '@/shared/core/services/nota-fiscal/nota-fiscal-service';

@Component({
  selector: 'app-edit-nota-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    LucideAngularModule,
    ZardInputDirective,
    ZardDatePickerComponent,
  ],
  styles: [
    `
      @keyframes scale-in {
        from {
          opacity: 0;
          transform: scale(0.96);
        }
        to {
          opacity: 1;
          transform: scale(1);
        }
      }
      @keyframes slide-from-top {
        from {
          opacity: 0;
          transform: translateY(-16px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      @keyframes fade-up {
        from {
          opacity: 0;
          transform: translateY(12px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      .anim-scale-in {
        animation: scale-in 0.35s cubic-bezier(0.22, 0.68, 0, 1.2) both;
      }
      .anim-header {
        animation: slide-from-top 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 60ms;
      }
      .anim-field-1 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 120ms;
      }
      .anim-field-2 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 175ms;
      }
      .anim-field-3 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 230ms;
      }
      .anim-field-4 {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 285ms;
      }
      .anim-actions {
        animation: fade-up 0.4s cubic-bezier(0.22, 0.68, 0, 1.2) both;
        animation-delay: 340ms;
      }
    `,
  ],
  template: `
    <div
      class="w-full rounded-2xl bg-background text-foreground px-5 py-5 sm:px-7 sm:py-7 anim-scale-in"
    >
      <!-- Header -->
      <div class="flex items-start justify-between mb-5 pb-4 border-b border-border anim-header">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <lucide-angular [img]="FileText" size="17" class="text-primary"></lucide-angular>
          </div>
          <div>
            <h2 class="text-base sm:text-lg font-bold tracking-tight">Editar Nota Fiscal</h2>
            <p class="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Corrija os dados da nota. O arquivo PDF permanece inalterado.
            </p>
          </div>
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
        <!-- Fornecedor -->
        <div class="flex flex-col gap-1.5 anim-field-1">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
          >
            <lucide-angular [img]="Building2" size="13"></lucide-angular>
            Fornecedor
          </label>
          <input
            z-input
            formControlName="fornecedor"
            placeholder="Nome do fornecedor"
            class="w-full h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md"
          />
          @if (form.get('fornecedor')?.touched && form.get('fornecedor')?.invalid) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
              >Campo obrigatório.</span
            >
          }
        </div>

        <!-- CNPJ -->
        <div class="flex flex-col gap-1.5 anim-field-2">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
          >
            <lucide-angular [img]="Hash" size="13"></lucide-angular>
            CNPJ
          </label>
          <input
            z-input
            formControlName="cnpj"
            placeholder="00.000.000/0000-00"
            maxlength="18"
            (input)="onCnpjChange($event)"
            class="w-full h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md font-mono"
          />
          @if (form.get('cnpj')?.touched && form.get('cnpj')?.invalid) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
              >CNPJ inválido (14 dígitos).</span
            >
          }
        </div>

        <!-- Valor Total + Quantidade em grid -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div class="flex flex-col gap-1.5 anim-field-3">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
            >
              <lucide-angular [img]="DollarSign" size="13"></lucide-angular>
              Valor Total da Nota
            </label>
            <input
              z-input
              formControlName="valorTotalNota"
              placeholder="R$ 0,00"
              (input)="onValorChange($event)"
              class="w-full h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md"
            />
            @if (form.get('valorTotalNota')?.touched && form.get('valorTotalNota')?.invalid) {
              <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                >Valor obrigatório.</span
              >
            }
          </div>

          <div class="flex flex-col gap-1.5 anim-field-3">
            <label
              class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
            >
              <lucide-angular [img]="Package" size="13"></lucide-angular>
              Qtd. de Itens
            </label>
            <input
              z-input
              type="number"
              formControlName="quantidadeItensNota"
              placeholder="0"
              min="1"
              class="w-full h-11 bg-muted/30 border-border focus:ring-2 focus:ring-primary/20 transition-all rounded-md"
            />
            @if (
              form.get('quantidadeItensNota')?.touched && form.get('quantidadeItensNota')?.invalid
            ) {
              <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
                >Informe a quantidade.</span
              >
            }
          </div>
        </div>

        <!-- Data de Emissão -->
        <div class="flex flex-col gap-1.5 anim-field-4">
          <label
            class="text-xs font-black uppercase tracking-[0.12em] text-muted-foreground flex items-center gap-1.5"
          >
            <lucide-angular [img]="Calendar" size="13"></lucide-angular>
            Data de Emissão
          </label>
          <z-date-picker
            formControlName="dataEmissao"
            zFormat="dd/MM/yyyy"
            class="h-11 w-full"
          ></z-date-picker>
          @if (form.get('dataEmissao')?.touched && form.get('dataEmissao')?.invalid) {
            <span class="text-xs text-destructive font-medium animate-in fade-in duration-200"
              >Data obrigatória.</span
            >
          }
        </div>

        <!-- Botões -->
        <div
          class="flex flex-col-reverse sm:flex-row gap-3 sm:justify-end pt-4 border-t border-border anim-actions"
        >
          <button
            type="button"
            (click)="close()"
            class="w-full sm:w-auto h-11 px-6 rounded-xl bg-muted text-foreground text-sm font-semibold hover:bg-muted/80 active:scale-95 transition-all cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            [disabled]="loading || form.invalid"
            class="w-full sm:w-auto h-11 min-w-[160px] px-6 rounded-xl bg-brand-color text-white text-sm font-bold hover:brightness-110 hover:-translate-y-0.5 hover:shadow-md active:scale-95 active:translate-y-0 transition-all cursor-pointer shadow-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-y-0 flex items-center justify-center gap-2"
          >
            @if (loading) {
              <span
                class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
              ></span>
              Salvando...
            } @else {
              Salvar Alterações
            }
          </button>
        </div>
      </form>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditNotaDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private dialogRef = inject(ZardDialogRef);
  private modalData = inject(Z_MODAL_DATA);
  private notaService = inject(NotaFiscalService);

  readonly FileText = FileText;
  readonly Building2 = Building2;
  readonly Hash = Hash;
  readonly DollarSign = DollarSign;
  readonly Calendar = Calendar;
  readonly Package = Package;

  @Output() notaAtualizada = new EventEmitter<any>();

  loading = false;

  form: FormGroup = this.fb.group({
    fornecedor: ['', Validators.required],
    cnpj: ['', [Validators.required, Validators.minLength(14)]],
    valorTotalNota: ['', Validators.required],
    quantidadeItensNota: [null as number | null, [Validators.required, Validators.min(1)]],
    dataEmissao: [null as Date | null, Validators.required],
  });

  ngOnInit() {
    const data = this.modalData;
    if (!data) return;

    const valorFormatado = this.aplicarMascaraMoeda(
      data.valorTotalNota ? (data.valorTotalNota * 100).toString() : '',
    );
    const cnpjFormatado = this.formatarCnpj(data.cnpj || '');

    this.form.patchValue({
      fornecedor: data.fornecedor || '',
      cnpj: cnpjFormatado,
      valorTotalNota: valorFormatado,
      quantidadeItensNota: data.quantidadeItensNota ?? null,
      dataEmissao: data.dataEmissao ? new Date(data.dataEmissao + 'T12:00:00') : null,
    });
  }

  onCnpjChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatarCnpj(input.value);
    this.form.get('cnpj')?.setValue(formatted, { emitEvent: false });
  }

  onValorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.aplicarMascaraMoeda(input.value);
    this.form.get('valorTotalNota')?.setValue(formatted, { emitEvent: false });
  }

  private formatarCnpj(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    if (digits.length > 12)
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    if (digits.length > 8) return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{1,4})/, '$1.$2.$3/$4');
    if (digits.length > 5) return digits.replace(/(\d{2})(\d{3})(\d{1,3})/, '$1.$2.$3');
    if (digits.length > 2) return digits.replace(/(\d{2})(\d{1,3})/, '$1.$2');
    return digits;
  }

  private aplicarMascaraMoeda(value: string): string {
    const raw = value.replace(/\D/g, '');
    if (!raw) return '';
    const numeric = (Number(raw) / 100).toFixed(2);
    const [int, dec] = numeric.split('.');
    return `R$ ${int.replace(/\B(?=(\d{3})+(?!\d))/g, '.')},${dec}`;
  }

  private parseMoeda(value: string): number {
    const raw = value.replace(/\D/g, '');
    return raw ? Number(raw) / 100 : 0;
  }

  private formatDateParam(date: Date): string {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + d.getTimezoneOffset());
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    const uuid = this.modalData?.uuid;
    const v = this.form.getRawValue();

    const payload = {
      fornecedor: v.fornecedor,
      cnpj: v.cnpj.replace(/\D/g, ''),
      valorTotalNota: this.parseMoeda(v.valorTotalNota),
      quantidadeItensNota: Number(v.quantidadeItensNota),
      dataEmissao: this.formatDateParam(v.dataEmissao),
    };

    this.notaService.update(uuid, payload).subscribe({
      next: (res) => {
        this.notaAtualizada.emit(res);
        this.dialogRef.close(true);
      },
      error: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  close() {
    this.dialogRef.close();
  }
}

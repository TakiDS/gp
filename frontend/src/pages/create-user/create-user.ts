import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ZardDialogRef } from '@/shared/components/dialog/dialog-ref';

// Adicione estes imports do seu sistema
import { ZardInputDirective } from '@/shared/components/input/input.directive';
import { ZardSelectComponent } from '@/shared/components/select/select.component';
import { ZardSelectImports } from '@/shared/components/select/select.imports';

@Component({
  selector: 'app-create-user',
  standalone: true,
  // Coloque os novos componentes nos imports aqui:
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    ZardInputDirective,
    ZardSelectComponent,
    ZardSelectImports
  ],
  templateUrl: './create-user.html',
  styleUrls: ['./create-user.css'],
})
export class CreateUserDialog {
  private fb = inject(FormBuilder);
  private dialogRef = inject(ZardDialogRef, { optional: true });

  @Output() userCreated = new EventEmitter<any>();

  isSaving = false;

  userForm = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER', Validators.required],
  });

  onSubmit() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }
    
    this.isSaving = true;

    this.userCreated.emit(this.userForm.value);
    
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }

  onCancel() {
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
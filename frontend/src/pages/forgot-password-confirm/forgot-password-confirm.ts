import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password-confirm',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forgot-password-confirm.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForgotPasswordConfirm {
  email: string | null = inject(ActivatedRoute).snapshot.queryParamMap.get('email');
}

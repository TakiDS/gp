import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  LucideAngularModule,
  Landmark,
  FileAxis3d,
  MapPin,
  UserCheck,
  User,
  FileText,
  Tag,
  ChartColumnIncreasing,
  HandHelping,
  History,
} from 'lucide-angular';
import { SidebarService } from '@/shared/core/services/sidebar/sidebar.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [LucideAngularModule, RouterModule, CommonModule],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  public sidebarService = inject(SidebarService);

  readonly Landmark = Landmark;
  readonly FileAxis3D = FileAxis3d;
  readonly MapPin = MapPin;
  readonly Tag = Tag;
  readonly UserCheck = UserCheck;
  readonly User = User;
  readonly FileText = FileText;
  readonly ChartColumnIncreasing = ChartColumnIncreasing;
  readonly HandHelping = HandHelping;
  readonly History = History;

  isAdmin = false;

  ngOnInit(): void {
    this.verificarPermissao();
  }

  verificarPermissao() {
    const userJson = localStorage.getItem('user');
    const token = localStorage.getItem('auth-token');

    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user.role === 'ADMIN') {
          this.isAdmin = true;
          return;
        }
      } catch (e) {}
    }

    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const roleToken = (payload.role || payload.roles || '').toString().toUpperCase();
        if (roleToken.includes('ADMIN') || roleToken.includes('GESTOR')) {
          this.isAdmin = true;
        }
      } catch (e) {}
    }
  }
}

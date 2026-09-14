import { Routes } from '@angular/router';

import { CreatePatrimonioForm } from 'src/pages/create-patrimonio-form/create-patrimonio-form';
import { ForgotPassword } from 'src/pages/forgot-password/forgot-password';
import { DefaultLayout } from 'src/layout/default-layout/default-layout';
import { Home } from 'src/pages/home/home';
import { CreatePatrimonio } from 'src/pages/create-patrimonio/create-patrimonio';
import { Login } from 'src/pages/login/login';
import { CreatePatrimonioNf } from 'src/pages/create-patrimonio-nf/create-patrimonio-nf';
import { DetailPatrimonio } from 'src/pages/detail-patrimonio/detail-patrimonio';
import { ForgotPasswordConfirm } from 'src/pages/forgot-password-confirm/forgot-password-confirm';
import { ForgotPasswordReset } from 'src/pages/forgot-password-reset/forgot-password-reset';
import { authGuard } from './shared/guards/auth.guard';

import { ListLocalsComponent } from 'src/pages/list-locals/list-locals';
import { ListCategories } from 'src/pages/list-categories/list-categories';
import { CategoryDetailComponent } from 'src/pages/category-detail-component/category-detail-component';
import { DetailLocal } from 'src/pages/detail-local/detail-local';
import { DetentoresComponent } from 'src/pages/detentores-list/detentores-list';
import { ListNotas } from 'src/pages/list-notas/list-notas';
import { ComodatosComponent } from 'src/pages/comodatos-list/comodatos-list';
import { DetailNota } from 'src/pages/detail-nota/detail-nota';
import { Users } from 'src/pages/users/users';
import { ConfirmAssinarTermo } from 'src/pages/confirm-assinar-termo/confirm-assinar-termo';
import { DashboardComponent } from 'src/pages/dashboard/dashboard';
import { PatrimonioHistoryComponent } from 'src/pages/patrimonio-history/patrimonio-history';
import { HistoricoGeralComponent } from 'src/pages/historico-geral/historico-geral';
import { DetailComodato } from 'src/pages/detail-comodato/detail-comodato';
import { DetailDetentorComponent } from 'src/pages/detail-detentor/detail-detentor';
import { PublicPatrimonioComponent } from 'src/pages/public-patrimonio-detail/public-patrimonio-detail';

export const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'forgot-password', component: ForgotPassword },
  { path: 'forgot-password-confirm', component: ForgotPasswordConfirm },
  { path: 'forgot-password-reset', component: ForgotPasswordReset },
  { path: 'comodato/assinar-termo', component: ConfirmAssinarTermo },
  { path: 'public/patrimonio/:uuid', component: PublicPatrimonioComponent },

  {
    path: '',
    component: DefaultLayout,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'patrimonios', pathMatch: 'full' },

      { path: 'patrimonios', component: Home },
      { path: 'detail-patrimonio/:uuid', component: DetailPatrimonio },
      { path: 'detail-category/:uuid', component: CategoryDetailComponent },
      {
        path: 'detail-comodato/:uuid',
        component: DetailComodato,
      },
      {
        path: 'criapatrimonio',
        component: CreatePatrimonio,
      },
      {
        path: 'create-patrimonio',
        component: CreatePatrimonioForm,
      },
      {
        path: 'create-patrimonio-nf',
        component: CreatePatrimonioNf,
      },
      {
        path: 'list-locals',
        component: ListLocalsComponent,
      },
      {
        path: 'categories',
        component: ListCategories,
      },
      {
        path: 'comodatos',
        component: ComodatosComponent,
      },
      {
        path: 'detail-local/:uuid',
        component: DetailLocal,
      },
      {
        path: 'detentores',
        component: DetentoresComponent,
      },
      {
        path: 'detail-detentor/:uuid',
        component: DetailDetentorComponent,
      },
      {
        path: 'list-notas',
        component: ListNotas,
      },
      {
        path: 'detail-nota/:uuid',
        component: DetailNota,
      },
      { path: 'usuarios', component: Users },
      { path: 'dashboard', component: DashboardComponent },

      { path: 'historico-geral', component: HistoricoGeralComponent },
      { path: 'patrimonio-history/:uuid', component: PatrimonioHistoryComponent },
    ],
  },
];

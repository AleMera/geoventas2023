import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MapaComponent } from './vendedor/mapa/mapa.component';
import { DashboardComponent } from './vendedor/dashboard/dashboard.component';
import { PrincipalComponent } from './principal.component';
import { ClientesComponent } from './vendedor/clientes/clientes.component';
import { CursosComponent } from './admin/cursos/cursos.component';
import { UsuariosComponent } from './admin/usuarios/usuarios.component';
import { AuthGuard } from '@angular/fire/auth-guard';
import { VentasComponent } from './admin/ventas/ventas.component';

const routes: Routes = [
  {
    path: '',
    component: PrincipalComponent,
    children: [
      //Vendedor
      {
        path: 'mapa',
        component: MapaComponent
      },
      {
        path: 'dashboard',
        component: DashboardComponent
      },
      {
        path: 'clientes',
        component: ClientesComponent
      },
      //Admin
      {
        path: 'cursos',
        component: CursosComponent,
        canActivateChild: [AuthGuard]
      },
      {
        path: 'usuarios',
        component: UsuariosComponent,
        canActivateChild: [AuthGuard]
      },
      {
        path: 'ventas',
        component: VentasComponent,
        canActivateChild: [AuthGuard]
      }
    ],
  }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
export class PrincipalRoutingModule { }

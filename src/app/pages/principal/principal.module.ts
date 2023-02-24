import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DataTablesModule } from 'angular-datatables';
import { NgChartsModule } from 'ng2-charts';

import { PrincipalRoutingModule } from './principal-routing.module';
import { PrincipalComponent } from './principal.component';
import { SharedModule } from '../../shared/shared.module';
import { ComponentsModule } from '../../components/components.module';
import { DashboardComponent } from './vendedor/dashboard/dashboard.component';
import { ClientesComponent } from './vendedor/clientes/clientes.component';
import { MapaComponent } from './vendedor/mapa/mapa.component';
import { UsuariosComponent } from './admin/usuarios/usuarios.component';
import { CursosComponent } from './admin/cursos/cursos.component';
import { VentasComponent } from './admin/ventas/ventas.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PrincipalComponent,
    DashboardComponent,
    ClientesComponent,
    MapaComponent,
    UsuariosComponent,
    CursosComponent,
    VentasComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    PrincipalRoutingModule,
    DataTablesModule,
    SharedModule,
    ComponentsModule,
    NgChartsModule,
  ]
})
export class PrincipalModule { }

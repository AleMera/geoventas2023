import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InicioComponent } from './inicio/inicio.component';
import { NosotrosComponent } from './nosotros/nosotros.component';
import { SharedModule } from '../../shared/shared.module';
import { ComponentsModule } from '../../components/components.module';
import { CursosModule } from './cursos/cursos.module';
import { CursosCategoriasModule } from './cursos-categorias/cursos-categorias.module';


@NgModule({
  declarations: [
    InicioComponent,
    NosotrosComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    SharedModule,
    ComponentsModule,
    CursosModule,
    CursosCategoriasModule,
  ],
  exports: [
    NosotrosComponent,
  ]
})
export class HomeModule { }

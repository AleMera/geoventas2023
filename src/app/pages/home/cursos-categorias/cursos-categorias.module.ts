import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursosCategoriasRoutingModule } from './cursos-categorias-routing.module';
import { CursosCategoriasComponent } from './cursos-categorias.component';
import { CategoriaComponent } from './categoria/categoria.component';
import { NgbAccordionModule } from '@ng-bootstrap/ng-bootstrap';
import { CursosModule } from '../cursos/cursos.module';
import { SharedModule } from '../../../shared/shared.module';


@NgModule({
  declarations: [
    CursosCategoriasComponent,
    CategoriaComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    CursosCategoriasRoutingModule,
    CursosModule,
    NgbAccordionModule,
  ],
  exports: [
    CursosCategoriasComponent
  ]
})
export class CursosCategoriasModule { }

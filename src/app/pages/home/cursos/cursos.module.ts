import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CursosRoutingModule } from './cursos-routing.module';
import { InfoCursoComponent } from '././info-curso/info-curso.component';
import { SharedModule } from '../../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CursosComponent } from './cursos.component';
import { ComponentsModule } from 'src/app/components/components.module';


@NgModule({
  declarations: [
    InfoCursoComponent,
    CursosComponent,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CursosRoutingModule,
    SharedModule,
    ComponentsModule,
  ],
  exports: [
    CursosComponent,
  ]
})
export class CursosModule { }

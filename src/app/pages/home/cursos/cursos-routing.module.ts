import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InfoCursoComponent } from './info-curso/info-curso.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: ':id',
        component: InfoCursoComponent
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CursosRoutingModule { }

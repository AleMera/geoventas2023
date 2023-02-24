import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { redirectLoggedInTo, redirectUnauthorizedTo, canActivate } from "@angular/fire/compat/auth-guard";

import { InicioComponent } from './pages/home/inicio/inicio.component';
import { NosotrosComponent } from './pages/home/nosotros/nosotros.component';
import { CursosCategoriasModule } from './pages/home/cursos-categorias/cursos-categorias.module';

const redirectUnauthorizedToAuth = () => redirectUnauthorizedTo(['auth']);
const redirectLoggedInToPrincipal = () => redirectLoggedInTo(['principal']);

const routes: Routes = [
  {
    path: 'inicio',
    component: InicioComponent,
    ...canActivate(redirectLoggedInToPrincipal)
  },
  {
    path: 'categoria',
    loadChildren: () => import('./pages/home/cursos-categorias/cursos-categorias.module').then(m => m.CursosCategoriasModule),
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthModule),
    ...canActivate(redirectLoggedInToPrincipal)
  },
  {
    path: 'principal',
    loadChildren: () => import('./pages/principal/principal.module').then(m => m.PrincipalModule),
    ...canActivate(redirectUnauthorizedToAuth),
  },
  {
    path: 'cursos',
    loadChildren: () => import('./pages/home/cursos/cursos.module').then(m => m.CursosModule),
  },
  {
    path: '**',
    redirectTo: 'inicio',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes,
    {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      onSameUrlNavigation: 'reload',
      scrollOffset: [0, 50],
      relativeLinkResolution: 'legacy',
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }

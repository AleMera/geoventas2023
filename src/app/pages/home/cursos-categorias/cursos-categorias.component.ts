import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cursos-categorias',
  templateUrl: './cursos-categorias.component.html',
  styleUrls: ['./cursos-categorias.component.scss']
})
export class CursosCategoriasComponent implements OnInit {

  cursos: any[] = [];
  categorias: any[] = [];
  idCategoriaSeleccionada: string = '';
  cursosXCategoria: any[] = [];

  constructor(private firestoreSvc: FirestoreService, protected router: Router) { }

  ngOnInit(): void {
    this.firestoreSvc.getDocs('Cursos').subscribe((res) => {
      this.cursos = res;
    });
    this.firestoreSvc.getDocs('Categorias').subscribe((res: any) => {
      this.categorias = res;
    });
  }
}

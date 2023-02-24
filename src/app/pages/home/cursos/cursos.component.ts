import { Component, Input, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit {

  @Input('idCategoria') idCategoria: string;
  cursos: any[] = [];
  categoria: string;
  buscando: boolean = false;
  buscarForm: FormGroup = new FormGroup({
    buscar: new FormControl('')
  });

  constructor(private firestoreSvc: FirestoreService) { }

  ngOnInit(): void {
    if (this.idCategoria) {
      this.firestoreSvc.getDoc('Categorias', this.idCategoria).subscribe((res: any) => {
        this.categoria = res.nombre.toUpperCase();
      });
    }
    this.cargarCursos(this.idCategoria);
  }

  cargarCursos(idCategoria?: string) {
    this.firestoreSvc.getDocs('Cursos').subscribe((res) => {
      this.cursos = res;
      if (idCategoria) {
        this.cursos = this.cursos.filter((curso) => curso.idCategoria.includes(idCategoria));
      }
    });
  }

  buscar() {
    const valor: string = this.buscarForm.controls['buscar'].value;
    this.buscando = true;
    if (valor) {
      this.cursos = this.cursos.filter((curso) => curso.nombre.includes(valor.toLocaleUpperCase()));
    }
    console.log(this.cursos);
  }

  cancelarBusqueda() {
    this.buscarForm.controls['buscar'].setValue('');
    this.buscando = false;
    this.cargarCursos();
  }

}

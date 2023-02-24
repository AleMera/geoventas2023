import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-categoria',
  templateUrl: './categoria.component.html',
  styleUrls: ['./categoria.component.scss']
})
export class CategoriaComponent implements OnInit {

  idCategoria: string;

  constructor(private rutaActiva: ActivatedRoute) { }


  ngOnInit(): void {
    this.idCategoria = this.rutaActiva.snapshot.params['id'];
  }

}

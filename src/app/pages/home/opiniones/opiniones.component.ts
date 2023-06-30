import { Component, OnInit } from '@angular/core';
import { FirestoreService } from '../../../services/firestore.service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-opiniones',
  templateUrl: './opiniones.component.html',
  styleUrls: ['./opiniones.component.scss'],
})
export class OpinionesComponent implements OnInit {
  cursos: any[] = [];
  clientes: any[] = [];
  opiniones: any[4] = [];
  ciudades: String[] = [
    'Ambato',
    'Cuenca',
    'Guayaquil',
    'Loja',
    'Quito',
    'Riobamba',
    'Tulcán',
    'Puyo',
    'Tena',
    'Esmeraldas',
    'Machala',
    'Ibarra',
    'Santa Elena',
    'Santo Domingo',
  ];
  mensajes: string[] = [
    'Excelente curso, muy recomendado',
    'Muy buen curso, me encantó',
    'Excelente forma de enseñanza',
    'Certificados válidos y verificados. Totalmente recomendado',
    'Me ayudó a progresar en mis conocimientos. Recomendado',
  ];

  constructor(private firestoreSvc: FirestoreService) {}

  ngOnInit(): void {
    this.firestoreSvc.getDocs('Clientes').subscribe((res: any) => {
      this.clientes = res;
      for (let i = 0; i < 4; i++) {
        const randNombre = Math.floor(Math.random() * this.clientes.length);
        this.opiniones.push({
          cliente: `${this.clientes[randNombre].nombre} ${this.clientes[randNombre].apellido}`,
          ciudad:
            this.ciudades[Math.floor(Math.random() * this.ciudades.length)],
          opinion:
            this.mensajes[Math.floor(Math.random() * this.mensajes.length)],
        });
      }
    });
  }
}

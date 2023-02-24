import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { FirestoreService } from '../../../../services/firestore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormClienteComponent } from '../../../../components/modal-form-cliente/modal-form-cliente.component';

@Component({
  selector: 'app-info-curso',
  templateUrl: './info-curso.component.html',
  styleUrls: ['./info-curso.component.scss']
})
export class InfoCursoComponent implements OnInit, OnDestroy {

  //TODO: Cambiar any por el tipo de dato correcto
  curso: any = {};
  idCurso!: string;
  cargando: boolean = true;

  constructor(private rutaActiva: ActivatedRoute, private modal: NgbModal, private firestoreSvc: FirestoreService) { }

  ngOnInit(): void {
    this.idCurso = this.rutaActiva.snapshot.params['id'];
    this.firestoreSvc.getDoc('Cursos', this.idCurso).subscribe((res) => {
      this.curso = res;
      this.cargando = false;
    });
  }

  incribirse() {
    const modalRef = this.modal.open(ModalFormClienteComponent, { centered: true,  scrollable: true });
    modalRef.componentInstance.idCurso = this.idCurso;
  }

  ngOnDestroy(): void {
    this.cargando = true;
  }

}

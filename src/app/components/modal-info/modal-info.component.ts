import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Info } from 'src/app/app.interfaces';
import { Router } from '@angular/router';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';

@Component({
  selector: 'app-modal-info',
  templateUrl: './modal-info.component.html',
  styleUrls: ['./modal-info.component.scss']
})
export class ModalInfoComponent implements OnInit {

  @Input() info!: Info;
  cargando: boolean = false;
  colorTexto: string;
  constructor(protected modal: NgbModal, private router: Router, private firestoreSvc: FirestoreService, private storageSvc: StorageService) { }

  ngOnInit(): void {
    switch (this.info.tipo) {
      case 'exito':
        this.colorTexto = 'modal-title text-success';
        break;
      case 'error':
        this.colorTexto = 'modal-title text-danger';
        break;
      case 'eliminar':
        this.colorTexto = 'modal-title text-danger';
        break;
      case 'ayuda':
        this.colorTexto = 'modal-title text-primary';
        break;
    }
  }

  aceptar() {
    if (this.info.id && this.info.col) {
      const idDoc: string = this.info.id;
      this.cargando = true;
      this.firestoreSvc.eliminarDoc(this.info.col, this.info.id).then(() => {
        if (this.info.col === 'Cursos') {
          this.storageSvc.eliminarImgsDoc(this.info.col, idDoc).then(() => {
            this.modal.open(ModalInfoComponent, { centered: true, size: 'sm', backdrop: false, keyboard: false }).componentInstance.info = {
              tipo: 'exito',
              icono: 'check_circle',
              titulo: 'Registro eliminado.',
              mensaje: 'El registro se ha eliminado correctamente.',
            };
          }).catch(() => {
            this.modal.open(ModalInfoComponent, { centered: true, size: 'sm', backdrop: false, keyboard: false }).componentInstance.info = {
              tipo: 'error',
              icono: 'error',
              titulo: 'Error al eliminar.',
              mensaje: 'Ha ocurrido un error al eliminar el registro.',
            };
          });
        }
      }).finally(() => {
        this.cargando = false;
        this.modal.dismissAll();
        location.reload();
      });
      return;
    } else if (this.info.registro) {
      this.router.navigate(['/auth/registro']);
    }
    if (this.info.tipo === 'error') {
      this.modal.dismissAll();
      return;
    } else if (this.info.tipo === 'exito') {
      this.modal.dismissAll();
      location.reload();
      return;
    } else {
      this.modal.dismissAll();
      return;
    }
  }
}

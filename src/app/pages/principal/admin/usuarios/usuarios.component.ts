import { AfterViewInit, Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';
import { ModalFormUsuarioComponent } from 'src/app/components/modal-form-usuario/modal-form-usuario.component';
import { FirestoreService } from 'src/app/services/firestore.service';

@Component({
  selector: 'app-usuarios',
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.scss']
})
export class UsuariosComponent implements OnInit, AfterViewInit, OnDestroy {

  usuarios: any[] = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();

  constructor(private firestoreSvc: FirestoreService, private modal: NgbModal) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.22/i18n/Spanish.json'
      },
      pageLength: 10,
      lengthMenu: [5, 10, 25, 50, 100],
      responsive: false,
      scrollY: '400px',
      destroy: true,
    };
  }

  ngAfterViewInit(): void {
    this.getData();
  }

  getData() {
    this.usuarios = [];
    this.firestoreSvc.getDocs('Usuarios').subscribe((resp) => {
      this.usuarios = resp;
      this.dtTrigger.next(null);
    });
  }

  nuevo() {
    const modalRef = this.modal.open(ModalFormUsuarioComponent, { centered: true, scrollable: true });
    modalRef.componentInstance.idUsuario = null;
  }

  verInfo(idUsuario: any) {
    const modalRef = this.modal.open(ModalFormUsuarioComponent, { centered: true, scrollable: true });
    modalRef.componentInstance.idUsuario = idUsuario;
  }
  
  ngOnDestroy(): void {
    this.dtOptions.destroy;
    this.dtTrigger.unsubscribe();
  }

}

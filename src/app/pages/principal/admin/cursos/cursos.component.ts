import { AfterViewInit, Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { FirestoreService } from '../../../../services/firestore.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalFormCursoComponent } from '../../../../components/modal-form-curso/modal-form-curso.component';
import { DataTableDirective } from 'angular-datatables';

@Component({
  selector: 'app-cursos',
  templateUrl: './cursos.component.html',
  styleUrls: ['./cursos.component.scss']
})
export class CursosComponent implements OnInit, AfterViewInit, OnDestroy {

  cursos: any[] = [];

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

  nuevo() {
    const modalRef = this.modal.open(ModalFormCursoComponent, { centered: true, scrollable: true });
    modalRef.componentInstance.idCurso = null;
  }

  getData() {
    this.cursos = [];
    this.firestoreSvc.getDocs('Cursos').subscribe((resp) => {
      this.cursos = resp;
      this.dtTrigger.next(null);
    });
  }

  verInfo(idCurso: any) {
    const modalRef = this.modal.open(ModalFormCursoComponent, { centered: true, scrollable: true, size: 'xl' });
    modalRef.componentInstance.idCurso = idCurso;
  }

  ngOnDestroy(): void {
    this.dtOptions.destroy;
    this.dtTrigger.unsubscribe();
  }
}

import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ChangeDetectorRef, ElementRef } from '@angular/core';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subject } from 'rxjs';

import { Ciudad, Cliente, Info } from 'src/app/app.interfaces';
import { ModalFormClienteComponent } from '../../../../components/modal-form-cliente/modal-form-cliente.component';
import { FirestoreService } from '../../../../services/firestore.service';
import { DataTableDirective } from 'angular-datatables';
import { AuthService } from '../../../../services/auth.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.component.html',
  styleUrls: ['./clientes.component.scss']
})
export class ClientesComponent implements OnInit, OnDestroy {

  @ViewChild('ciudad') ciudadSelect: ElementRef;
  clientesVenta: any[] = [];
  usuario: any;
  ciudades: Ciudad[] = [];
  cargando: boolean = false;
  auxClientesVenta: any[] = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  filtroPagos: FormGroup = new FormGroup({
    estado: new FormControl(''),
  });

  constructor(private modal: NgbModal, private firestoreSvc: FirestoreService, private authSvc: AuthService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.22/i18n/Spanish.json'
      },
      lengthMenu: [10, 25, 50, 100],
      responsive: false,
      processing: true,
      scrollY: '400px',
      retrieve: true,
    };
    this.cargarData();
  }

  cargarData() {
    this.authSvc.getUid().then((resp) => {
      if (!resp) return;
      const uid = resp.uid;
      this.firestoreSvc.getDocs('Usuarios').subscribe((resp: any) => {
        this.usuario = resp.find((usuario: any) => usuario.uid === uid);
        const ciudadesUsuario = this.usuario.idCiudad;
        //Cargar select de ciudades del usuario
        this.firestoreSvc.getDocs('Ciudades').subscribe((resp: any) => {
          this.ciudades = resp.filter((ciudad: any) => ciudadesUsuario.includes(ciudad.id));
          this.ciudades.sort(this.ordenarAlfabeticamente);
          if (this.ciudades.length === 1) {
            this.ciudadSelect.nativeElement.disabled = true;
          }
        });

        //Cargar tabla de clientes
        this.clientesVenta = [];
        this.firestoreSvc.getDocs('Ventas').subscribe((resp: any) => {
          let ventas: any[] = [];
          this.ciudades.forEach((ciudad: any) => {
            const venta = resp.filter((venta: any) => venta.idCiudad === ciudad.id);
            ventas = [...ventas, ...venta];
          });
          this.firestoreSvc.getDocs('Clientes').subscribe((resp: any[]) => {
            const clientes = resp.filter((cliente: any) => ventas.find((venta: any) => venta.idCliente === cliente.id));
            this.clientesVenta = clientes;
            this.clientesVenta.forEach((cliente: any, i) => {
              const venta = ventas.find((venta: any) => venta.idCliente === cliente.id);
              if (!venta) return;
              this.firestoreSvc.getDoc('Cursos', venta.idCurso).subscribe((curso: any) => {
                this.clientesVenta[i].curso = curso.nombre;
                this.clientesVenta[i].ciudad = this.ciudades.find((ciudad: any) => ciudad.id === venta.idCiudad)?.nombre;
                this.clientesVenta[i].idCursoVenta = curso.id;
                this.clientesVenta[i].pagoVenta = venta.pagado;
                this.clientesVenta[i].idVenta = venta.id;
                this.auxClientesVenta = [...this.clientesVenta];
                this.dtTrigger.next(null);
              });
            });
          });
        });
      });
    });
  }

  cambiarCiudad(event: any) {
    if (!event.target.value) {
      this.cargarTodo();
      return;
    }
    const ciudad = event.target.value;
    this.filtroPagos.controls['estado'].setValue('');
    this.clientesVenta = [];
    this.auxClientesVenta = [];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.firestoreSvc.getDocs('Ventas').subscribe((resp: any) => {
      const ventas = resp.filter((venta: any) => venta.idCiudad === ciudad);
      if (ventas.length === 0) {
        this.clientesVenta = [];
        this.dtTrigger.next(null);
        return;
      }
      this.firestoreSvc.getDocs('Clientes').subscribe((resp: any) => {
        const clientes = resp.filter((cliente: any) => ventas.find((venta: any) => venta.idCliente === cliente.id));
        clientes.forEach((cliente: any) => {
          const venta = ventas.find((venta: any) => venta.idCliente === cliente.id);
          this.firestoreSvc.getDoc('Cursos', venta.idCurso).subscribe((resp: any) => {
            const ciudad = this.ciudades.find((ciudad: any) => ciudad.id === venta.idCiudad);
            this.clientesVenta.push({
              id: cliente.id,
              cedula: cliente.cedula,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              email: cliente.email,
              telefono: cliente.telefono,
              direccion: cliente.direccion,
              ciudad: ciudad?.nombre,
              imgCedula: cliente.imgCedula,
              certTrabajo: cliente.certTrabajo,
              certCapacitacion: cliente.certCapacitacion,
              curso: resp.nombre,
              idCursoVenta: resp.id,
              pagoVenta: venta.pagado
            });
            this.auxClientesVenta = [...this.clientesVenta];
            this.dtTrigger.next(null);
          });
        });
      });
    });
  }

  cargarTodo() {
    this.filtroPagos.controls['estado'].setValue('');
    this.clientesVenta = [];
    this.auxClientesVenta = [];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    this.firestoreSvc.getDocs('Ventas').subscribe((resp: any) => {
      let ventas: any[] = [];
      this.ciudades.forEach((ciudad: any) => {
        const venta = resp.filter((venta: any) => venta.idCiudad === ciudad.id);
        ventas = [...ventas, ...venta];
      });
      this.firestoreSvc.getDocs('Clientes').subscribe((resp: any) => {
        const clientes = resp.filter((cliente: any) => ventas.find((venta: any) => venta.idCliente === cliente.id));
        clientes.forEach((cliente: any) => {
          const venta = ventas.find((venta: any) => venta.idCliente === cliente.id);
          this.firestoreSvc.getDoc('Cursos', venta.idCurso).subscribe((resp: any) => {
            const ciudad = this.ciudades.find((ciudad: any) => ciudad.id === venta.idCiudad);
            this.clientesVenta.push({
              id: cliente.id,
              cedula: cliente.cedula,
              nombre: cliente.nombre,
              apellido: cliente.apellido,
              email: cliente.email,
              telefono: cliente.telefono,
              direccion: cliente.direccion,
              ciudad: ciudad?.nombre,
              imgCedula: cliente.imgCedula,
              certTrabajo: cliente.certTrabajo,
              certCapacitacion: cliente.certCapacitacion,
              curso: resp.nombre,
              idVenta: venta.id,
              pagoVenta: venta.pagado
            });
            this.auxClientesVenta = [...this.clientesVenta];
            this.dtTrigger.next(null);
          });
        });
      });
    });
  }

  changeRadio(event: any) {
    const filtro = event.target.value;
    this.auxClientesVenta = [...this.clientesVenta];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    switch (filtro) {
      case 'pagado':
        this.auxClientesVenta = this.clientesVenta.filter((cliente: any) => cliente.pagoVenta);
        this.dtTrigger.next(null);

        break;
      case 'pendiente':
        this.auxClientesVenta = this.clientesVenta.filter((cliente: any) => !cliente.pagoVenta);
        this.dtTrigger.next(null);

        break;
      default:
        this.auxClientesVenta = [...this.clientesVenta];
        this.dtTrigger.next(null);

        break;
    }
  }

  verInfo(idCliente: string, idVenta: string) {
    const modalRef = this.modal.open(ModalFormClienteComponent, {
      scrollable: true,
      centered: true,
      size: 'md',
    })
    modalRef.componentInstance.idCliente = idCliente;
    modalRef.componentInstance.idVenta = idVenta;
  }

  camposFaltantes(cliente: any) {
    if (!cliente.imgCedula || !cliente.certTrabajo || !cliente.certCapacitacion) {
      return true
    }
    return false;
  }

  private ordenarAlfabeticamente(a: any, b: any) {
    if (a.nombre < b.nombre) {
      return -1;
    }
    if (a.nombre > b.nombre) {
      return 1;
    }
    return 0;
  }

  ngOnDestroy(): void {
    this.dtTrigger.unsubscribe();
  }
}

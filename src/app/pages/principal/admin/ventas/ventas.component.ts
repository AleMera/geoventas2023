import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { Ciudad } from '../../../../app.interfaces';
import { FirestoreService } from '../../../../services/firestore.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-ventas',
  templateUrl: './ventas.component.html',
  styleUrls: ['./ventas.component.scss']
})
export class VentasComponent implements OnInit {

  ciudades: Ciudad[] = [];
  vendedores: any[] = [];
  idVendedor: string;
  comisionVendedor: number;
  editarComision: boolean = false;
  ventas: any[] = [];
  total: number;
  auxVentas: any[] = [];

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject<any>();
  @ViewChild(DataTableDirective) dtElement: DataTableDirective;

  @ViewChild('selectVendedor') selectVendedor: ElementRef = new ElementRef(null);

  ventaForm: FormGroup = new FormGroup({
    comision: new FormControl('', [Validators.min(0)]),
  });

  filtroPagos: FormGroup = new FormGroup({
    estado: new FormControl(''),
  });

  constructor(private firestoreSvc: FirestoreService) { }

  ngOnInit(): void {
    this.dtOptions = {
      pagingType: 'full_numbers',
      language: {
        url: '//cdn.datatables.net/plug-ins/1.10.22/i18n/Spanish.json'
      },
      pageLength: 10,
      lengthMenu: [10, 25, 50, 100],
      responsive: false,
      processing: true,
      scrollY: '400px',
      retrieve: true,
    };
    this.cargarData();
  }

  cargarData() {
    this.filtroPagos.controls['estado'].setValue('');
    this.ventas = [];
    this.auxVentas = [];
    this.firestoreSvc.getDocs('Ventas').subscribe((ventas: any) => {
      this.firestoreSvc.getDocs('Usuarios').subscribe((vendedores: any) => {
        this.vendedores = vendedores;
        vendedores.sort(this.ordenarAlfabeticamente);
        this.firestoreSvc.getDocs('Ciudades').subscribe((ciudades: any) => {
          this.ciudades = ciudades.filter((ciudad: any) => ventas.some((venta: any) => venta.idCiudad === ciudad.id));
          this.ciudades.sort(this.ordenarAlfabeticamente);
          this.firestoreSvc.getDocs('Clientes').subscribe((clientes: any) => {
            clientes = clientes.filter((cliente: any) => ventas.some((venta: any) => venta.idCliente === cliente.id));
            this.firestoreSvc.getDocs('Cursos').subscribe((cursos: any) => {
              cursos = cursos.filter((curso: any) => ventas.some((venta: any) => venta.idCurso === curso.id));
              this.ventas = ventas.map((venta: any) => {
                venta.cliente = `${clientes.find((cliente: any) => cliente.id === venta.idCliente).nombre} ${clientes.find((cliente: any) => cliente.id === venta.idCliente).apellido}`;
                venta.ciudad = this.ciudades.find((ciudad: any) => ciudad.id === venta.idCiudad)?.nombre;
                venta.vendedor = `${vendedores.find((vendedor: any) => vendedor.idCiudad.find((idCiudad: any) => idCiudad === venta.idCiudad))?.nombre} ${vendedores.find((vendedor: any) => vendedor.idCiudad.find((idCiudad: any) => idCiudad === venta.idCiudad))?.apellido}`;
                venta.curso = cursos.find((curso: any) => curso.id === venta.idCurso).nombre;
                venta.fecha = venta.fecha.toDate();
                return venta;
              });
              this.auxVentas = this.ventas;
              this.total = this.auxVentas.reduce((total: number, venta: any) => total + venta.precio, 0);
              this.dtTrigger.next(null);
            });
          });
        });
      });
    });
  }

  cambiarCiudad(event: any) {
    const idCiudadSelect = event.target.value;
    this.filtroPagos.controls['estado'].setValue('');
    this.ventas = [];
    this.auxVentas = [];
    this.total = 0;
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    if (!idCiudadSelect) {
      this.cargarData();
      return;
    }
    this.firestoreSvc.getDocs('Ventas').subscribe((ventas: any) => {
      ventas = ventas.filter((venta: any) => venta.idCiudad === idCiudadSelect);
      this.firestoreSvc.getDocs('Usuarios').subscribe((vendedores: any) => {
        this.vendedores = vendedores.filter((vendedor: any) => vendedor.idCiudad.find((idCiudad: any) => idCiudad === idCiudadSelect));
        this.firestoreSvc.getDocs('Clientes').subscribe((clientes: any) => {
          clientes = clientes.filter((cliente: any) => ventas.some((venta: any) => venta.idCliente === cliente.id));
          this.firestoreSvc.getDocs('Cursos').subscribe((cursos: any) => {
            cursos = cursos.filter((curso: any) => ventas.some((venta: any) => venta.idCurso === curso.id));
            this.ventas = ventas.map((venta: any) => {
              venta.cliente = `${clientes.find((cliente: any) => cliente.id === venta.idCliente).nombre} ${clientes.find((cliente: any) => cliente.id === venta.idCliente).apellido}`;
              venta.ciudad = this.ciudades.find((ciudad: any) => ciudad.id === venta.idCiudad)?.nombre;
              venta.vendedor = `${this.vendedores.find((vendedor: any) => vendedor.idCiudad.find((idCiudad: any) => idCiudad === venta.idCiudad))?.nombre} ${this.vendedores.find((vendedor: any) => vendedor.idCiudad.find((idCiudad: any) => idCiudad === venta.idCiudad))?.apellido}`;
              venta.curso = cursos.find((curso: any) => curso.id === venta.idCurso).nombre;
              venta.fecha = venta.fecha.toDate();
              return venta;
            });
            this.auxVentas = this.ventas;
            this.total = this.auxVentas.reduce((total: number, venta: any) => total + venta.precio, 0);
            this.dtTrigger.next(null);
          });
        });
      });
    });
  }


  changeRadio(event: any) {
    const filtro = event.target.value;
    this.auxVentas = [...this.ventas];
    this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      dtInstance.destroy();
    });
    switch (filtro) {
      case 'pagado':
        this.auxVentas = this.ventas.filter((venta: any) => venta.pagado);
        this.dtTrigger.next(null);

        break;
      case 'pendiente':
        this.auxVentas = this.ventas.filter((venta: any) => !venta.pagado);
        this.dtTrigger.next(null);

        break;
      default:
        this.auxVentas = [...this.ventas];
        this.dtTrigger.next(null);

        break;
    }
  }

  cambiarVendedor(event: any) {
    this.idVendedor = event.target.value;
    if (!this.idVendedor) {
      this.comisionVendedor = 0;
      return;
    }
    this.firestoreSvc.getDoc('Usuarios', this.idVendedor).subscribe((vendedor: any) => {
      this.comisionVendedor = vendedor.comision;
    });

  }

  guardarComision() {
    
    if (!this.ventaForm.controls['comision'].value) {
      this.editarComision = false;
      return;
    };
    this.comisionVendedor = this.ventaForm.controls['comision'].value;
    this.firestoreSvc.actualizarDoc('Usuarios', this.idVendedor, { comision: this.comisionVendedor }).then(() => {
      this.editarComision = false;
      this.ventaForm.reset();
    });
  }

  ordenarAlfabeticamente(a: any, b: any) {
    if (a.nombre < b.nombre) {
      return -1;
    }
    if (a.nombre > b.nombre) {
      return 1;
    }
    return 0;
  }
}

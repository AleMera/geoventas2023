import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { Info } from 'src/app/app.interfaces';
import { FirestoreService } from '../../services/firestore.service';
import { ModalInfoComponent } from '../modal-info/modal-info.component';
import { Ciudad } from '../../app.interfaces';
import { validarCedula } from '../../validators/validators';
import { StorageService } from '../../services/storage.service';


@Component({
  selector: 'app-modal-form-cliente',
  templateUrl: './modal-form-cliente.component.html',
  styleUrls: ['./modal-form-cliente.component.scss']
})


export class ModalFormClienteComponent implements OnInit {

  @Input() idCliente!: any;
  @Input() idVenta!: any;
  // @Input() idCursoVenta!: any;
  @Input() idCurso!: any;

  cliente!: any;
  curso!: any;
  venta!: any;

  cargando: boolean = false;
  editar: boolean = false;
  cursos: any[] = [];
  ciudades: Ciudad[] = [];
  urlCedula: string;
  urlCertTrabajo: string;
  urlCertCapacitacion: string;

  numPagina: number = 1;
  fileCedula: File;
  fileCertTrabajo: File;
  fileCertCapacitacion: File;
  dataArchivos: any[] = [];

  clienteForm: FormGroup = this.fBuilder.group({
    cedula: ['', [Validators.required, validarCedula]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    direccion: ['', Validators.required],
    ciudad: [[], Validators.required],
    imgCedula: [null],
    certTrabajo: [null],
    certCapacitacion: [null],
    curso: [{ value: '', disabled: true }],
    fechaCurso: [{ value: '', disabled: true }],
    fechaCompra: [{ value: '', disabled: true }],
    precio: [{ value: '', disabled: true }],
    estadoPago: [{ value: '', disabled: true }],
  });


  constructor(protected modal: NgbModal, private fBuilder: FormBuilder, private firestoreSvc: FirestoreService, private storageSvc: StorageService) { }

  get errorCedula() {
    const error = this.clienteForm.controls['cedula'].errors;
    if (error) {
      return error['required'] ? 'La cédula es obligatoria' : (error['cedulaIncompleta'] || error['cedulaInvalida']) ? 'La cédula no es válida' : '';
    }
    return '';
  }

  get errorNombre() {
    const error = this.clienteForm.controls['nombre'].errors;
    if (error) {
      return error['required'] ? 'El nombre es obligatorio' : '';
    }
    return '';
  }

  get errorApellido() {
    const error = this.clienteForm.controls['apellido'].errors;
    if (error) {
      return error['required'] ? 'El apellido es obligatorio' : '';
    }
    return '';
  }

  get errorEmail() {
    const error = this.clienteForm.controls['email'].errors;
    if (error) {
      return error['required'] ? 'El email es obligatorio' : error['email'] ? 'El email no es válido' : '';
    }
    return '';
  }

  get errorTelefono() {
    const error = this.clienteForm.controls['telefono'].errors;
    if (error) {
      return error['required'] ? 'El teléfono es obligatorio' : (error['minlength'] || error['maxlength']) ? 'El teléfono debe tener 10 dígitos' : '';
    }
    return '';
  }

  get errorDireccion() {
    const error = this.clienteForm.controls['direccion'].errors;
    if (error) {
      return error['required'] ? 'La dirección es obligatoria' : '';
    }
    return '';
  }

  get errorCiudad() {
    const error = this.clienteForm.controls['ciudad'].errors;
    if (error) {
      return error['required'] ? 'La ciudad es obligatoria' : '';
    }
    return '';
  }

  get errorImgCedula() {
    const error = this.clienteForm.controls['imgCedula'].errors;
    if (error) {
      return error['required'] ? 'La imagen de la cédula es obligatoria' : '';
    }
    return '';
  }

  ngOnInit(): void {

    this.firestoreSvc.getDocs<Ciudad>('Ciudades').subscribe((resp) => {
      this.ciudades = resp;
      this.ciudades.sort(this.ordenarAlfabeticamente);
    });
    if (this.idCliente && this.idVenta) {
      this.cargarClienteVenta();
      this.editar = true;
    }
    this.firestoreSvc.getDocs('Cursos').subscribe((resp) => {
      if (this.idCurso) {
        this.curso = resp.find((curso: any) => curso.id === this.idCurso);
      } else {
        this.cursos = resp;
      }
      this.cargando = false;
    });
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

  private cargarClienteVenta() {
    this.cargando = true;
    this.firestoreSvc.getDoc('Ventas', this.idVenta).subscribe((venta: any) => {
      this.firestoreSvc.getDoc('Clientes', this.idCliente).subscribe((cliente: any) => {
        this.cliente = cliente;
        if (!cliente) return;
        if (!cliente.imgCedula)
          this.clienteForm.controls['imgCedula'].setValidators([Validators.required]);
        let idCiudad = this.ciudades.find((ciudad) => ciudad.id === this.cliente.idCiudad)?.id;
        this.firestoreSvc.getDoc('Cursos', venta.idCurso).subscribe((curso: any) => {
          this.clienteForm.setValue({
            cedula: this.cliente.cedula,
            nombre: this.cliente.nombre,
            apellido: this.cliente.apellido,
            email: this.cliente.email,
            telefono: this.cliente.telefono,
            direccion: this.cliente.direccion,
            ciudad: idCiudad,
            imgCedula: '',
            certTrabajo: '',
            certCapacitacion: '',
            curso: curso.nombre,
            fechaCurso: curso.fecha,
            fechaCompra: venta.fecha.toDate().toISOString().substring(0, 10),
            precio: venta.precio,
            estadoPago: venta.pagado ? 'Pagado' : 'Pendiente',
          });
          
          this.urlCedula = this.cliente.imgCedula ? this.cliente.imgCedula : '';
          this.urlCertTrabajo = this.cliente.certTrabajo ? this.cliente.certTrabajo : '';
          this.urlCertCapacitacion = this.cliente.certCapacitacion ? this.cliente.certCapacitacion : '';
          this.cargando = false;
        });
      });
    });
  }

  marcarCursoPagado() {
    this.cargando = true;
    this.firestoreSvc.actualizarDoc('Ventas', this.idVenta, { pagado: true, estado: 'Pagado' }).then(() => {
      this.cargando = false;
    });
  }

  asignarValores() {
    let idCliente;
    let imgCedula;
    let certTrabajo;
    let certCapacitacion;
    if (this.editar) {
      //Editar cliente
      idCliente = this.idCliente;
      imgCedula = this.urlCedula;
      certTrabajo = this.urlCertTrabajo;
      certCapacitacion = this.urlCertCapacitacion;
    } else {
      //Crear cliente y venta
      //Campos del cliente
      !this.cliente ? idCliente = this.firestoreSvc.crearIdDoc() : idCliente = this.cliente.id;
      imgCedula = '';
      certTrabajo = '';
      certCapacitacion = '';
      //Campos de la venta
      this.venta = {
        id: this.firestoreSvc.crearIdDoc(),
        idCliente: idCliente,
        idCurso: this.idCurso,
        idCiudad: this.clienteForm.value.ciudad,
        fecha: new Date(),
        precio: this.curso.precio,
        pagado: false,
      }

    }

    this.cliente = {
      id: idCliente,
      cedula: this.clienteForm.value.cedula,
      nombre: this.clienteForm.value.nombre,
      apellido: this.clienteForm.value.apellido,
      email: this.clienteForm.value.email,
      telefono: this.clienteForm.value.telefono,
      direccion: this.clienteForm.value.direccion,
      idCiudad: this.clienteForm.value.ciudad,
      imgCedula: imgCedula,
      certTrabajo: certTrabajo,
      certCapacitacion: certCapacitacion,
    }

  }

  protected validarCampos(campo: string) {
    return this.clienteForm.controls[campo].errors && this.clienteForm.controls[campo].touched;
  }

  guardar() {
    if (this.clienteForm.invalid) {
      this.clienteForm.markAllAsTouched();
      return;
    }
    this.asignarValores();
    if (this.editar) {
      this.guardarCambios();
    } else {
      this.guardarInscripcion();
    }
  }

  private guardarCambios() {
    if (this.dataArchivos.length > 0) {
      this.cargando = true;
      this.dataArchivos.forEach((item, i) => {
        if (item.archivo) {
          this.guardarArchivo(item.archivo, item.nombre).then((url) => {
            this.firestoreSvc.actualizarDoc('Clientes', this.cliente.id, { [item.campoDB]: url }).then(() => {
              item.finalizado = true;
              if ((this.dataArchivos.every((item) => item.finalizado)) || ((this.dataArchivos[0].finalizado) && (this.dataArchivos[1].finalizado || this.dataArchivos[2].finalizado)) || (this.dataArchivos[0].finalizado)) {
                const info: Info = {
                  tipo: 'exito',
                  icono: 'check_circle',
                  titulo: 'Datos actualizados',
                  mensaje: 'Los datos del cliente se han actualizado correctamente',
                }
                this.modal.open(ModalInfoComponent, { centered: true, size: 'sm', backdrop: 'static', keyboard: false }).componentInstance.info = info;
              }
              this.cargando = false;
            })
          });
        }
      });
    } else {
      this.cargando = true;
      this.firestoreSvc.actualizarDoc('Clientes', this.cliente.id, this.cliente).then(() => {
        const info: Info = {
          tipo: 'exito',
          icono: 'check_circle',
          titulo: 'Datos actualizados',
          mensaje: 'Los datos del cliente se han actualizado correctamente',
        }
        this.modal.open(ModalInfoComponent, { centered: true, size: 'sm', backdrop: 'static', keyboard: false }).componentInstance.info = info;
        this.cargando = false;
      });
    }
  }

  private guardarInscripcion() {
    this.cargando = true;
    this.firestoreSvc.getDocs('Clientes').subscribe((clientes) => {
      const cliente = clientes.find((cliente: any) => cliente.cedula === this.cliente.cedula);
      if (cliente) {
        this.firestoreSvc.crearDocumentoConId('Ventas', this.venta.id, this.venta).then(() => {
          const info: Info = {
            tipo: 'exito',
            icono: 'check_circle',
            titulo: 'Inscripción realizada',
            mensaje: 'La inscripción se ha realizado correctamente',
          }
          this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' }).componentInstance.info = info;
        }).catch((error) => {
          const info: Info = {
            tipo: 'error',
            icono: 'error',
            titulo: 'Error al realizar la inscripción',
            mensaje: 'Ha ocurrido un error al realizar la inscripción, por favor intentelo de nuevo',
          }
          this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' }).componentInstance.info = info;
        }).finally(() => {
          this.cargando = false;
        });
      } else {
        this.firestoreSvc.crearDocumentoConId('Clientes', this.cliente.id, this.cliente).then(() => {
          this.firestoreSvc.crearDocumentoConId('Ventas', this.venta.id, this.venta).then(() => {
            const info: Info = {
              tipo: 'exito',
              icono: 'check_circle',
              titulo: 'Inscripción realizada',
              mensaje: 'La inscripción se ha realizado correctamente',
            }
            this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' }).componentInstance.info = info;
          }).catch((error) => {
            const info: Info = {
              tipo: 'error',
              icono: 'error',
              titulo: 'Error al realizar la inscripción',
              mensaje: 'Ha ocurrido un error al realizar la inscripción, por favor intentelo de nuevo',
            }
            this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' }).componentInstance.info = info;
          }).finally(() => {
            this.cargando = false;
          });
        });
      }
    });
  }

  verificarCedula(event: any) {
    const cedula = event.target.value;
    if (cedula.length === 10) {
      this.firestoreSvc.getDocs('Usuarios').subscribe((usuarios) => {
        const usuario: any = usuarios.find((usuario: any) => usuario.cedula === cedula);
        if (!usuario) return;
        this.clienteForm.controls['cedula'].setErrors({ esVendedor: true });
        return;
      });

      this.firestoreSvc.getDocs('Clientes').subscribe((clientes) => {
        const cliente: any = clientes.find((cliente: any) => cliente.cedula === cedula);
        if (!cliente) return;
        this.cliente = cliente;
        this.firestoreSvc.getDocs('Ventas').subscribe((ventas) => {
          const venta: any = ventas.find((venta: any) => (venta.idCliente === cliente.id) && (venta.idCurso === this.idCurso));
          if (!venta) return;
          this.clienteForm.controls['cedula'].setErrors({ yaInscrito: true });
        });
        return;
      });
    }
  }

  guardarArchivo(img: File, nombre: string) {
    return this.storageSvc.subirArchivo('Clientes', this.cliente.id, nombre, img).then((url) => {
      return url
    })
  }

  cargarArchivo(event: any, tipo: string) {
    if (event.target.files.length === 0) return;
    const archivo = event.target.files[0];
    switch (tipo) {
      case 'cedula':
        this.dataArchivos.find((data: any) => data.nombre === 'cedula') ? this.dataArchivos.find((data: any) => data.nombre === 'cedula').archivo = archivo :
          this.dataArchivos.push({ archivo: archivo, nombre: 'cedula', campoDB: 'imgCedula', finalizado: false });
        break;
      case 'certTrabajo':
        this.fileCertTrabajo = archivo;
        this.dataArchivos.find((data: any) => data.nombre === 'certTrabajo') ? this.dataArchivos.find((data: any) => data.nombre === 'certTrabajo').archivo = archivo :
          this.dataArchivos.push({ archivo: archivo, nombre: 'certTrabajo', campoDB: 'imgCertTrabajo', finalizado: false });
        break;
      case 'certCapacitacion':
        this.fileCertCapacitacion = archivo;
        this.dataArchivos.find((data: any) => data.nombre === 'certCapacitacion') ? this.dataArchivos.find((data: any) => data.nombre === 'certCapacitacion').archivo = archivo :
          this.dataArchivos.push({ archivo: archivo, nombre: 'certCapacitacion', campoDB: 'imgCertCapacitacion', finalizado: false });
        break;
    }

  }

  eliminar() {
    this.cargando = true;
    const info: Info = {
      tipo: 'Eliminar',
      icono: 'warning',
      titulo: 'Eliminar Cliente',
      mensaje: '¿Está seguro que desea eliminar este cliente? \n Esta acción no se puede deshacer.',
      id: this.cliente.id,
      col: 'Clientes'
    }
    this.modal.open(ModalInfoComponent, { centered: true, scrollable: true }).componentInstance.info = info;
  }
}

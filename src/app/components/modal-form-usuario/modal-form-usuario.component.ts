import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';

import { ModalInfoComponent } from '../modal-info/modal-info.component';
import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';
import { Info } from 'src/app/app.interfaces';
import { validarCedula } from '../../validators/validators';
import { Ciudad } from '../../app.interfaces';

@Component({
  selector: 'app-modal-form-usuario',
  templateUrl: './modal-form-usuario.component.html',
  styleUrls: ['./modal-form-usuario.component.scss']
})
export class ModalFormUsuarioComponent implements OnInit {

  @Input() idUsuario!: any;
  usuario: any;
  editar: boolean = false;
  cargandoInicio: boolean = false;
  cargandoGuardar: boolean = false;
  cargandoEliminar: boolean = false;
  ciudades: Ciudad[] = [];
  ciudadesSelect: Ciudad[] = [];

  usuarioForm: FormGroup = this.fBuilder.group({
    cedula: ['', [Validators.required, validarCedula]],
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(10)]],
    ciudad: [[], Validators.required],
  });


  constructor(protected modal: NgbModal, private fBuilder: FormBuilder, private firestoreSvc: FirestoreService) { }

  get errorCedula() {
    const error = this.usuarioForm.controls['cedula'].errors;
    if (error)
      return error['required'] ? 'La cédula es requerida' : (error['cedulaIncompleta'] || error['cedulaInvalida']) ? 'La cédula no es válida' : '';
  }

  get errorNombre() {
    const error = this.usuarioForm.controls['nombre'].errors;
    if (error)
      return error['required'] ? 'El nombre es requerido' : '';
    return '';
  }

  get errorApellido() {
    const error = this.usuarioForm.controls['apellido'].errors;
    if (error)
      return error['required'] ? 'El apellido es requerido' : '';
    return '';
  }

  get errorEmail() {
    const error = this.usuarioForm.controls['email'].errors;
    if (error)
      return error['required'] ? 'El correo es requerido' : error['email'] ? 'El correo no es válido' : '';
    return '';
  }

  get errorTelf() {
    const error = this.usuarioForm.controls['telefono'].errors;
    if (error)
      return error['required'] ? 'El teléfono es requerido' : (error['minlength'] || error['maxlength']) ? 'El teléfono debe tener 10 dígitos' : '';
    return '';
  }

  get errorCiudad() {
    const error = this.usuarioForm.controls['ciudad'].errors;
    if (error)
      return error['required'] ? 'La ciudad es requerida' : '';
    return '';
  }

  ngOnInit(): void {
    this.firestoreSvc.getDocs<Ciudad>('Ciudades').subscribe((resp) => {
      this.ciudades = resp;
      this.ciudades.sort(this.ordenarAlfabeticamente);
      if (this.idUsuario) {
        this.editar = true;
        this.usuarioForm.controls['cedula'].disable();
        this.cargarUsuario();
      }
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

  cargarUsuario() {
    this.firestoreSvc.getDoc<any>('Usuarios', this.idUsuario).subscribe((resp) => {
      this.usuario = resp;
      this.ciudadesSelect = this.ciudades.filter((ciudad) => this.usuario.idCiudad.includes(ciudad.id));
      
      this.usuarioForm.setValue({
        cedula: this.usuario.cedula,
        nombre: this.usuario.nombre,
        apellido: this.usuario.apellido,
        email: this.usuario.email,
        telefono: this.usuario.telefono,
        ciudad: '',
      });
      
    });
  }

  validarCampos(campo: string) {
    return this.usuarioForm.controls[campo].errors && this.usuarioForm.controls[campo].touched;
  }

  asignarValores() {
    let idUsuario: string = '';
    let ciudades: string[] = [];
    if (this.idUsuario) {
      idUsuario = this.idUsuario;
    } else {
      idUsuario = this.firestoreSvc.crearIdDoc();
    }
    this.ciudadesSelect.map(({ id }) => {
      ciudades.push(id);
    });

    this.usuario = {
      id: idUsuario,
      cedula: this.usuarioForm.controls['cedula'].value,
      nombre: this.usuarioForm.controls['nombre'].value,
      apellido: this.usuarioForm.controls['apellido'].value,
      email: this.usuarioForm.controls['email'].value,
      telefono: this.usuarioForm.controls['telefono'].value,
      idCiudad: ciudades,
    }
  }

  agregarCiudad(event: any) {
    const nombreCiudad = event.target.value;
    const ciudad = this.ciudades.find((ciudad) => ciudad.nombre === nombreCiudad);
    if (ciudad) {
      this.ciudadesSelect.push(ciudad);
    }
  }

  quitarCiudad(pos: number) {
    this.ciudadesSelect.splice(pos, 1);
    this.usuarioForm.markAsDirty();
  }

  guardar() {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      return;
    }
    if(!this.editar) {
      //Registrar usuario
      this.registrarUsuario();
    } else {
      //Editar usuario
      this.guardarCambios();
    }
  }

  registrarUsuario() {
    this.cargandoGuardar = true;
    this.asignarValores();
    this.firestoreSvc.crearDocumentoConId('Usuarios', this.usuario.id, this.usuario).then(() => {
      const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true });
      modalRef.componentInstance.info = {
        tipo: 'exito',
        icono: 'check_circle',
        titulo: 'Usuario registrado',
        mensaje: 'El usuario se registró correctamente',
      };
    }).catch(() => {
      const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true });
      modalRef.componentInstance.info = {
        tipo: 'error',
        icono: 'error',
        titulo: 'Error al registrar usuario',
        mensaje: 'No se pudo registrar el usuario, intente nuevamente más tarde',
      };
    }).finally(() => {
      this.cargandoGuardar = false;
    });
  }

  guardarCambios() {
    this.cargandoGuardar = true;
    this.asignarValores();
    this.firestoreSvc.actualizarDoc('Usuarios', this.usuario.id, this.usuario).then(() => {
      const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
      modalRef.componentInstance.info = {
        tipo: 'exito',
        icono: 'check_circle',
        titulo: 'Usuario editado',
        mensaje: 'Datos guardados correctamente',
      };
    }).catch((err) => {
      const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
      modalRef.componentInstance.info = {
        tipo: 'error',
        icono: 'error',
        titulo: 'Error al editar',
        mensaje: 'No se pudo editar el usuario, intente nuevamente más tarde',
      };
    }).finally(() => {
      this.cargandoGuardar = false;
    });
  }

  eliminar() {
    this.cargandoEliminar = true;
    const info: Info = {
      tipo: 'Eliminar',
      icono: 'warning',
      titulo: 'Eliminar Usuario',
      mensaje: '¿Está seguro que desea eliminar este usuario? \n Esta acción no se puede deshacer.',
      id: this.usuario.id,
      col: 'Usuarios'
    }
    this.modal.open(ModalInfoComponent, { centered: true, scrollable: true }).componentInstance.info = info;
  }
}

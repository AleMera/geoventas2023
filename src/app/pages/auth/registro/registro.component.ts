import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';

import { AuthService } from '../../../services/auth.service';
import { NgbAlert, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInfoComponent } from '../../../components/modal-info/modal-info.component';
import { FirestoreService } from '../../../services/firestore.service';
import { validarPasswdIguales } from 'src/app/validators/validators';
import { debounceTime, Subject } from 'rxjs';

export interface Info {
  tipo: string;
  icono: string;
  titulo: string;
  mensaje: string;
  id?: string;
  col?: string;
}

@Component({
  selector: 'app-registro',
  templateUrl: './registro.component.html',
  styleUrls: ['./registro.component.scss']
})
export class RegistroComponent implements OnInit {
  
	@ViewChild('autoclose', { static: false }) autoclose: NgbAlert;
	private _success = new Subject<any>();

  registroForm: FormGroup = this.fBuilder.group({
    correo: ['', [Validators.required, Validators.email]],
    passwd: ['', [Validators.required, Validators.minLength(8)]],
    passwd2: ['', [Validators.required, Validators.minLength(8)]],
    cedula: ['', []],
    nombre: [''],
    apellido: [''],
    telefono: [''],
    ciudad: [''],
  },
    {
      validators: validarPasswdIguales('passwd', 'passwd2')
    });

  usuario: any;
  ciudades: any[];
  cargandoBuscar: boolean = false;
  cargandoGuardar: boolean = false;
  visible: boolean = false;
  encontrado: boolean = false;
  alert: boolean = false;

  constructor(private fBuilder: FormBuilder, private authSvc: AuthService, private firestoreSvc: FirestoreService, private modal: NgbModal) { }

  get errorCorreo() {
    const error = this.registroForm.controls['correo'].errors;
    if (error) {
      return error['required'] ? 'El correo es requerido' : error['email'] ? 'El correo no es válido' : '';
    }
    return '';
  }

  get errorPasswd() {
    const error = this.registroForm.controls['passwd'].errors;
    if (error) {
      return error['required'] ? 'La contraseña es requerida' : error['minlength'] ? 'La contraseña debe tener al menos 8 caracteres' : '';
    }
    return '';
  }

  get errorPasswd2() {
    const error = this.registroForm.controls['passwd2'].errors;
    if (error) {
      return (error['minlength'] || error['noIguales']) ? 'Las contraseñas no coinciden' : '';
    }
    return '';
  }

  ngOnInit(): void {
    this.firestoreSvc.getDocs('Ciudades').subscribe((resp: any[]) => {
      this.ciudades = resp;
    });
    this.registroForm.controls['passwd'].disable();
    this.registroForm.controls['passwd2'].disable();
    this.registroForm.controls['cedula'].disable();
    this.registroForm.controls['nombre'].disable();
    this.registroForm.controls['apellido'].disable();
    this.registroForm.controls['telefono'].disable();
    this.registroForm.controls['ciudad'].disable();
  }

  validarCampos(campo: string) {
    return this.registroForm.controls[campo].errors && this.registroForm.controls[campo].touched;
  }

  buscarCorreo() {
    if (this.registroForm.controls['correo'].invalid) {
      this.registroForm.controls['correo'].markAsTouched();
      return;
    }
    this.cargandoBuscar = true;
    this.firestoreSvc.getDocs('Usuarios').subscribe((resp: any[]) => {
      const usuario = resp.find(usuario => usuario.email == this.registroForm.controls['correo'].value);
      if (!usuario) {
        this.cargandoBuscar = false;
        const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
        modalRef.componentInstance.info = {
          tipo: 'error',
          icono: 'error',
          titulo: 'Error',
          mensaje: 'No existe un usuario con el correo ingresado'
        };
        return;
      }
      this.usuario = usuario;
      this.registroForm.controls['passwd'].enable();
      this.registroForm.controls['passwd2'].enable();
      const ciudad = this.ciudades.find(ciudad => ciudad.id == usuario.idCiudad);
      this.registroForm.setValue({
        correo: this.registroForm.controls['correo'].value,
        passwd: '',
        passwd2: '',
        cedula: usuario.cedula,
        nombre: usuario.nombre,
        apellido: usuario.apellido,
        telefono: usuario.telefono,
        ciudad: ciudad ? ciudad.nombre : ''
      });
      this.encontrado = true;
      this.cargandoBuscar = false;
      this.alert = true;
      setTimeout(() => {
        this.alert = false;
        this.autoclose.close();
      }, 5000);
    });
  }

  guardar() {
    if (this.registroForm.invalid) {
      this.registroForm.markAllAsTouched();
      return;
    }
    const credenciales = {
      email: this.registroForm.controls['correo'].value,
      passwd: this.registroForm.controls['passwd'].value
    }

    this.cargandoGuardar = true;

    this.authSvc.registro(credenciales).then((resp: any) => {
      if (resp.code) {
        const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
        let mensaje = '';
        switch (resp.code) {
          case 'auth/email-already-in-use':
            mensaje = 'El correo ya se encuentra registrado';
            break;
          case 'auth/invalid-email':
            mensaje = 'El correo no es válido';
            break;
          case 'auth/operation-not-allowed':
            mensaje = 'El registro de usuarios está deshabilitado';
            break;
          default:
            mensaje = 'Error desconocido.\n' + 'Por favor, intente más tarde o comuníquese con el administrador.';
            break;
        }
        modalRef.componentInstance.info = {
          tipo: 'error',
          icono: 'error',
          titulo: 'Error',
          mensaje: mensaje
        };
      } else {
        resp.user.updateProfile({
          displayName: `${this.usuario.nombre} ${this.usuario.apellido}`
        })
        this.firestoreSvc.actualizarDoc('Usuarios', this.usuario.id, { uid: resp.user.uid }).then(() => {
          const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
          modalRef.componentInstance.info = {
            tipo: 'exito',
            icono: 'check_circle',
            titulo: 'Éxito al guardar',
            mensaje: 'El usuario se ha registrado correctamente. Se inciará sesión automáticamente'
          };
        });
      }
    }).finally(() => {
      this.cargandoGuardar = false;
    });
  }

  ayuda() {
    const modalRef = this.modal.open(ModalInfoComponent, { centered: true, scrollable: true, backdrop: 'static', keyboard: false });
    modalRef.componentInstance.info = {
      tipo: 'ayuda',
      icono: 'help',
      titulo: 'Ayuda',
      mensaje: 'Ingrese el correo electrónico otorgado por el administrador. Si el correo es válido, se mostrarán los datos del usuario; verifíquelos y cree una contraseña. Si el correo no es válido, se mostrará un mensaje de error.'
    };
  }

  onKeydown(event: any) {
    this.encontrado ? this.encontrado = false : null;
    this.registroForm.controls['cedula'].setValue('');
    this.registroForm.controls['nombre'].setValue('');
    this.registroForm.controls['apellido'].setValue('');
    this.registroForm.controls['telefono'].setValue('');
    this.registroForm.controls['ciudad'].setValue('');
    if (event.key === "Enter") {
      this.buscarCorreo();
    }
  }
}

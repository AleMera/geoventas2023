import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../../../services/auth.service';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalInfoComponent } from 'src/app/components/modal-info/modal-info.component';
import { Info } from 'src/app/app.interfaces';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})

export class LoginComponent implements OnInit {

  @ViewChild('passwdInput') passwdInput!: ElementRef;
  loginForm: FormGroup = this.fbuilder.group({
    correo: ['', [Validators.required, Validators.email]],
    passwd: ['', Validators.required,],
  });

  passwdIncorrecta: boolean = false;
  cargando: boolean = false;

  constructor(private authSvc: AuthService, private fbuilder: FormBuilder, private router: Router, private modal: NgbModal) { }

  get errorCorreo() {
    const error = this.loginForm.controls['correo'].errors;
    if (error) {
      return error['required'] ? 'El correo es requerido' : error['email'] ? 'El correo no es válido' : '';
    }
    return '';
  }

  get errorPasswd() {
    const error = this.loginForm.controls['passwd'].errors;
    if (error) {
      return error['required'] ? 'La contraseña es requerida' : '';
    }
    return '';
  }

  ngOnInit(): void {

  }


  validarCampos(campo: string) {
    return this.loginForm.controls[campo].errors && this.loginForm.controls[campo].touched;
  }

  asignarValores() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const correo = this.loginForm.value.correo;
    const passwd = this.loginForm.value.passwd;
    return { correo, passwd }
  }

  login() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const credenciales = this.asignarValores();
    this.cargando = true;
    this.authSvc.login(credenciales?.correo, credenciales?.passwd).then((res: any) => {
      let info: Info = {
        tipo: '',
        icono: '',
        titulo: '',
        mensaje: '',
        registro: false,
      };
      if (res.code) {
        info.tipo = 'error';
        info.icono = 'error';
        switch (res.code) {
          case 'auth/user-not-found':
            info.titulo = 'Usuario no encontrado';
            info.mensaje = 'El usuario no existe. ¿Desea registrarse? (Puede hacerlo si cuenta con un correo creado por el adiministrador)';
            info.registro = true;
            break;
          case 'auth/wrong-password':
            this.passwdIncorrecta = true;
            this.cargando = false;
            return;
          default:
            info.titulo = 'Error desconocido';
            info.mensaje = 'Ocurrió un error inesperado, intente más tarde o contacte al administrador.';
            break;
        }
        this.abrirModal(info);
        return;
      }
      this.cargando = false;
      location.reload();
    });
  }

  abrirModal(info: Info) {
    this.modal.open(ModalInfoComponent, {
      centered: true,
      size: 'md',
      backdrop: 'static',
    }).componentInstance.info = info
      , this.cargando = false;
  }
}
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalEditarPerfilComponent } from 'src/app/components/modal-editar-perfil/modal-editar-perfil.component';

import { AuthService } from '../../services/auth.service';
import { FirestoreService } from '../../services/firestore.service';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent implements OnInit {

  logueado: boolean;
  usuario: any = {};
  menu: any[] = [
    {
      texto: 'Nosotros',
      fragment: 'nosotros',
    },
    {
      texto: 'Información de cursos',
      fragment: 'infoCursos',
    },
    {
      texto: 'Cursos',
      fragment: 'cursos',
    },
  ];
  categorias: any[] = [];

  cargando: boolean = false;

  constructor(private router: Router, private authSvc: AuthService, private modal: NgbModal) {
    this.logueado = false;
    this.cargando = false;
  }

  ngOnInit(): void {
    this.usuarioLogueado();
  }

  usuarioLogueado() {
    this.cargando = true;
    return this.authSvc.getUserInfo().subscribe(user => {
      if (user) {
        this.logueado = true;
        this.usuario = user;
      }
      this.cargando = false;
      
    });
  }

  esAdmin() {
    return this.usuario.uid === 'sIjSGyg7Afa4TbIWdXxWMfYckVC2'
  }

  editarPerfil() {
    const modalRef = this.modal.open(ModalEditarPerfilComponent, { size: 'md' });
    modalRef.componentInstance.uidUser = this.usuario.uid;
  }

  irAInicio() {
    this.router.navigate(['/']);
  }

  iniciarSesion() {
    this.router.navigate(['/auth/login']);
  }

  cerrarSesion() {
    this.authSvc.logout().finally(() => {
      this.logueado = false;
      this.usuario = {};
      location.reload();
    });
  }

}

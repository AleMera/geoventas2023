import { Component, Input, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Ciudad } from '../../app.interfaces';
import { FirestoreService } from '../../services/firestore.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-modal-editar-perfil',
  templateUrl: './modal-editar-perfil.component.html',
  styleUrls: ['./modal-editar-perfil.component.scss']
})
export class ModalEditarPerfilComponent implements OnInit {

  perfilForm: FormGroup = this.fBuilder.group({
    cedula: new FormControl({ value: '', disabled: true }),
    nombre: new FormControl({ value: '', disabled: true }),
    apellido: new FormControl({ value: '', disabled: true }),
    email: new FormControl({ value: '', disabled: true }),
    telefono: new FormControl({ value: '', disabled: true }),
    ciudades: new FormControl({ value: null, disabled: false }),
  });

  @Input() uidUser: any;
  ciudades: Ciudad[] = [];

  constructor(protected modal: NgbModal, private fBuilder: FormBuilder, private firestoreSvc: FirestoreService, private authSvc: AuthService) { }

  ngOnInit(): void {
    this.getDatosUsuario();
  }

  getDatosUsuario() {
    this.firestoreSvc.getDocs('Usuarios').subscribe((usuarios: any) => {
      const usuario = usuarios.find((usuario: any) => usuario.uid === this.uidUser);
      this.asignarValores(usuario);
      this.firestoreSvc.getDocs('Ciudades').subscribe((ciudades: any) => {
        usuario.idCiudad.forEach((idCiudad: any) => {
          const ciudad = ciudades.find((ciudad: any) => ciudad.id === idCiudad);
          this.ciudades.push(ciudad);
        });
       });

    });
  }

  asignarValores(usuario: any) {
    this.perfilForm.setValue({
      cedula: usuario.cedula,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      telefono: usuario.telefono,
      ciudades: this.ciudades
    });
  }

  finalizar() {
    this.authSvc.getUserInfo().subscribe((user: any) => {
      const nombre = this.perfilForm.get('nombre')?.value;
      const apellido = this.perfilForm.get('apellido')?.value;
      user.updateProfile({
        displayName: `${nombre} ${apellido}`
      });
      this.modal.dismissAll();
    });
  }
}

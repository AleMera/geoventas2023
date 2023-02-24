import { Component, OnInit, Input } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-side-menu',
  templateUrl: './side-menu.component.html',
  styleUrls: ['./side-menu.component.scss']
})
export class SideMenuComponent implements OnInit {

  menu: any[] = [];
  constructor(private authSvc: AuthService) { }

  ngOnInit(): void {
    this.cargarMenu();
  }

  private esAdmin() {
    return this.authSvc.getUid().then((resp) => {
      if (!resp) {
        return;
      }
      if (resp.uid === 'sIjSGyg7Afa4TbIWdXxWMfYckVC2') {
        // Es admin
        return true;
      } else {
        // No es admin
        return false;
      }
    });
  }

  async cargarMenu() {
    if (await this.esAdmin()) {
      this.menu = [
        {
          ruta: '/principal/cursos',
          texto: 'Cursos',
          icono: 'school'
        },
        {
          ruta: '/principal/usuarios',
          texto: 'Usuarios',
          icono: 'people'
        },
        {
          ruta: '/principal/ventas',
          texto: 'Ventas',
          icono: 'attach_money'
        }
      ]
    } else {
      this.menu = [
        {
          ruta: '/principal/mapa',
          texto: 'Mapa',
          icono: 'map'
        },
        {
          ruta: '/principal/dashboard',
          texto: 'Dashboard',
          icono: 'dashboard'
        },
        {
          ruta: '/principal/clientes',
          texto: 'Clientes',
          icono: 'people'
        }
      ]
    }
  }
}

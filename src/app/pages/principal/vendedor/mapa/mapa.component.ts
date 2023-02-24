import { AfterViewInit, Component, OnDestroy } from '@angular/core';

import * as L from 'leaflet';
import { FirestoreService } from '../../../../services/firestore.service';
import { AuthService } from '../../../../services/auth.service';
import { Ciudad } from '../../../../app.interfaces';

@Component({
  selector: 'app-mapa',
  templateUrl: './mapa.component.html',
  styleUrls: ['./mapa.component.scss']
})
export class MapaComponent implements AfterViewInit, OnDestroy {

  private map: L.Map;
  cargando: boolean = true;

  usuario: any;
  ciudades: Ciudad[] = [];
  constructor(private authSvc: AuthService, private firestoreSvc: FirestoreService) { }

  private initMap() {
    try {
      this.map = L.map('map', {
        center: [-1.1855339, -78.0652832],
        zoom: 7,
        worldCopyJump: true,
      });
      const tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 18,
        minZoom: 3,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
      });

      tiles.addTo(this.map);

    } catch {
    }

  }

  ngAfterViewInit() {
    this.initMap();
    this.cargarMarcadores();
  }

  cargarMarcadores() {
    this.cargando = true;
    this.authSvc.getUid().then((resp) => {
      if (!resp) return;
      const uid = resp.uid;
      this.firestoreSvc.getDocs('Usuarios').subscribe((resp: any) => {
        this.usuario = resp.find((usuario: any) => usuario.uid === uid);
        const ciudadesUsuario = this.usuario.idCiudad;
        this.firestoreSvc.getDocs('Ciudades').subscribe((resp: any) => {
          this.ciudades = resp.filter((ciudad: any) => ciudadesUsuario.includes(ciudad.id));
          this.firestoreSvc.getDocs('Ventas').subscribe((resp: any[]) => {
            const ventas = resp.filter((venta: any) => ciudadesUsuario.includes(venta.idCiudad));
            let cursosPorCiudad: any[] = [];
            this.ciudades.forEach((ciudad: any) => {
              ventas.forEach((venta: any) => {
                if (venta.idCiudad !== ciudad.id) return
                cursosPorCiudad.push({
                  ciudad: ciudad.nombre,
                  precio: venta.precio
                });
              });
              const ciudadVenta = cursosPorCiudad.filter((venta: any) => venta.ciudad === ciudad.nombre);
              
              let color = ciudadVenta.length >= 3 ? 'rgb(0, 144, 46)' : 'rgb(0, 46, 144)';
              const icon = {
                icon: L.divIcon({
                  className: 'custom-div-icon',
                  html: `<span class="material-icons" style="color:${color}; font-size: 35px; border-radius: 50%; background-color: rgba(243, 243, 243, 0.479);">pin_drop</span>`,
                  iconSize: [30, 50],
                })
              }
              const marker = L.marker([ciudad.lat, ciudad.lng], icon).addTo(this.map);
              marker.bindPopup(`
                <div class="card">
                  <div class="card-header">
                    <h3>${ciudad.nombre}</h3>
                    </div>
                  <div class="card-body">
                    <p class="card-text"># Cursos vendidos: ${ciudadVenta.length}</p>
                    <p class="card-text">Total: $${ciudadVenta.reduce((acc: any, cur: any) => acc + cur.precio, 0)}</p>
                  </div>
                </div>`);
              marker.on('mouseover', () => {
                marker.bindTooltip(ciudad.nombre, { permanent: false, direction: 'center' }).openTooltip();
              });
              marker.on('click', () => {
                this.map.flyTo([ciudad.lat, ciudad.lng], 8);
              });
            });
            this.cargando = false;
          });
        });
      });
    });
  }

  ngOnDestroy() {
    this.map.remove();

  }

}

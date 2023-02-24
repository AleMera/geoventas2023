import { Component, Input, OnInit, ViewChild } from '@angular/core';

import { ChartConfiguration, ChartData, ChartEvent, ChartType } from 'chart.js';
import { BaseChartDirective } from 'ng2-charts';
import { AuthService } from '../../../../services/auth.service';
import { FirestoreService } from '../../../../services/firestore.service';
import { Ciudad } from '../../../../app.interfaces';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  @ViewChild(BaseChartDirective) chart: BaseChartDirective | undefined;

  usuario: any;
  ciudades: Ciudad[] = [];
  totalVentas: any[] = [];
  totalCursos: any[] = [];
  comision: number = 0;
  titulosChart: string[] = ['TOTAL DE VENTAS ($) EN CADA CIUDAD', 'TOTAL DE CURSOS VENDIDOS'];

  cargando: boolean = false;

  //Graficos
  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top',
      },
      title: {
        display: true,
        text: '',
      },
    }
  };

  pieChartData: ChartData<'pie'> = {
    labels: [],
    datasets: [{
      data: [0],
    }]
  };

  constructor(private authSvc: AuthService, private firestoreSvc: FirestoreService) { }

  ngOnInit(): void {
    this.cargarData();
  }

  cargarData() {
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
                  precio: venta.precio,
                });
              });
              const ciudadVenta = cursosPorCiudad.filter((venta: any) => venta.ciudad === ciudad.nombre);
              const totalVenta = ciudadVenta.reduce((acc: any, cur: any) => acc + cur.precio, 0)
              this.totalVentas.push({
                ciudad: ciudad.nombre,
                total: totalVenta,

              })
            });
            this.firestoreSvc.getDocs('Cursos').subscribe((resp: any[]) => {
              const cursos = ventas.map((venta: any) => {
                const curso = resp.find((curso: any) => curso.id === venta.idCurso).nombre;
                return curso;
              });
              this.totalCursos = cursos.reduce((acc: any, cur: any) => {
                const index = acc.findIndex((item: any) => item.nombreCurso === cur);
                if (index === -1) {
                  acc.push({
                    nombreCurso: cur,
                    cantidad: 1
                  });
                } else {
                  acc[index].cantidad++;
                }
                return acc;
              }, []);
              this.comision = this.usuario.comision;
              this.cargarCharts(this.titulosChart[0], this.totalVentas);
              this.cargando = false;
            });
          });
        });
      });
    });
  }

  cambiarChart(event: any) {
    const titulo = event.target.value;
    if (titulo === 'TOTAL DE VENTAS ($) EN CADA CIUDAD') {
      this.cargarCharts(titulo, this.totalVentas);
    } else {
      this.cargarCharts(titulo, this.totalCursos);
    }
  }

  cargarCharts(titulo: string, data: any) {
    this.pieChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'top',
        },
        title: {
          display: true,
          text: titulo,
        },
      }
    }
    this.pieChartData = {
      labels: data.map((venta: any) => venta.nombreCurso || venta.ciudad),
      datasets: [{
        data: data.map((venta: any) => venta.total || venta.cantidad),
      }]
    }
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-curso-card',
  templateUrl: './curso-card.component.html',
  styleUrls: ['./curso-card.component.scss']
})
export class CursoCardComponent implements OnInit {

  @Input() curso: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    
  }

  irAlCurso(){
    this.router.navigate(['/cursos', this.curso.id]);
  }

}

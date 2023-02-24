import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { FirestoreService } from '../../services/firestore.service';
import { StorageService } from '../../services/storage.service';
import { ModalInfoComponent } from '../modal-info/modal-info.component';
import { Info } from 'src/app/app.interfaces';
import { validarFecha } from '../../validators/validators';

@Component({
  selector: 'app-modal-form-curso',
  templateUrl: './modal-form-curso.component.html',
  styleUrls: ['./modal-form-curso.component.scss']
})
export class ModalFormCursoComponent implements OnInit {

  @Input() idCurso!: any;
  curso: any;
  numPagina: number = 1;

  cursoForm: FormGroup = this.fBuilder.group({
    nombre: ['', Validators.required],
    certif: ['', Validators.required],
    duracion: ['', [Validators.required, Validators.min(1)]],
    horario: ['', Validators.required],
    modalidad: ['', Validators.required],
    fecha: ['', [Validators.required, validarFecha]],
    precio: ['', [Validators.required, Validators.min(1)]],
    categoria: [''],
    imgs: [null],
    justificacion: ['', Validators.required],
    objetivos: this.fBuilder.array([], Validators.required)
  });

  nuevoObj: FormControl = new FormControl('', [Validators.required]);

  modalidades: any[] = ['Presencial', 'Virtual'];
  categorias: any[] = [];
  categoriasSeleccionadas: any[] = [];

  cargandoInicio: boolean = false;
  cargandoGuardar: boolean = false;
  cargandoEliminar: boolean = false;
  cargandoImgs: boolean = false;
  editar: boolean = false;
  imgsModificadas: boolean = false;
  errorObj: boolean = false;

  imgs: any[] = [];
  imgsStorage: any[] = [];
  imgsUrl: any[] = [];
  nuevasImgs: any[] = [];


  constructor(protected modal: NgbModal, private fBuilder: FormBuilder, private firestoreSvc: FirestoreService, private storageSvc: StorageService) { }

  get errorNombre() {
    const error = this.cursoForm.controls['nombre'].errors;
    if (error) {
      return error['required'] ? 'El nombre es obligatorio' : '';
    }
    return '';
  }

  get errorCertif() {
    const error = this.cursoForm.controls['certif'].errors;
    if (error) {
      return error['required'] ? 'El certificado es obligatorio' : '';
    }
    return '';
  }

  get errorDuracion() {
    const error = this.cursoForm.controls['duracion'].errors;
    if (error) {
      return error['required'] ? 'La duración es obligatoria' : error['min'] ? 'La duración debe ser mayor a 0' : '';
    }
    return '';
  }

  get errorHorario() {
    const error = this.cursoForm.controls['horario'].errors;
    if (error) {
      return error['required'] ? 'El horario es obligatorio' : '';
    }
    return '';
  }

  get errorModalidad() {
    const error = this.cursoForm.controls['modalidad'].errors;
    if (error) {
      return error['required'] ? 'La modalidad es obligatoria' : '';
    }
    return '';
  }

  get errorFecha() {
    const error = this.cursoForm.controls['fecha'].errors;
    if (error) {
      return error['required'] ? 'La fecha es obligatoria' : error['fechaInvalida'] ? 'La fecha debe ser mayor a la actual' : '';
    }
    return '';
  }

  get errorPrecio() {
    const error = this.cursoForm.controls['precio'].errors;
    if (error) {
      return error['required'] ? 'El precio es obligatorio' : error['min'] ? 'El precio debe ser mayor a 0' : '';
    }
    return '';
  }

  get errorImgs() {
    const error = this.cursoForm.controls['imgs'].errors;
    if (error) {
      return error['required'] ? 'Las imágenes son obligatorias' : error['minlength'] ? 'Debe seleccionar al menos una imagen' : '';
    }
    return '';
  }

  get errorCategoria() {
    const error = this.cursoForm.controls['categoria'].errors;
    if (error) {
      return error['required'] ? 'La categoría es obligatoria' : '';
    }
    return '';
  }

  get errorJustificacion() {
    const error = this.cursoForm.controls['justificacion'].errors;
    if (error) {
      return error['required'] ? 'La justificación es obligatoria' : '';
    }
    return '';
  }

  get errorObjetivos() {
    const error = this.cursoForm.controls['objetivos'].errors;
    if (error) {
      return error['required'] ? 'Los objetivos son obligatorios' : '';
    }
    return '';
  }

  get objetivosArray() {
    return this.cursoForm.controls['objetivos'] as FormArray;
  }

  ngOnInit(): void {
    this.cargarCategorias();
    if (this.idCurso) {
      this.editar = true;
      this.cargarDatos();
    } else {
      this.cursoForm.controls['imgs'].setValidators([Validators.required, Validators.minLength(1)]);
    }
  }

  cargarCategorias() {
    this.firestoreSvc.getDocs('Categorias').subscribe((categorias: any) => {
      this.categorias = categorias;
    });
  }

  cargarDatos() {
    this.cargandoInicio = true;
    this.cargandoImgs = true;
    this.firestoreSvc.getDoc('Cursos', this.idCurso).subscribe((curso: any) => {
      const categorias = this.categorias.filter((cat: any) => curso.idCategoria.includes(cat.id));
      this.categoriasSeleccionadas = categorias;

      const objetivos = curso.objetivos.map((obj: any) => new FormControl(obj, Validators.required));
      this.imgsUrl = curso.imgsUrl;
      console.log(this.imgsUrl);

      this.cursoForm.setControl('objetivos', new FormArray(objetivos));
      this.cursoForm.setValue({
        nombre: curso.nombre,
        certif: curso.certif,
        duracion: curso.duracion,
        horario: curso.horario,
        modalidad: curso.modalidad,
        fecha: curso.fecha,
        precio: curso.precio,
        categoria: '',
        imgs: [],
        justificacion: curso.justificacion,
        objetivos: objetivos.map((obj: any) => obj.value)
      });
      this.cargandoInicio = false;
      this.cargandoImgs = false;
    });
  }

  validarCampos(campo: string) {
    return this.cursoForm.controls[campo].errors && this.cursoForm.controls[campo].touched;
  }

  guardar() {

    if (this.cursoForm.invalid) {
      this.cursoForm.markAllAsTouched();
      return;
    }
    this.asignarDatos();
    if (!this.editar) {
      //Guardar nuevo curso
      this.guardarNuevo(this.imgsStorage);
    } else {
      //Guardar curso editado
      this.guardarCambios();
    }
  }

  onChangeImgs(event: any) {
    (this.editar) ? this.imgsModificadas = true : this.imgsModificadas = false;
    if (this.imgsStorage.length > 0) {
      this.imgsStorage = [];
      this.imgs = [];
    }
    this.imgsStorage.push(...event.target.files);
    this.imgsStorage.forEach(img => {
      const reader = new FileReader();
      reader.onload = (i) => {
        this.imgs.push(i.target?.result);
      }
      reader.readAsDataURL(img);
    });
  }

  asignarDatos() {
    let idCategorias: any[] = [];
    this.categoriasSeleccionadas.forEach((categoria: any) => {
      idCategorias.push(categoria.id);
    });
    this.curso = {
      id: this.idCurso ? this.idCurso : this.firestoreSvc.crearIdDoc(),
      nombre: this.cursoForm.value.nombre,
      certif: this.cursoForm.value.certif,
      duracion: this.cursoForm.value.duracion,
      horario: this.cursoForm.value.horario,
      modalidad: this.cursoForm.value.modalidad,
      fecha: this.cursoForm.value.fecha,
      precio: this.cursoForm.value.precio,
      estado: 'Activo',
      idCategoria: idCategorias,
      imgsUrl: this.imgsUrl ? this.imgsUrl : [],
      justificacion: this.cursoForm.value.justificacion,
      objetivos: this.cursoForm.value.objetivos
    }
    console.log(this.curso);

  }

  onChangeCat(event: any) {
    const idCategoria = event.target.value;
    this.categoriasSeleccionadas.push(this.categorias.find((cat: any) => cat.id === idCategoria));
    this.cursoForm.controls['categoria'].setValue('');
  }

  eliminarCategoria(idCategoria: string) {
    this.categoriasSeleccionadas.findIndex((cat: any) => cat.id === idCategoria);
    this.categoriasSeleccionadas.splice(this.categoriasSeleccionadas.findIndex((cat: any) => cat.id === idCategoria), 1);
    this.cursoForm.markAsDirty();
  }

  guardarNuevo(imgs: File[]) {
    let imgsUrl: Promise<string>[] = [];
    this.cargandoGuardar = true;
    imgs.forEach((img) => {
      imgsUrl.push(
        this.storageSvc.subirArchivo('Cursos', this.curso.id, img.name, img).then((url) => {
          return url;
        })
      );
    });
    Promise.all(imgsUrl).then((urls) => {
      this.curso.imgsUrl = urls;

      this.firestoreSvc.crearDocumentoConId('Cursos', this.curso.id, this.curso).finally(() => {
        const modalRef = this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' });
        modalRef.componentInstance.info = {
          tipo: 'exito',
          icono: 'check_circle',
          titulo: 'Curso creado con éxito',
          mensaje: 'El curso se ha creado correctamente',
        };
        this.cargandoGuardar = false;
      });
    });
    console.log(this.curso);

  }

  guardarCambios() {
    this.cargandoGuardar = true;
    this.firestoreSvc.actualizarDoc('Cursos', this.curso.id, this.curso).then(() => {
      const modalRef = this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' });
      modalRef.componentInstance.info = {
        tipo: 'exito',
        icono: 'check_circle',
        titulo: 'Curso editado con éxito',
        mensaje: 'Datos actualizados correctamente',
      };
    }).
      catch((error) => {
        const modalRef = this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' });
        modalRef.componentInstance.info = {
          tipo: 'error',
          icono: 'exclamation_circle',
          titulo: 'Error al editar el curso',
          mensaje: 'Ha ocurrido un error al editar el curso, intente nuevamente',
        };
      }).
      finally(() => {
        this.cargandoGuardar = false;
      });
  }

  eliminar() {
    this.cargandoEliminar = true;
    const info: Info = {
      tipo: 'eliminar',
      icono: 'warning',
      titulo: 'Eliminar Curso',
      mensaje: '¿Está seguro que desea eliminar el curso? \n Esta acción no se puede deshacer.',
      id: this.idCurso,
      col: 'Cursos'
    }
    this.modal.open(ModalInfoComponent, { centered: true, size: 'sm' }).componentInstance.info = info;
  }

  agregarObjetivo() {
    if (this.nuevoObj.invalid) {
      this.nuevoObj.markAllAsTouched();
      return;
    };
    const objetivo = new FormControl(this.nuevoObj.value, Validators.required);
    this.objetivosArray.push(objetivo);
    this.nuevoObj.reset();
    this.cursoForm.markAsDirty();
  }

  eliminarObjetivo(pos: number) {
    this.objetivosArray.removeAt(pos);
    this.cursoForm.markAsDirty();
  }

  subirNuevasImgs() {
    let imgsUrl: Promise<string>[] = [];
    this.cargandoImgs = true;
    this.imgsStorage.forEach((img) => {
      imgsUrl.push(
        this.storageSvc.subirArchivo('Cursos', this.idCurso, img.name, img).then((url) => {
          return url;
        })
      );
    });

    Promise.all(imgsUrl).then((urls) => {
      this.imgsUrl = this.imgsUrl.concat(urls);
      console.log(this.imgsUrl);
      console.log(this.curso);

      this.cargandoImgs = false;
      this.imgs = [];
    });
  }

  eliminarImg(url: string) {
    this.imgsUrl.splice(this.imgsUrl.indexOf(url), 1);
    console.log(this.imgsUrl);
    this.cursoForm.markAsDirty();

    // const nombreImg = url.substring(url.lastIndexOf('2F') + 2, url.lastIndexOf('?')).split('%20').join(' ');
    // this.storageSvc.eliminarImg('Cursos', this.idCurso, nombreImg).then(() => {
    //   this.imgsUrl.splice(this.imgsUrl.indexOf(url), 1);
    //   console.log(this.imgsUrl);
    // });
  }

}

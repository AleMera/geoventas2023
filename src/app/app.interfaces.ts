export interface Cliente {
    idCiudad: string;
    id?: number;
    cedula: string;
    nombre: string;
    apellido: string;
    genero: string;
    email: string;
    telefono: string;
    direccion: string;
    imgCedula?: string;
    imgcertTrabajo?: string;
    imgcertCapacitacion?: string;
}

// export interface Curso {
//     id: number;
//     nombre: string;
//     descripcion: string;
//     precio: number;
//     duracion: number;
// }

export interface Curso {
    id?: string;
    nombre: string;
    precio: number;
    modalidad: string;
    duracion: number;
    horario: string;
}


export interface Ciudad {
    id: string;
    nombre: string;
    provincia: string;
    pais?: string;
    lat?: number;
    lng?: number;
}

export interface Info {
    tipo: string;
    icono: string;
    titulo: string;
    mensaje: string;
    id?: string;
    col?: string;
    registro?: boolean;
}

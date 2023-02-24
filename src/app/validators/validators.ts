import { FormControl, FormGroup, ValidationErrors } from "@angular/forms";


export const validarCedula = (control: FormControl) => {
    const value = control.value;
    const cedula = value.toString();
    if (cedula.length != 10) {
        return { cedulaIncompleta: true };
    } else {
        var digito_region = parseInt(cedula.substring(0, 2));
        if (digito_region >= 1 && digito_region <= 24) {
            var ultimo_digito = parseInt(cedula.substring(9, 10));
            var pares = parseInt(cedula.substring(1, 2)) + parseInt(cedula.substring(3, 4)) + parseInt(cedula.substring(5, 6)) + parseInt(cedula.substring(7, 8));
            var numero1 = parseInt(cedula.substring(0, 1));
            var numero1 = (numero1 * 2);
            if (numero1 > 9) { var numero1 = (numero1 - 9); }
            var numero3 = parseInt(cedula.substring(2, 3));
            var numero3 = (numero3 * 2);
            if (numero3 > 9) { var numero3 = (numero3 - 9); }
            var numero5 = parseInt(cedula.substring(4, 5));
            var numero5 = (numero5 * 2);
            if (numero5 > 9) { var numero5 = (numero5 - 9); }
            var numero7 = parseInt(cedula.substring(6, 7));
            var numero7 = (numero7 * 2);
            if (numero7 > 9) { var numero7 = (numero7 - 9); }
            var numero9 = parseInt(cedula.substring(8, 9));
            var numero9 = (numero9 * 2);
            if (numero9 > 9) { var numero9 = (numero9 - 9); }
            var impares = numero1 + numero3 + numero5 + numero7 + numero9;
            var suma_total = (pares + impares);
            var primer_digito_suma = String(suma_total).substring(0, 1);
            var decena = (parseInt(primer_digito_suma) + 1) * 10;
            var digito_validador = decena - suma_total;
            if (digito_validador == 10)
                var digito_validador = 0;
            if (digito_validador == ultimo_digito) {
                return null;
            } else {
                return { cedulaInvalida: true };
            }
        } else {
            return { cedulaInvalida: true };
        }
    }
}

export function validarPasswdIguales(passwd: string, passwd2: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[passwd];
        const matchingControl = formGroup.controls[passwd2];
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ noIguales: true });
        } else {
            matchingControl.setErrors(null);
        }
    }
}

export const validarFecha = (control: FormControl) => {
    const fecha = new Date(control.value);
    const fechaActual = new Date();
    if ((fecha.getFullYear() < fechaActual.getFullYear()) || (fecha.getFullYear() == fechaActual.getFullYear() && fecha.getMonth() < fechaActual.getMonth()) || (fecha.getFullYear() == fechaActual.getFullYear() && fecha.getMonth() == fechaActual.getMonth() && fecha.getDate() < fechaActual.getDate())) {
        return { fechaInvalida: true };
    }
    return null;
}

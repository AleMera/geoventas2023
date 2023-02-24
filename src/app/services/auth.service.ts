import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';

interface LoginData {
  email: string;
  passwd: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  constructor(private auth: AngularFireAuth) { }

  async login(email: string, passwd: string) {
    try {
      return await this.auth.signInWithEmailAndPassword(email, passwd);
    } catch (err: any) {
      const code = err.code;
      return { code };
    }
  }

  async registro(credenciales: any) {
    try {
      return await (await this.auth.createUserWithEmailAndPassword(credenciales.email, credenciales.passwd))
    } catch (error: any) {
      const code = error.code;
      return { code };
    }
  }

  logout() {
    return this.auth.signOut();
  }

  //TODO: Crear el metodo para recuperar la contraseña y para modificar información del usuario

  getUserInfo() {
    return this.auth.authState;
  }

  async getUid() {
    try {
      return await this.auth.currentUser;
    } catch (error) {
      return null;
    }
  }
}

import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { finalize } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class StorageService {

  constructor(private storage: AngularFireStorage) { }

  
  async subirArchivo(path: string, idDoc: string, nombre: string, imagen: File): Promise<string> {
    return new Promise(resolve => {
      const filePath = `${path}/${idDoc}/${nombre}`;
      const ref = this.storage.ref(filePath);
      const task = ref.put(imagen);
      task.snapshotChanges().pipe(
        finalize(() => {
          ref.getDownloadURL().subscribe((url) => {
            resolve(url);
          });
        })
      ).subscribe();
    });
  }

  getImgsDoc(path: string, idDoc: string): Promise<string[]> {
    return new Promise(resolve => {
      const ref = this.storage.ref(`${path}/${idDoc}`);
      ref.listAll().subscribe((res) => {
        const imgs: string[] = [];
        res.items.forEach((itemRef) => {
          itemRef.getDownloadURL().then((url) => {
            imgs.push(url);
          });
        });
        resolve(imgs);
      });
    });
  }

  async eliminarImgsDoc(path: string, idDoc: string): Promise<void> {
    return new Promise(resolve => {
      const ref = this.storage.ref(`${path}/${idDoc}`);
      ref.listAll().subscribe((res) => {
        res.items.forEach((itemRef) => {
          itemRef.delete();
        });
        resolve();
      });
    });
  }
}

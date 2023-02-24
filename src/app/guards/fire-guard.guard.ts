import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild } from '@angular/router';

import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild {

  constructor(private authSvc: AuthService) { }

  canActivate() {
    return this.authSvc.getUid()
      .then(user => {
        if (user!.uid === 'sIjSGyg7Afa4TbIWdXxWMfYckVC2') {
          return true;
        } else {
          return false;
        }
      });

  }

  canActivateChild() {
    return this.authSvc.getUid()
      .then(user => {
        if (user!.uid === 'sIjSGyg7Afa4TbIWdXxWMfYckVC2') {
          return true;
        } else {
          return false;
        }
      });
  }

}

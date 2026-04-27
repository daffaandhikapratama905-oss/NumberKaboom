import { Component, ViewChild } from '@angular/core';
import { IonModal } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;

  constructor() {}

  close() {
    this.modal.dismiss();
  }
}
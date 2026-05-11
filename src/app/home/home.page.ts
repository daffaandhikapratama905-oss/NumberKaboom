import { Component, ViewChild } from '@angular/core';
import { IonModal, AlertController, Platform } from '@ionic/angular';
import { App } from '@capacitor/app';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  standalone: false
})
export class HomePage {
  @ViewChild(IonModal) modal!: IonModal;
  private backButtonListener: any;

  constructor(
    private alertCtrl: AlertController,
    private platform: Platform
  ) {}

  // Aktifkan pemantau tombol back saat masuk ke halaman Home
  ionViewDidEnter() {
    this.setupBackButtonCustomHandler();
  }

  // Matikan pemantau saat pindah ke halaman Game agar navigasi tidak error
  ionViewWillLeave() {
    if (this.backButtonListener) {
      this.backButtonListener.remove();
    }
  }

  setupBackButtonCustomHandler() {
    // Menangkap tombol back fisik Android
    this.backButtonListener = App.addListener('backButton', () => {
      // Jika modal sedang terbuka, tutup modalnya saja
      // Jika tidak, baru munculkan konfirmasi keluar app
      this.exitApp();
    });
  }

  // Fungsi popup konfirmasi keluar
  async exitApp() {
    const alert = await this.alertCtrl.create({
      header: 'Keluar Aplikasi',
      message: 'Apakah Anda yakin ingin menutup Number Kaboom?',
      backdropDismiss: false, // User harus pilih tombol
      buttons: [
        {
          text: 'Batal',
          role: 'cancel',
          cssClass: 'secondary'
        },
        {
          text: 'Keluar',
          handler: () => {
            App.exitApp(); // Fungsi Capacitor untuk menutup app
          }
        }
      ]
    });

    await alert.present();
  }

  close() {
    this.modal.dismiss();
  }
}
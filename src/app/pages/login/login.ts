import { Component, ViewEncapsulation } from '@angular/core';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { UserData } from '../../providers/user-data';
import { UserOptions } from '../../interfaces/user-options';

import { Capacitor, Plugins } from '@capacitor/core';

@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
  styleUrls: ['./login.scss'],
  encapsulation: ViewEncapsulation.None
})
export class LoginPage {
  login: UserOptions = { username: '', password: '' };
  submitted = false;

  constructor(
    public userData: UserData,
    public router: Router
  ) {
    this.configureLocalNotifications();
   }

  onLogin(form: NgForm) {
    this.submitted = true;

    if (form.valid) {
      this.userData.login(this.login.username);
      this.router.navigateByUrl('/app/tabs/(schedule:schedule)');

      /*  As of November 2018, Web/PWA support for local notifications isn't implemented yet
          in Capacitor. If not available, use a Toast message instead.
      */
      if (Capacitor.isPluginAvailable('LocalNotifications')) {
        this.showLocalNotification();
      } else {
        this.showToast();
      }
    }
  }

  configureLocalNotifications() {
    if (Capacitor.isPluginAvailable('LocalNotifications')) {
      Plugins.LocalNotifications.registerActionTypes({
        types: [
          {
            id: 'OPEN_ACCOUNT_PAGE',
            actions: [
              {
                id: 'view',
                title: 'Take Picture'
              }
            ]
          }
        ]
      });

      Plugins.LocalNotifications.addListener('localNotificationActionPerformed', (notification) => {
        console.log('Notification action performed', notification);

        // Open Account page so user can take selfie
        this.router.navigateByUrl('/account');
      });
    }
  }

  async showToast() {
    const { Toast } = Plugins;

    await Toast.show({
      text: 'Welcome! Please update your picture on the Account page.',
      duration: 'long'
    });
  }

  async showLocalNotification() {
    const { LocalNotifications } = Plugins;

    LocalNotifications.schedule({
      notifications: [
        {
          title: 'Welcome!',
          body: 'Time to update your profile picture!',
          id: 1234,
          schedule: { at: new Date(Date.now() + 3000 )},
          sound: null,
          attachments: null,
          actionTypeId: 'OPEN_ACCOUNT_PAGE',
          extra: null
        }
      ]
    });
  }

  onSignup() {
    this.router.navigateByUrl('/signup');
  }
}

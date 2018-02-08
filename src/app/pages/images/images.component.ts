import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbThemeService, NbMediaBreakpoint, NbMediaBreakpointsService } from '@nebular/theme';
import { Http } from '@angular/http';
import { FbPagesService } from '../../@core/data/fbpages.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ActivatedRoute } from '@angular/router';

declare let window: any;
declare let FB: any;

@Component({
  selector: 'ngx-images',
  styleUrls: ['./images.component.scss'],
  templateUrl: './images.component.html',
})
export class ImagesComponent {

  textFields;
  constructor(private http: Http, private route: ActivatedRoute) {
    let that = this;
    let botId = this.route.parent.snapshot.params.id;

    FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token
        // and signed request each expire
        let uid = response.authResponse.userID;
        let accessToken = response.authResponse.accessToken;

        that.http
          .get(
          "https://3klcm8k5x0.execute-api.eu-central-1.amazonaws.com/latest/bots/" +
          botId +
          "?access_token=" +
          accessToken
          )
          .map(response => response.json())
          .subscribe(res => {
            let allDataFields = [];
            let dataFields = res.blocks.data;
            for (var key in dataFields) {
              if (dataFields.hasOwnProperty(key)) {
                dataFields[key].name = key;
                allDataFields.push(dataFields[key]);
              }
            }
            let editableDataFields = [];
            allDataFields.forEach(dataField => {

              // Get all editable fields for Messages area
              if (dataField.editable && dataField.area == "Images") {
                editableDataFields.push(dataField);
              }
            });

            console.log(editableDataFields);
            that.textFields = editableDataFields;

          });
      } else if (response.status === "not_authorized") {
        // the user is logged in to Facebook,
        // but has not authenticated your app
        window.location.replace("/#/auth");
      } else {
        // the user isn't logged in to Facebook.
        window.location.replace("/#/auth");
      }
    });
  }
}
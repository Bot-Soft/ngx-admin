import { Component, OnDestroy, OnInit } from '@angular/core';
import { NbThemeService, NbMediaBreakpoint, NbMediaBreakpointsService } from '@nebular/theme';
import { Http } from '@angular/http';
import { FbPagesService } from '../../@core/data/fbpages.service';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { ActivatedRoute } from '@angular/router';
import { debuglog } from 'util';
import config from "../../config/config.json";

declare let window: any;
declare let FB: any;

@Component({
  selector: 'ngx-create-item',
  styleUrls: ['./create-item.component.scss'],
  templateUrl: './create-item.component.html',
})
export class CreateItemComponent {
  botId;
  item = {
    subtitle: "",
    title: "",
    price: "",
    currency: "",
    order: "",
    image_url: "",
    id: "",
    buttons: [{ type: "", payload: "", url: "" }]
  };
  gotoblocks = [];
  categories = [];
  selectedCategory = {};
  category_id;
  item_id;
  buttonType: string;
  accessToken;
  constructor(private http: Http, private route: ActivatedRoute) {
    let that = this;
    this.botId = this.route.parent.snapshot.params.id;
    this.category_id = this.route.snapshot.queryParams.category_id;
    this.item_id = this.route.snapshot.queryParams.id;
    this.accessToken;

    FB.getLoginStatus(function (response) {
      if (response.status === "connected") {
        // the user is logged in and has authenticated your
        // app, and response.authResponse supplies
        // the user's ID, a valid access token, a signed
        // request, and the time the access token
        // and signed request each expire
        let uid = response.authResponse.userID;
        that.accessToken = response.authResponse.accessToken;

        that.http
          .get(
            config.url + "/bots/" +
            that.botId +
            "/categories?access_token=" +
            that.accessToken
          )
          .map(response => response.json())
          .subscribe(res => {
            that.categories = res;
            if (that.category_id) {
              that.categories = that.categories.map((category) => {
                if (category.id == that.category_id) {
                  that.selectedCategory = category.id;
                }
                return category;
              });
            } else {
              that.selectedCategory = that.categories[0].id;
            }

          });

        that.http
          .get(
            config.url + "/bots/" +
            that.botId +
            "?access_token=" +
            that.accessToken
          )
          .map(response => response.json())
          .subscribe(res => {
            that.gotoblocks = res.blocks.template.goto;

          });

        if (that.item_id) {
          that.http
            .get(
              config.url + "/bots/" +
              that.botId +
              "/items?access_token=" +
              that.accessToken
            )
            .map(response => response.json())
            .subscribe(res => {
              let currentItem = res.find((item) => {
                return item.id == that.item_id;
              });

              that.item = currentItem;

              if (!that.item.buttons) {
                that.item.buttons = [{ type: "", payload: "", url: "" }];
              }

            });
        }



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

  onCategoryChange(category) {
    this.selectedCategory = category.id;
  }

  addButton() {
    if (this.item.buttons.length < 3) {
      this.item.buttons.push({ type: "", payload: "", url: "" });
    }
  }

  removeButton(index) {
    debugger;
    if (this.item.buttons.length > 1) {
      this.item.buttons.splice(index, 1);
    } else {
      let keys = Object.keys(this.item.buttons[index]);
      keys.forEach((key) => {
        if (key != "type") {
          this.item.buttons[index][key] = "";
        }
      });
    }
  }

  onChangeButtonType(button, $event) {
    if (this.item.buttons && this.item.buttons.length > 0) {
      delete button.url;
      delete button.payload;
    }

    this.buttonType = $event;

  }

  isValidURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
      '((([a-z\d]([a-z\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$', 'i'); // fragment locater
    if (!pattern.test(str)) {
      return false;
    } else {
      return true;
    }
  }

  save() {
    this.item["category_id"] = this.selectedCategory;

    if (!this.item["title"]) {
      alert("Category title is required.");
      return;
    }

    if (!this.item["subtitle"]) {
      alert("Category subtitle is required.");
      return;
    }

    if (!this.item["image_url"]) {
      alert("Category Image URL is required.");
      return;
    }

    if (!this.item["currency"]) {
      alert("Category Currency is required.");
      return;
    }

    if (!this.item["price"]) {
      alert("Category Price is required.");
      return;
    }

    if (!this.item["category_id"]) {
      alert("Category Category ID is required.");
      return;
    }

    let errorFlag = false;
    if (this.item.buttons) {

      this.item.buttons.forEach((button) => {
        let keys = Object.keys(button);
        keys.forEach((key) => {
          if (!button[key]) {
            delete button[key];
          }

          if (key == "url") {
            if (!this.isValidURL(button.url)) {
              alert("Please provide a valid URL.");
              errorFlag = true;
            }
          }
        });
      });
    }

    debugger;

    if (!errorFlag) {
      this.http
        .post(
          config.url + "/bots/" +
          this.botId +
          "/items?access_token=" +
          this.accessToken,
          this.item
        )
        .map(response => response.json())
        .subscribe(res => {
          window.location.replace("#/bot/" + this.botId + "/items?category_id=" + this.selectedCategory);

        });
    }
  }
}

import { Component, OnInit } from '@angular/core';
const json = require('../../../../package.json');

@Component({
  selector: 'app-foot',
  templateUrl: 'app-foot.component.html'
})
export class AppFootComponent implements OnInit {
  version: string;

  ngOnInit() {
    this.version = json.version;
  }
}

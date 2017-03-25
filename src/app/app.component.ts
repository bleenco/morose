import { Component, OnInit, ElementRef } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  template: `
    <app-nav></app-nav>
    <div class="background-svg"></div>
    <router-outlet></router-outlet>
    <app-foot></app-foot>
  `
})
export class AppComponent {
  pkgSub: Subscription;
  el: HTMLElement;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.background-svg');
    this.renderBackground();

    this.pkgSub = Observable.timer(2000).timeInterval().repeat()
      .subscribe(() => this.colorizePackage());
  }

  renderBackground(): void {
    let w = this.el.clientWidth;
    let h = this.el.clientHeight;

    let svg = d3.select(this.el).append('svg')
      .attr('width', w)
      .attr('height', h);

    let g = svg.append('g')
      .attr('transform', 'translate(0, 0)');

    let data = d3.range(15).map(() => Math.random() * (4 - 3) + 3);
    let x = d3.scaleLinear().domain([0, data.length - 1]).range([0, w]);
    let y = d3.scaleLinear().domain([0, 5]).range([h, 0]);

    let areaMain = d3.area()
      .x((d: any, i: number) => x(i))
      .y0(h)
      .y1((d: any) => y(d) + 150)
      .curve(d3.curveNatural);

    g.append('path')
      .attr('d', areaMain(data as any))
      .attr('fill', '#181B26');
  }

  colorizePackage(): void {
    let el = this.elementRef.nativeElement.querySelector('.package');
    let top = d3.select(el).select('#Shape1');
    let left = d3.select(el).select('#Shape2');
    let right = d3.select(el).select('#Shape3');

    let colors = ['#EFC75E', '#E7BF55', '#DBB551'];

    top.attr('fill', colors[0]);
    left.attr('fill', colors[1]);
    right.attr('fill', colors[2]);

    top.transition().delay(500).duration(500).attr('fill', colors[0]);
    left.transition().delay(500).duration(500).attr('fill', colors[2]);
    right.transition().delay(500).duration(500).attr('fill', colors[1]);

    top.transition().delay(1000).duration(500).attr('fill', colors[1]);
    left.transition().delay(1000).duration(500).attr('fill', colors[2]);
    right.transition().delay(1000).duration(500).attr('fill', colors[0]);

    top.transition().delay(1500).duration(500).attr('fill', colors[1]);
    left.transition().delay(1500).duration(500).attr('fill', colors[0]);
    right.transition().delay(1500).duration(500).attr('fill', colors[2]);
  }
}

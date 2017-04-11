import { Component, OnInit, ElementRef, HostListener } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-root',
  template: `
    <div class="app-page">
      <app-nav></app-nav>
      <main class="app-container">
        <div class="background-svg"></div>
        <router-outlet></router-outlet>
      </main>
      <app-foot></app-foot>
    </div>
  `
})
export class AppComponent {
  origin: string;
  el: HTMLElement;

  constructor(private elementRef: ElementRef) {
    this.origin = document.location.origin;
  }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.background-svg');
    this.renderBackground();
  }

  renderBackground(): void {
    let w = this.el.clientWidth;
    let h = this.el.clientHeight;

    let svg = d3.select(this.el).append('svg').attr('width', w).attr('height', h);
    let g = svg.append('g').attr('transform', 'translate(0, 0)');

    let data = [5.7, 8, 9, 9, 10];
    let x = d3.scaleLinear().domain([0, data.length - 1]).range([0, w]);
    let y = d3.scaleLinear().domain([0, 15]).range([h, 0]);

    let area = d3.area()
      .x((d: any, i: number) => x(i))
      .y0(0)
      .y1((d: any) => y(d))
      .curve(d3.curveCardinal);

    g.append('path')
      .attr('d', area(data as any))
      .attr('fill', '#FFFFFF');
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {

  }
}

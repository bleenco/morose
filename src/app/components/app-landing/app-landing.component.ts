import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-landing',
  templateUrl: 'app-landing.component.html'
})
export class AppLandingComponent implements OnInit {
  el: HTMLElement;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.el = this.elementRef.nativeElement.querySelector('.background-svg');
    this.renderBackground();
  }

  renderBackground(): void {
    let w = this.el.clientWidth;
    let h = this.el.clientHeight;

    let svg = d3.select(this.el).append('svg')
      .attr('width', w)
      .attr('height', h);

    let g = svg.append('g')
      .attr('transform', 'translate(0, 0)');

    let data = d3.range(15).map(() => Math.random() * (4.5 - 2.5) + 2.5);
    let x = d3.scaleLinear().domain([0, data.length - 1]).range([0, w]);
    let y = d3.scaleLinear().domain([0, 5]).range([h, 0]);

    let redBackground = d3.area()
      .x((d: any, i: number) => x(i))
      .y0(h)
      .y1((d: any) => y(d))
      .curve(d3.curveBasis);

    let area = d3.area()
      .x((d: any, i: number) => x(i))
      .y0(h)
      .y1((d: any) => y(d) + 100)
      .curve(d3.curveBasis);

    g.append('path')
        .attr('class', 'red-background-area')
        .attr('d', redBackground(data as any))
        .attr('fill', '#B1244C');

    g.append('path')
      .attr('class', 'white-background-area')
      .attr('d', area(data as any))
      .attr('fill', '#FFFFFF');
  }
}

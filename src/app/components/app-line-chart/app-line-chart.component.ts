import { Component, OnInit, ElementRef } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-line-chart',
  templateUrl: 'app-line-chart.component.html'
})
export class AppLineChartComponent implements OnInit {
  lineChartEl: HTMLElement;
  svg: any;
  g: any;
  line: any;
  path: any;
  x: any;
  y: any;
  data: number[];
  now: Date;
  duration: number;
  limit: number;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.lineChartEl = this.elementRef.nativeElement.querySelector('.line-chart');
    this.svg = d3.select(this.lineChartEl).append('svg');
    this.g = this.svg.append('g').attr('transform', 'translate(0, 0)');

    this.limit = 10;
    this.duration = 1000;
    this.now = new Date(Date.now() - this.duration);

    this.render();
  }

  render() {
    let w = this.lineChartEl.clientWidth;
    let h = this.lineChartEl.clientHeight;

    this.svg.attr('width', w).attr('height', h);

    this.data = d3.range(10).map(i => this.getRandomInt());

    this.x = d3.scaleTime().range([0, w]);
    this.y = d3.scaleLinear().range([h, 0]);

    this.x.domain([<any>this.now - (this.limit - 2), <any>this.now - this.duration]);
    this.y.domain([0, d3.max(this.data, (d: any) => d)]);

    this.line = d3.line()
      .x((d: any, i: number) => this.x(<any>this.now - (this.limit - 1 - i) * this.duration))
      .y((d: any) => this.y(d))
      .curve(d3.curveBasis);

    this.path = this.g.append('path')
      .attr('d', this.line(this.data))
      .attr('stroke', '#3A84C5')
      .attr('stroke-width', '3')
      .attr('fill', 'transparent');

    this.tick();
  }

  tick = () => {
    this.now = new Date();
    this.data.push(this.getRandomInt());

    this.x.domain([<any>this.now - (this.limit - 2) * this.duration, <any>this.now - this.duration]);

    this.path
      .attr('d', this.line(this.data))
      .attr('transform', null)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${this.x(<any>this.now - (this.limit - 1) * this.duration)})`)
      .on('end', this.tick);

    this.data.shift();
  }

  getRandomInt() {
    return Math.floor(Math.random() * this.limit);
  }
}

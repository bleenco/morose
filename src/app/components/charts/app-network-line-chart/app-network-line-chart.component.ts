import { Component, OnInit, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-network-line-chart',
  templateUrl: 'app-network-line-chart.component.html'
})
export class AppNetworkLineChartComponent implements OnInit, OnChanges {
  @Input() value: any;
  @Input() valueIn: number;
  @Input() valueOut: number;
  @Input() in: number;
  @Input() out: number;

  lineChartEl: HTMLElement;
  svg: any;
  g: any;
  line: any;
  pathIn: any;
  pathOut: any;
  x: any;
  y: any;
  dataIn: number[];
  dataOut: number[];
  now: Date;
  duration: number;
  limit: number;
  title: string;

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
    this.limit = 10;
    this.duration = 2000;
    this.now = new Date(Date.now() - this.duration);

    this.render();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.value || !this.svg) {
      return;
    }

    setTimeout(() => {
      if (!this.title) {
        this.title = this.value.iface;
      }

      this.updateData(this.value.inSpeed, this.value.outSpeed);
    });
  }

  render() {
    this.lineChartEl = this.elementRef.nativeElement.querySelector('.line-chart');
    this.svg = d3.select(this.lineChartEl).append('svg');
    this.g = this.svg.append('g').attr('transform', 'translate(0, 0)');

    let w = this.lineChartEl.clientWidth;
    let h = this.lineChartEl.clientHeight;

    this.svg.attr('width', w).attr('height', h);

    this.dataIn = d3.range(10).map(i => 0);
    this.dataOut = d3.range(10).map(i => 0);

    this.x = d3.scaleTime().range([0, w]);
    this.y = d3.scaleLinear().range([h, 0]);

    this.x.domain([<any>this.now - (this.limit - 2), <any>this.now - this.duration]);
    this.y.domain([0, d3.max(this.dataIn.concat(this.dataOut), (d: any) => d)]);

    this.line = d3.line()
      .x((d: any, i: number) => this.x(<any>this.now - (this.limit - 1 - i) * this.duration))
      .y((d: any) => this.y(d))
      .curve(d3.curveBasis);

    this.pathIn = this.g.append('path')
      .attr('stroke', '#3A84C5')
      .attr('stroke-width', '3')
      .attr('fill', 'transparent');

    this.pathOut = this.g.append('path')
      .attr('stroke', '#6E7F9A')
      .attr('stroke-width', '3')
      .attr('fill', 'transparent');
  }

  updateData = (valueIn: number, valueOut: number) => {
    this.dataIn.push(valueIn);
    this.dataOut.push(valueOut);
    this.now = new Date();

    this.x.domain([<any>this.now - (this.limit - 2) * this.duration, <any>this.now - this.duration]);
    this.y.domain([0, d3.max(this.dataIn.concat(this.dataOut), (d: any) => d)]);

    this.pathIn
      .transition()
      .duration(0)
      .attr('d', this.line(this.dataIn))
      .attr('transform', null)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${this.x(<any>this.now - (this.limit - 1) * this.duration)})`);

    this.pathOut
      .transition()
      .duration(0)
      .attr('d', this.line(this.dataOut))
      .attr('transform', null)
      .transition()
      .duration(this.duration)
      .ease(d3.easeLinear)
      .attr('transform', `translate(${this.x(<any>this.now - (this.limit - 1) * this.duration)})`);

    this.dataIn.shift();
    this.dataOut.shift();
  }

  getHumanSize(bytes: number, decimals: number = 2): string {
    if (!bytes) {
      return '0 Bytes';
    }

    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const k = 1000;
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
  }

}

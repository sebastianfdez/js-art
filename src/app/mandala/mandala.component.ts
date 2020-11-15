import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Coordinate } from '../models/coordinate';

@Component({
  selector: 'app-jsart-mandala',
  templateUrl: './mandala.component.html',
})

export class JSArtMandalaComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  context: CanvasRenderingContext2D = null;
  size = 580;
  lineColorTransparent = 'rgba(120, 120, 120, 0.3)';
  center: Coordinate = { x: this.size / 2 , y: this.size / 2 };
  radius = (this.size / 2) - 10;
  private _start = 0;
  slices = 12;
  private _angle = 360 / this.slices;

  constructor() { }

  ngAfterViewInit() {
    this.init();
  }

  init() {
    this.context = this.canvas.nativeElement.getContext('2d');
    const dpr = window.devicePixelRatio;
    this.canvas.nativeElement.width = this.size * dpr;
    this.canvas.nativeElement.height = this.size * dpr;
    this.context.clearRect(0, 0, this.size, this.size);
    this.context.fillStyle = '#000000';
    this.context.fillRect(0, 0, this.size, this.size);
    this.context.strokeStyle = this.lineColorTransparent;
    this.context.beginPath();
    this.context.arc(this.center.x, this.center.y, this.radius, 0, Math.PI * 2, true);
    this.context.stroke();
    this.context.closePath();
    this._start = 0;

    for(var i = 0; i < this.slices; i++ ) {
      this.lineStroke(this.center, this.getPointOnCircle(this._start, this.center, this.radius), 1, this.lineColorTransparent);
      this._start += this._angle;
    }
  }

  getPointOnCircle(deg: number, center: Coordinate, radius: number): Coordinate {
    var rad = this.d2r(deg);
    var x = center.x + radius * Math.cos(rad);
    var y = center.y + radius * Math.sin(rad);
    return { x: x, y: y};
  }

  lineStroke(start: Coordinate, end: Coordinate, width: number, color: string) {
    this.context.lineWidth = width;
    this.context.beginPath();
    this.context.strokeStyle = color;
    this.context.moveTo(start.x, start.y);
    this.context.lineTo(end.x, end.y);
    this.context.stroke();
  }

  d2r(deg: number): number {
    return deg * Math.PI/180;
  }
}
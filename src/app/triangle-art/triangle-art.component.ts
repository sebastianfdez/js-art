import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { filter, switchMap } from 'rxjs/operators';
import WaveformData from 'waveform-data';
import { JSArtSoundService } from '../services/sound.service';
import * as Peaks from 'peaks.js';
import { of } from 'rxjs';
import { JSArtPaintService } from '../services/paint.service';

@Component({
  selector: 'triangle-art',
  templateUrl: './triangle-art.component.html',
})
export class TriangleArtComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('overviewcontainer', {static: false}) overview: ElementRef<HTMLElement>;
  @ViewChild('zoomviewcontainer', {static: false}) zoomview: ElementRef<HTMLElement>;
  @ViewChild('audio', {static: false}) audio: ElementRef<HTMLAudioElement>;

  context: CanvasRenderingContext2D = null;
  size = 580;

  colors: number[][] = [];
  colorTolerance = 0;
  lines: { x: Number, y: Number }[][] = [];
  dots: { x: Number, y: Number }[][] = [];

  // No white spaces
  fullScreen = false;

  constructor(
    private soundService: JSArtSoundService,
    private paintService: JSArtPaintService,

  ) {}

  ngAfterViewInit() {
    this.draw();
    // this.soundService.listenSound().pipe(
    //   filter((blob: Blob) => !!blob),
    //   switchMap((blob: Blob) => {
    //     return this.soundService.getInfoWave(blob);
    //   }),
    // ).subscribe((wave: WaveformData) => {
    //   console.log({ wave });
    // });
    this.soundService.init(this.overview.nativeElement, this.zoomview.nativeElement, this.audio.nativeElement)
    .subscribe((peak) => {
      console.log(peak);
      if (peak) {
        console.log(peak.points.getPoints());
        console.log(peak.segments.getSegments());
      }
    });
  }

  drawTriangle(pointA, pointB, pointC, color) {
    if (pointA && pointB && pointC) {
      this.context.beginPath();
      this.context.moveTo(pointA.x, pointA.y);
      this.context.lineTo(pointB.x, pointB.y);
      this.context.lineTo(pointC.x, pointC.y);
      this.context.lineTo(pointA.x, pointA.y);
      this.context.closePath();
      this.context.fillStyle = color;
      this.context.fill();
      this.context.stroke();
    }
  }

  draw() {
    if (this.canvas) {
      this.context = this.canvas.nativeElement.getContext('2d');
      const dpr = window.devicePixelRatio;
      this.canvas.nativeElement.width = this.size * dpr;
      this.canvas.nativeElement.height = this.size * dpr;
      this.context.scale(dpr, dpr);
      this.context.lineJoin = 'bevel';
      this.context.fillStyle = '#FFFFFF';
      this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);
      this.lines = this.getRandomLines();
      this.dots = this.getRandomDots();
      this.colors = this.getRandomColors();
      this.paintLines();
    }
  }

  getRandomColors(): number[][] {
    const colors = [];
    // Number of possible colors colors
    const colornum = Math.random()*4 + 2;
    for (let i = 0; i < colornum; i++) {
      // 0% tolerance => Choose between (100, 150)
      // 100% tolerance => Choose between (100, 255)
      const red = Math.floor(Math.random()*(50 + 105*this.colorTolerance/100) + 100);
      const blue = Math.floor(Math.random()*(50 + 105*this.colorTolerance/100) + 100);
      const green = Math.floor(Math.random()*(50 + 105*this.colorTolerance/100) + 100);
      const beauty = this.beauty();
      const color = [red * beauty[0], blue * beauty[1], green * beauty[2]];
      colors.push(color);
    }
    return colors;
  }

  beauty(): number[] {
    const combinations = [[ 1, 1, 1 ], [ 1, 1, 0 ], [ 1, 0, 1 ], [ 0, 1, 1 ]];
    return combinations[Math.floor(Math.random() * 3.9999999)];
  }

  getRandomLines(): { x: Number, y: Number }[][] {
    let odd = false;
    const lines: { x: Number, y: Number }[][] = [];
    const numberOfRows = Math.floor((Math.random())*10) + 10;
    const gap = this.size / numberOfRows;
    // If the fullscreen flag is active, start from a negative position
    for (var y = this.fullScreen ? -2*gap : gap/2; y <= (this.fullScreen ? (this.size + 3*gap) : (this.size)); y+= gap) {
      odd = !odd;
      const line: { x: Number, y: Number }[] = [];
      for (var x= this.fullScreen ? -2*gap : gap/2; x <= (this.fullScreen ? (this.size + 2*gap) : this.size - gap); x+= gap) {
        line.push({
          x: x + (Math.random()*.8 - .4) * gap  + (odd ? gap/2 : 0),
          y: y + (Math.random()*.8 - .4) * gap
        });
      }
      lines.push(line);
    }
    this.context.fill();
    return lines;
  }

  getRandomDots(): { x: Number, y: Number }[][] {
    let odd = true;
    const dotLines: { x: Number; y: Number; }[][] = [];
    for(var y = 0; y < this.lines.length - 1; y++) {
      odd = !odd;
      const dotLine: { x: Number; y: Number; }[] = [];
  
      for(var i = 0; i < this.lines[y].length; i++) {
        dotLine.push(odd ? this.lines[y][i]   : this.lines[y+1][i]);
        dotLine.push(odd ? this.lines[y+1][i] : this.lines[y][i]);
      }
      dotLines.push(dotLine);
    }
    return dotLines;
  }

  repaint() {
    this.colors = this.getRandomColors();
    this.paintLines();
  }

  paintLines() {
    this.paintService.paint(this.dots, this.context, this.colors);
  }
}

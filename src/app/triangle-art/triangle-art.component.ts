import { AfterViewInit, Component, ElementRef, NgZone, ViewChild } from '@angular/core';
import { filter, switchMap } from 'rxjs/operators';
import WaveformData from 'waveform-data';
import { JSArtSoundService } from '../services/sound.service';
import { JSArtPaintService } from '../services/paint.service';
import { Coordinate } from '../models/coordinate';

@Component({
  selector: 'triangle-art',
  templateUrl: './triangle-art.component.html',
})
export class TriangleArtComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;
  @ViewChild('canvas2', {static: false}) canvas2: ElementRef<HTMLCanvasElement>;
  @ViewChild('overviewcontainer', {static: false}) overview: ElementRef<HTMLElement>;
  @ViewChild('zoomviewcontainer', {static: false}) zoomview: ElementRef<HTMLElement>;
  @ViewChild('audio', {static: false}) audio: ElementRef<HTMLAudioElement>;

  context: CanvasRenderingContext2D = null;

  // Sound and waves
  wavecontext: CanvasRenderingContext2D = null;
  waveXPos = 0;
  size = 580;
  peak = false;
  boomSensibility = 0;

  colors: number[][] = [];
  colorTolerance = 0;
  lines: Coordinate[][] = [];
  dots: Coordinate[][] = [];

  // No white spaces
  fullScreen = false;

  constructor(
    private soundService: JSArtSoundService,
    private paintService: JSArtPaintService,

  ) {}

  ngAfterViewInit() {
    this.draw();
    this.createWaveCanvas();
    this.soundService.listenSound().pipe(
      filter((blob: Blob) => !!blob),
      switchMap((blob: Blob) => {
        return this.soundService.getInfoWave(blob);
      }),
    ).subscribe((waveform: WaveformData) => {
      this.drawWave(waveform);
    });
  }

  record() {
    this.soundService.record();
  }

  stop() {
    this.soundService.stop();
  }

  createWaveCanvas() {
    this.wavecontext = this.canvas2.nativeElement.getContext('2d');
    this.canvas2.nativeElement.width = 2000;
    this.canvas2.nativeElement.height = 300;
    this.canvas2.nativeElement.parentElement.scrollLeft = 1000;
  }

  drawWave(waveform: WaveformData) {
    const scaleY = (amplitude: number, height: number) => {
      const range = 256;
      const offset = 128;
      return height - ((amplitude + offset) * height) / range;
    }
    this.wavecontext.beginPath();
    const channel = waveform.channel(0);
  
    if (this.waveXPos + waveform.length > this.wavecontext.canvas.width) { 
      var imageData = this.wavecontext.getImageData(
        waveform.length + 1, 0, this.waveXPos - waveform.length - 1, this.wavecontext.canvas.height,
      );
      this.wavecontext.putImageData(imageData, 0, 0);
      this.wavecontext.clearRect(
        this.waveXPos - waveform.length - 1, 0, waveform.length + 1, this.wavecontext.canvas.height,
      );
      this.waveXPos = this.waveXPos - waveform.length - 1;
    }

    let avgIntensity = 0;
    // Loop forwards, drawing the upper half of the waveform
    for (let x = 0; x < waveform.length; x++) {
      const val = channel.max_sample(x);
      avgIntensity += val / waveform.length;
      this.wavecontext.lineTo(x + 0.5 + this.waveXPos, scaleY(val, this.canvas2.nativeElement.height) + 0.5);
    }
    
    // Loop backwards, drawing the lower half of the waveform
    for (let x = waveform.length - 1; x >= 0; x--) {
      const val = channel.min_sample(x);
      this.wavecontext.lineTo(x + 0.5 + this.waveXPos, scaleY(val, this.canvas2.nativeElement.height) + 0.5);
    }
    if (avgIntensity > (20 + this.boomSensibility*2) && !this.peak) {
      this.repaint(true);
      this.peak = true;
    } else if (avgIntensity < (10 + this.boomSensibility)) {
      this.peak = false;
    }
    this.waveXPos = this.waveXPos + waveform.length;
    this.wavecontext.closePath();
    this.wavecontext.stroke();
    this.wavecontext.fill();
  }

  drawTriangle(pointA: Coordinate, pointB: Coordinate, pointC: Coordinate, color: string) {
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
      console.log(dpr);
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
    const colornum = Math.random()*4 + 2; // Between 2 and 6 colors
    for (let i = 0; i < colornum; i++) {
      // 0% tolerance => Choose between (100, 150)
      // 100% tolerance => Choose between (0, 255)
      const red = Math.floor(127 + (25 + this.colorTolerance)*(Math.random()*2 - 1));
      const blue = Math.floor(127 + (25 + this.colorTolerance)*(Math.random()*2 - 1));
      const green = Math.floor(127 + (25 + this.colorTolerance)*(Math.random()*2 - 1));
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

  getRandomLines(): Coordinate[][] {
    let odd = false;
    const lines: Coordinate[][] = [];
    const numberOfRows = Math.floor((Math.random())*10) + 10;
    const gap = this.size / numberOfRows;
    // If the fullscreen flag is active, start from a negative position
    for (var y = this.fullScreen ? -2*gap : gap/2; y <= (this.fullScreen ? (this.size + 3*gap) : (this.size)); y+= gap) {
      odd = !odd;
      const line: Coordinate[] = [];
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

  getRandomDots(): Coordinate[][] {
    let odd = true;
    const dotLines: Coordinate[][] = [];
    for(var y = 0; y < this.lines.length - 1; y++) {
      odd = !odd;
      const dotLine: Coordinate[] = [];
  
      for(var i = 0; i < this.lines[y].length; i++) {
        dotLine.push(odd ? this.lines[y][i] : this.lines[y+1][i]);
        dotLine.push(odd ? this.lines[y+1][i] : this.lines[y][i]);
      }
      dotLines.push(dotLine);
    }
    return dotLines;
  }

  repaint(boom = false) {
    this.colors = this.getRandomColors();
    this.paintLines(boom);
  }

  paintLines(boom = false) {
    this.paintService.paint(this.dots, this.context, this.colors, boom);
  }
}

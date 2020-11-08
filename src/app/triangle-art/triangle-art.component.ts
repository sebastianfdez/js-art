import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'triangle-art',
  templateUrl: './triangle-art.component.html',
})
export class TriangleArtComponent implements AfterViewInit {
  @ViewChild('canvas', {static: false}) canvas: ElementRef<HTMLCanvasElement>;

  context: CanvasRenderingContext2D = null;
  size = 320;

  colors: number[][] = [];
  lines: { x: Number, y: Number }[][] = [];
  dots: { x: Number, y: Number }[][] = [];

  fullScreen = false;

  constructor() {}

  ngAfterViewInit() {
    this.draw();
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
    const colornum = Math.random()*4 + 2;
    for (let i = 0; i < colornum; i++) {
      var red = Math.floor(Math.random()*50 + 100);
      var blue = Math.floor(Math.random()*50 + 100);
      var green = Math.floor(Math.random()*50 + 100);
      colors.push([red, blue, green]);
    }
    return colors;
  }

  getRandomLines(): { x: Number, y: Number }[][] {
    let odd = false;
    const lines: { x: Number, y: Number }[][] = [];
    const gap = this.size / (Math.floor((Math.random())*15) + 6);
    for (var y = this.fullScreen ? -2*gap : gap/2; y <= (this.fullScreen ? (this.size + 3*gap) : (this.size + gap/2)); y+= gap) {
      odd = !odd;
      const line: { x: Number, y: Number }[] = [];
      for (var x= this.fullScreen ? -2*gap : gap/2; x <= (this.fullScreen ? (this.size + 2*gap) : this.size); x+= gap) {
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

  paintLines() {
    for(var i = 0; i < this.dots.length - 1; i++) {
      var color = this.colors[Math.floor(this.colors.length * Math.random())];
      for(var j = 0; j < this.dots[i].length - 2; j++) {
        // var percent = (i + y)/(dotLine.length + lines.length)*0.6+ 0.4;
        var percent = Math.random()*0.4+ 0.6;
        const color_ = 'rgba(' + Math.floor(color[0] - percent*100) + ',' + Math.floor(color[1] - percent*100) + ',' + Math.floor(color[2] - percent*100) + ',' + percent + ')';
        // color_ = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + percent + ')';
        const time = Math.pow(this.dots.length/2 - i, 2) + Math.pow(this.dots[i].length/2 - j, 2);
        const max = Math.pow(this.dots.length/2, 2) + Math.pow(this.dots[i].length/2, 2);
        setTimeout(function(i , j) {
          this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color_);
        }.bind(this, i, j), time/max*1000);
        // this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color_);
      }
    }
  }
}

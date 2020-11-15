import { Injectable, NgZone } from '@angular/core';
import { Coordinate } from '../models/coordinate';

@Injectable()
export class JSArtPaintService {
  dots: Coordinate[][] = [];
  context: CanvasRenderingContext2D = null;
  max = null;

  constructor(
    private ngZone: NgZone,
  ) { }

  paint(dots: Coordinate[][], context: CanvasRenderingContext2D, colors, boom = false) {
    this.dots = dots;
    this.context = context;
    const randomPaint = Math.random();
    this.max = null;
    for(var i = 0; i < this.dots.length - 1; i++) {
      var color = colors[Math.floor(colors.length * Math.random())];
      for(var j = 0; j < this.dots[i].length - 2; j++) {
        // var percent = (i + y)/(dotLine.length + lines.length)*0.6+ 0.4;
        var percent = Math.random()*0.4+ 0.6;
        const color_ = 'rgba(' + Math.floor(color[0] - percent*100) + ',' + Math.floor(color[1] - percent*100) + ',' + Math.floor(color[2] - percent*100) + ',' + percent + ')';
        // color_ = 'rgba(' + color[0] + ',' + color[1] + ',' + color[2] + ',' + percent + ')';
        if (randomPaint < 1/5 || boom) {
          this.paintCenterToOutside(i, j, color_, this.dots.length, this.dots[0].length - 2);
        } else if (randomPaint < 2/5) {
          this.paintLeftToRight(i, j, color_, this.dots.length, this.dots[0].length - 2);
        } else if (randomPaint < 3/5) {
          this.paintUptoDown(i, j, color_, this.dots.length, this.dots[0].length - 2);
        } else if (randomPaint < 4/5) {
          this.paintOutsideToCenter(i, j, color_, this.dots.length, this.dots[0].length - 2);
        } else {
          this.paintDiagonalFromUpLeft(i, j, color_, this.dots.length, this.dots[0].length - 2);
        }
      }
    }
  }

  private drawTriangle(pointA, pointB, pointC, color) {
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

  private paintLeftToRight(i: number, j: number, color: string, height: number, width: number) {
    const max = width;
    const time = j;
    const timeNormalized = time/max*1000;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(function(i , j) {
        this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color);
      }.bind(this, i, j), timeNormalized);
    });
  }

  private paintCenterToOutside(i: number, j: number, color: string, height: number, width: number) {
    if (!this.max) {
      this.max = Math.pow(height/2, 2) + Math.pow(width/2, 2);
    }
    const max = this.max;
    const time = Math.pow(height/2 - i, 2) + Math.pow(width/2 - j, 2);
    const timeNormalized = time/max*1000;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(function(i , j) {
        this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color);
      }.bind(this, i, j), timeNormalized);
    });
  }

  private paintOutsideToCenter(i: number, j: number, color: string, height: number, width: number) {
    if (!this.max) {
      this.max = Math.abs(5.5*height/10) + Math.abs(5*width/10);
    }
    const max = this.max;
    const time = max - (Math.abs(4.5*height/10 - i) + Math.abs(5*width/10 - j));
    const timeNormalized = time/max*1000;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(function(i , j) {
        this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color);
      }.bind(this, i, j), timeNormalized);
    });
  }

  private paintUptoDown(i: number, j: number, color: string, height: number, width: number) {
    const max = height;
    const time = i;
    const timeNormalized = time/max*1000;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(function(i , j) {
        this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color);
      }.bind(this, i, j), timeNormalized);
    });
  }

  private paintDiagonalFromUpLeft(i: number, j: number, color: string, height: number, width: number) {
    const max = height + width;
    const time = i + j;
    const timeNormalized = time/max*1000;
    this.ngZone.runOutsideAngular(() => {
      setTimeout(function(i , j) {
        this.drawTriangle(this.dots[i][j], this.dots[i][j+1], this.dots[i][j+2], color);
      }.bind(this, i, j), timeNormalized);
    });
  }
}
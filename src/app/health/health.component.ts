import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';

@Component({
  selector: 'app-health',
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss']
})
export class HealthComponent implements OnInit {

  constructor() { }
  @ViewChild('myCanvas')
  private canvas: ElementRef = {} as ElementRef;
  ngOnInit(): void {
  }

  x=0;
  
  ngAfterViewInit() {
    const canvas: HTMLCanvasElement = this.canvas.nativeElement;
    const ctx = canvas.getContext("2d");

 
    ctx.lineWidth = 2;
   
    ctx.beginPath(); // Start a new path
    ctx.lineTo(0, 0); // Draw a line to (150, 100)

    const width = (canvas as any).width;
    const height = (canvas as any).height;
 
    setTimeout(() => {
      setInterval(() => {

        ctx.strokeStyle = 'purple';
        ctx.lineTo(this.x += 4, Math.random() * height);
        ctx.stroke();
        if (this.x > width) { ctx.beginPath(); ctx.lineTo(0, 0); this.x = 0; ctx.clearRect(0, 0, width, height); }
      }, 100)
    },Math.random()*5000)


   
  }

}

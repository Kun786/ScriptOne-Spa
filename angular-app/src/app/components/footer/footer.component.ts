import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, NgZone, inject } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [],
  templateUrl: './footer.component.html',
})
export class FooterComponent implements AfterViewInit, OnDestroy {
  private zone = inject(NgZone);
  @ViewChild('wireframeCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private resizeObserver?: ResizeObserver;

  ngAfterViewInit() {
    // Wait for Roboto Mono to be loaded before drawing
    document.fonts.ready.then(() => this.drawWireframe());
    this.resizeObserver = new ResizeObserver(() => {
      this.zone.runOutsideAngular(() => this.drawWireframe());
    });
    // Observe the footer element so we redraw on any width change
    const footer = this.canvasRef.nativeElement.closest('footer');
    if (footer) this.resizeObserver.observe(footer);
  }

  ngOnDestroy() {
    this.resizeObserver?.disconnect();
  }

  private drawWireframe() {
    const canvas = this.canvasRef.nativeElement;
    const dpr = window.devicePixelRatio || 1;
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;
    if (!W || !H) return;

    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, W, H);

    // ── Generate jittered grid points for triangulation ──
    const cols = 65;
    const rows = 8;
    const cellW = W / cols;
    const cellH = H / rows;
    const stride = cols + 2;

    const pts: { x: number; y: number }[] = [];
    for (let r = 0; r <= rows + 1; r++) {
      for (let c = 0; c <= cols + 1; c++) {
        const edgeR = r === 0 || r === rows + 1;
        const edgeC = c === 0 || c === cols + 1;
        const jx = edgeC ? 0 : (Math.random() - 0.5) * cellW * 0.65;
        const jy = edgeR ? 0 : (Math.random() - 0.5) * cellH * 0.65;
        pts.push({ x: c * cellW + jx, y: r * cellH + jy });
      }
    }

    // ── Draw triangulated wireframe mesh ──
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 0.7;
    for (let r = 0; r <= rows; r++) {
      for (let c = 0; c <= cols; c++) {
        const i = r * stride + c;
        const tl = pts[i];
        const tr = pts[i + 1];
        const bl = pts[i + stride];
        const br = pts[i + stride + 1];

        ctx.beginPath();
        // Top and left edges of each cell
        ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y);
        ctx.moveTo(tl.x, tl.y); ctx.lineTo(bl.x, bl.y);
        // Alternate diagonal direction for an organic triangulated look
        if ((r + c) % 2 === 0) {
          ctx.moveTo(tl.x, tl.y); ctx.lineTo(br.x, br.y);
        } else {
          ctx.moveTo(tr.x, tr.y); ctx.lineTo(bl.x, bl.y);
        }
        ctx.stroke();
      }
    }
    // Close right column and bottom row edges
    for (let r = 0; r <= rows; r++) {
      const i = r * stride + cols;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + stride].x, pts[i + stride].y);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      const i = rows * stride + c;
      ctx.beginPath();
      ctx.moveTo(pts[i].x, pts[i].y);
      ctx.lineTo(pts[i + 1].x, pts[i + 1].y);
      ctx.stroke();
    }

    // ── Clip mesh to text outline using destination-in compositing ──
    const fontSize = Math.min(W / 5.2, 190);
    ctx.font = `900 ${fontSize}px 'Roboto Mono', monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.globalCompositeOperation = 'destination-in';
    ctx.fillStyle = '#ffffff';
    ctx.fillText('SCRIPTONE', W / 2, H / 2);

    // ── Draw crisp text outline on top ──
    ctx.globalCompositeOperation = 'source-over';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.strokeText('SCRIPTONE', W / 2, H / 2);
  }
}

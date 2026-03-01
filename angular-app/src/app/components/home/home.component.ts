import {
  Component, inject, OnInit, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, HostListener, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {
  state = inject(AppStateService);
  private zone = inject(NgZone);

  @ViewChild('neuralChartCanvas') neuralCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expandingBox') expandingBoxRef!: ElementRef<HTMLDivElement>;

  typewriterText = '';
  private neuralChart: Chart | null = null;
  private neuralInterval: any;
  private readonly snapSectionIds = ['hero-sec', 'achievements-sec', 'services-sec', 'resources-sec', 'sponsor'];

  achievementIds = ['analyzer', 'nexus', 'elastic'];

  getAchievement(id: string) {
    return this.state.achievements[id];
  }

  sliderTransform() {
    const idx = this.state.sliderIndex();
    const gap = 40;
    return `translateX(calc(-${idx * 100}% - ${idx * gap}px))`;
  }

  ngOnInit() {
    this.initTypewriter();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initNeuralChart();
      this.handleReveal();
      this.initScrollSnap();
    }, 100);
  }

  ngOnDestroy() {
    this.neuralChart?.destroy();
    clearInterval(this.neuralInterval);
    this.destroyScrollSnap();
  }

  private initTypewriter() {
    const text = 'Building';
    let i = 0;
    this.typewriterText = '';
    const type = () => {
      if (i < text.length) {
        this.typewriterText += text.charAt(i);
        i++;
        setTimeout(type, 150);
      }
    };
    setTimeout(type, 600);
  }

  private initNeuralChart() {
    if (!this.neuralCanvas) return;
    const nodes = Array.from({ length: 30 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      r: Math.random() * 15 + 8
    }));
    const ctx = this.neuralCanvas.nativeElement.getContext('2d')!;
    this.neuralChart = new Chart(ctx, {
      type: 'bubble',
      data: {
        datasets: [{
          data: nodes as any,
          backgroundColor: 'rgba(217, 119, 87, 0.5)',
          borderColor: 'transparent'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false } },
        animation: { duration: 3000 }
      }
    });

    this.zone.runOutsideAngular(() => {
      this.neuralInterval = setInterval(() => {
        if (!this.neuralChart) return;
        (this.neuralChart.data.datasets[0].data as any[]).forEach((n: any) => {
          n.x += (Math.random() - 0.5) * 1.2;
          n.y += (Math.random() - 0.5) * 1.2;
        });
        this.neuralChart.update('none');
      }, 100);
    });
  }

  handleReveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.9) el.classList.add('active');
    });
  }

  @HostListener('window:scroll')
  onScroll() {
    this.handleReveal();
    this.handleExpandingBox();
  }

  private handleExpandingBox() {
    const box = this.expandingBoxRef?.nativeElement;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const viewHeight = window.innerHeight;
    if (rect.top < viewHeight && rect.bottom > 0) {
      const factor = Math.min(1, Math.max(0, (viewHeight - rect.top) / 500));
      box.style.width = `${80 + 20 * factor}%`;
      box.style.borderRadius = `${5 - 5 * factor}rem`;
    }
  }

  moveSlider(dir: number) {
    this.state.moveSlider(dir, this.achievementIds.length);
  }

  private initScrollSnap() {
    const navbarHeight = 80;
    document.documentElement.style.scrollSnapType = 'y mandatory';
    this.snapSectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.scrollSnapAlign = 'start';
      el.style.scrollMarginTop = `${navbarHeight}px`;
    });
  }

  private destroyScrollSnap() {
    document.documentElement.style.scrollSnapType = '';
    this.snapSectionIds.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.style.scrollSnapAlign = '';
      el.style.scrollMarginTop = '';
    });
  }
}

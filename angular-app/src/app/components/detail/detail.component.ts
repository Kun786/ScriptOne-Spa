import { Component, inject, OnInit, OnDestroy, computed, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../services/app-state.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

@Component({
  selector: 'app-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './detail.component.html',
})
export class DetailComponent implements AfterViewInit, OnDestroy {
  state = inject(AppStateService);

  @ViewChild('detailChartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  achievement = computed(() => this.state.activeAchievement);
  private chart: Chart | null = null;

  ngAfterViewInit() {
    setTimeout(() => this.renderChart(), 100);
  }

  ngOnDestroy() {
    this.chart?.destroy();
  }

  renderChart() {
    const a = this.achievement();
    if (!a || !this.chartCanvas) return;
    this.chart?.destroy();
    const ctx = this.chartCanvas.nativeElement.getContext('2d')!;
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        datasets: [{
          label: a.chartLabel,
          data: a.chartData,
          borderColor: '#D97757',
          backgroundColor: 'rgba(217, 119, 87, 0.1)',
          fill: true,
          tension: 0.4,
          borderWidth: 4,
          pointRadius: 6,
          pointBackgroundColor: '#D97757'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { display: false }, y: { display: false } },
        plugins: { legend: { display: false } }
      }
    });
  }
}

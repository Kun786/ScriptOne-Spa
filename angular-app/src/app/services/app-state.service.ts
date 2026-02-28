import { Injectable, signal, computed } from '@angular/core';

export interface Achievement {
  tag: string;
  title: string;
  desc: string;
  stat1: string;
  label1: string;
  stat2: string;
  label2: string;
  chartData: number[];
  chartLabel: string;
}

export interface TechItem {
  name: string;
  icon: string;
  color: string;
  bg: string;
}

@Injectable({ providedIn: 'root' })
export class AppStateService {
  theme = signal<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  view = signal<'home' | 'detail'>('home');
  activeAchievementId = signal<string | null>(null);
  sliderIndex = signal(0);

  readonly achievements: Record<string, Achievement> = {
    analyzer: {
      tag: 'Integrity',
      title: 'S1_Analyzer',
      desc: 'Real-time topology mapping across distributed server clusters.',
      stat1: '99.9%', label1: 'Stability',
      stat2: '1.2TB', label2: 'Logs/Day',
      chartData: [45, 52, 48, 60, 58, 72, 85],
      chartLabel: 'Inference Precision'
    },
    nexus: {
      tag: 'Latency',
      title: 'Nexus_Mesh',
      desc: 'Specialized API gateway for RAG pipelines with near-zero overhead.',
      stat1: '14ms', label1: 'Response',
      stat2: '3.2x', label2: 'Lift',
      chartData: [85, 80, 75, 72, 68, 65, 62],
      chartLabel: 'Latency Decay'
    },
    elastic: {
      tag: 'Scaling',
      title: 'Elastic Core',
      desc: 'Predictive load balancing engine anticipating traffic spikes.',
      stat1: '12.5M', label1: 'Concurrent',
      stat2: '0ms', label2: 'Cold Starts',
      chartData: [10, 25, 40, 65, 85, 110, 140],
      chartLabel: 'Velocity'
    }
  };

  readonly techStack: TechItem[] = [
    { name: 'WordPress',   icon: 'W',  color: '#21759b', bg: '#e2f2ff' },
    { name: 'WooCommerce', icon: '🛒', color: '#96588a', bg: '#f9efff' },
    { name: 'MEAN Stack',  icon: 'M',  color: '#00cc66', bg: '#eafff1' },
    { name: 'MERN Stack',  icon: '⚛',  color: '#61dafb', bg: '#f0fbff' },
    { name: 'Next.js',     icon: '▲',  color: '#000000', bg: '#f0f0f0' },
    { name: 'TypeScript',  icon: 'TS', color: '#3178c6', bg: '#eef6ff' },
    { name: 'Python',      icon: '🐍', color: '#3776ab', bg: '#eff7ff' },
    { name: 'TailwindCSS', icon: '🌊', color: '#06b6d4', bg: '#e0fbff' },
    { name: 'Nest.js',     icon: '🦅', color: '#e0234e', bg: '#fff0f3' },
    { name: 'PostgreSQL',  icon: '🐘', color: '#336791', bg: '#eff5ff' },
    { name: 'MongoDB',     icon: '🍃', color: '#47a248', bg: '#f0fff1' },
    { name: 'Supabase',    icon: '⚡', color: '#3ecf8e', bg: '#ecfff7' },
    { name: 'AWS',         icon: '☁',  color: '#ff9900', bg: '#fff8e6' },
    { name: 'Docker',      icon: '🐳', color: '#2496ed', bg: '#effaff' },
    { name: 'Kubernetes',  icon: '☸',  color: '#326ce5', bg: '#f0f6ff' },
    { name: 'Terraform',   icon: '🏗',  color: '#623ce4', bg: '#f5f0ff' }
  ];

  get activeAchievement(): Achievement | null {
    const id = this.activeAchievementId();
    return id ? this.achievements[id] : null;
  }

  navigateToDetail(id: string) {
    this.activeAchievementId.set(id);
    this.view.set('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  navigateToHome() {
    this.view.set('home');
    this.activeAchievementId.set(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  toggleTheme() {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    this.theme.set(next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', next);
  }

  initTheme() {
    if (this.theme() === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }

  moveSlider(direction: number, totalCards: number) {
    const viewCount = window.innerWidth < 1024 ? 1 : 2;
    const max = Math.ceil(totalCards / viewCount) - 1;
    let next = this.sliderIndex() + direction;
    if (next < 0) next = 0;
    if (next > max) next = max;
    this.sliderIndex.set(next);
  }
}

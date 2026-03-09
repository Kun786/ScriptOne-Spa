import {
  Component, inject, OnDestroy, AfterViewInit,
  ElementRef, ViewChild, HostListener, NgZone
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm, NgModel } from '@angular/forms';
import { AppStateService } from '../../services/app-state.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  state = inject(AppStateService);
  private zone = inject(NgZone);

  @ViewChild('neuralChartCanvas') neuralCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('expandingBox') expandingBoxRef!: ElementRef<HTMLDivElement>;

  private neuralAnimFrame: number | null = null;
  private neuralParticles: { x: number; y: number; vx: number; vy: number; r: number }[] = [];
  private consultAlertTimer: ReturnType<typeof setTimeout> | null = null;
  private heroAutoTimer: ReturnType<typeof setInterval> | null = null;
  private readonly snapSectionIds = ['hero-sec', 'achievements-sec', 'services-sec', 'technologies-sec', 'resources-sec', 'sponsor'];

  achievementIds = ['analyzer', 'nexus', 'elastic'];

  techItems: { label: string; icon: string; color: string }[] = [
    { label: 'TypeScript',         icon: 'typescript',          color: '#3178C6' },
    { label: 'JavaScript ES6+',    icon: 'javascript',          color: '#F7DF1E' },
    { label: 'MEAN Stack',         icon: 'angular',             color: '#DD0031' },
    { label: 'MERN Stack',         icon: 'react',               color: '#61DAFB' },
    { label: 'Angular 2+',         icon: 'angular',             color: '#DD0031' },
    { label: 'Next.js',            icon: 'nextdotjs',           color: '#c4c4c4' },
    { label: 'Node.js',            icon: 'nodedotjs',           color: '#68A063' },
    { label: 'Nest.js',            icon: 'nestjs',              color: '#E0234E' },
    { label: 'Express.js',         icon: 'express',             color: '#c4c4c4' },
    { label: 'WordPress CMS',      icon: 'wordpress',           color: '#21759B' },
    { label: 'WooCommerce',        icon: 'woocommerce',         color: '#96588A' },
    { label: 'PHP',                icon: 'php',                 color: '#777BB4' },
    { label: 'MariaDB',            icon: 'mariadb',             color: '#c0765a' },
    { label: 'Elementor Pro',      icon: 'elementor',           color: '#E2003B' },
    { label: 'YITH Plugins',       icon: 'wordpress',           color: '#21759B' },
    { label: 'Stripe',             icon: 'stripe',              color: '#626CD9' },
    { label: 'PayPal',             icon: 'paypal',              color: '#169BD7' },
    { label: 'Razorpay',           icon: 'razorpay',            color: '#528FF0' },
    { label: 'Custom Theme Dev',   icon: 'wordpress',           color: '#21759B' },
    { label: 'Custom Plugin Dev',  icon: 'woocommerce',         color: '#96588A' },
    { label: 'MongoDB',            icon: 'mongodb',             color: '#47A248' },
    { label: 'PostgreSQL',         icon: 'postgresql',          color: '#4169E1' },
    { label: 'MySQL',              icon: 'mysql',               color: '#4479A1' },
    { label: 'GraphQL',            icon: 'graphql',             color: '#E10098' },
    { label: 'OpenAI',             icon: 'openai',              color: '#ffffff' },
    { label: 'Google Gemini',      icon: 'googlegemini',        color: '#8E75B2' },
    { label: 'Cursor AI',          icon: 'cursor',              color: '#F3F1E7' },
    { label: 'Claude Code',        icon: 'anthropic',           color: '#D4A27F' },
    { label: 'Docker',             icon: 'docker',              color: '#2496ED' },
    { label: 'Kubernetes',         icon: 'kubernetes',          color: '#326CE5' },
    { label: 'AWS',                icon: 'amazonwebservices',   color: '#FF9900' },
    { label: 'Google Cloud',       icon: 'googlecloud',         color: '#4285F4' },
    { label: 'Azure',              icon: 'microsoftazure',      color: '#50AFFF' },
    { label: 'WebSockets',         icon: 'socketdotio',         color: '#c4c4c4' },
    { label: 'JWT · OAuth',        icon: 'jsonwebtokens',       color: '#D97757' },
    { label: 'GitHub Actions',     icon: 'githubactions',       color: '#2088FF' },
    { label: 'NGINX',              icon: 'nginx',               color: '#009639' },
    { label: 'HTML5',              icon: 'html5',               color: '#E34F26' },
    { label: 'CSS3',               icon: 'css3',                color: '#1572B6' },
    { label: 'Tailwind CSS',       icon: 'tailwindcss',         color: '#06B6D4' },
    { label: 'Bootstrap',          icon: 'bootstrap',           color: '#7952B3' },
    { label: 'Mongoose ODM',       icon: 'mongoose',            color: '#880000' },
    { label: 'MongoAtlas',         icon: 'mongodb',             color: '#47A248' },
    { label: 'Passport.js',        icon: '',                    color: '#34D399' },
    { label: 'RESTful APIs',       icon: '',                    color: '#D97757' },
    { label: 'AI Agent Dev',       icon: '',                    color: '#8E75B2' },
    { label: 'Prompt Engineering', icon: '',                    color: '#F59E0B' },
    { label: 'Git',                icon: 'git',                 color: '#F05032' },
    { label: 'GitHub',             icon: 'github',              color: '#c4c4c4' },
    { label: 'VSCode',             icon: 'visualstudiocode',    color: '#007ACC' },
    { label: 'Angular CLI',        icon: 'angular',             color: '#DD0031' },
    { label: 'NPM',                icon: 'npm',                 color: '#CB3837' },
    { label: 'Postman',            icon: 'postman',             color: '#FF6C37' },
    { label: 'Swagger',            icon: 'swagger',             color: '#85EA2D' },
    { label: 'DigitalOcean',       icon: 'digitalocean',        color: '#0080FF' },
    { label: 'Heroku',             icon: 'heroku',              color: '#9E7CC1' },
    { label: 'Vercel',             icon: 'vercel',              color: '#c4c4c4' },
    { label: 'Netlify',            icon: 'netlify',             color: '#00C7B7' },
    { label: 'Ubuntu',             icon: 'ubuntu',              color: '#E95420' },
    { label: 'Terraform',          icon: 'terraform',           color: '#7B42BC' },
    { label: 'Vault',              icon: 'vault',               color: '#FFEC6E' },
    { label: 'Shell Scripting',    icon: 'gnubash',             color: '#4EAA25' },
    { label: 'CI/CD Pipelines',    icon: '',                    color: '#6366F1' },
  ];

  resourceItems: { title: string; meta: string; url: string }[] = [
    { title: 'Startup Website Page Map (WordPress)', meta: 'PDF / 2.2MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'WooCommerce Launch Checklist', meta: 'PDF / 3.4MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'GA4 Ecommerce Events Sheet', meta: 'PDF / 1.9MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'Agentic AI Discovery Blueprint', meta: 'GUIDE / 1.6MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'Custom Web Application Planning Canvas', meta: 'PDF / 2.7MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'WordPress Performance Optimization Checklist', meta: 'CHECKLIST / 1.4MB / 2026 Edition', url: 'https://scriptone.io/' },
    { title: 'WooCommerce Conversion UX Audit Sheet', meta: 'PDF / 2.1MB / 2026 Edition', url: 'https://scriptone.io/' },
  ];

  portfolioProjects = [
    {
      id: 'magnus',
      title: 'Magnus Recruitment',
      url: 'https://magnusrecruitment.com.au/',
      category: 'Recruitment Platform',
      platform: 'MEAN Stack',
      market: 'Australia',
      owner: 'Rizwan & Ali',
      completion: '11 months',
      description: 'Magnus Recruitment is a web-based recruitment platform that connects employers and job seekers through a streamlined hiring process. Candidates browse and apply for jobs, employers review profiles and evaluate qualifications, and both parties can schedule interviews — all within a centralised, role-based dashboard.',
      feedback: 'The Magnus Recruitment platform was delivered with professionalism and technical excellence. The system meets our business requirements effectively and provides a smooth user experience for both employers and job seekers.',
      techStack: ['MongoDB', 'Express.js', 'Angular', 'NestJS', 'TypeScript', 'JWT'],
      logo: '/magnus.png',
    },
    {
      id: 'midnight',
      title: 'Midnight Establishment',
      url: 'https://www.midnightestablishment.co.uk/',
      category: 'IT Solutions Website',
      platform: 'WordPress',
      market: 'United Kingdom',
      owner: 'Abdul Kareem',
      completion: 'Delivered on schedule',
      description: 'A UK-based IT services and recruitment company website built on WordPress. The platform showcases Web Development, App Development, IT Management, Business Analysis, and AI Automation services, while providing job inquiry forms to streamline candidate communication.',
      feedback: 'The website was developed professionally and meets all our functional requirements. The service structure, design, and overall performance reflect high-quality work. Communication and delivery were handled efficiently.',
      techStack: ['WordPress', 'PHP', 'Contact Form 7', 'Custom Theme', 'On-Page SEO', 'Responsive Design'],
      logo: '/midnight.png',
    },
    {
      id: 'dermkean',
      title: 'Dermkean',
      url: 'https://dermkean.com/',
      category: 'Skincare eCommerce',
      platform: 'WooCommerce',
      market: 'Pakistan',
      owner: 'Arbaz',
      completion: 'Delivered on schedule',
      description: 'A conversion-focused skincare eCommerce store for the Pakistan market featuring multiple skincare products, bundled offers, dynamic discount displays, and city-based shipping cost logic to ensure accurate delivery pricing at checkout.',
      feedback: 'Our eCommerce store was built with a strong focus on user experience and conversions. The checkout system, city-based shipping functionality, and product structure are working flawlessly. We are very pleased with the final result.',
      techStack: ['WordPress', 'WooCommerce', 'PHP', 'Payment Gateways', 'City Shipping Logic', 'On-Page SEO'],
      logo: '/Dermkean.png',
    },
    {
      id: 'hinayat',
      title: 'Hinayat',
      url: 'https://hinayat.co.uk/',
      category: 'Fashion eCommerce',
      platform: 'Shopify',
      market: 'United Kingdom',
      owner: 'Taimoor Khan',
      completion: 'Delivered on schedule',
      description: 'A fully functional Shopify store for a UK modest fashion brand specialising in hijabs, abayas, and kimonos. Built with strong visual branding, structured product collections, credit/debit card payment integration, and UK-wide shipping configured for a seamless shopping experience.',
      feedback: 'The Shopify store exceeded our expectations in terms of design, performance, and functionality. Payment integration and UK shipping setup were handled smoothly. The website provides a seamless shopping experience for our customers.',
      techStack: ['Shopify', 'Liquid', 'Credit/Debit Payments', 'UK Shipping', 'Mobile-First Design', 'On-Page SEO'],
      logo: '/Hinayat.webp',
    },
    {
      id: 'takemyjunk',
      title: 'Take My Junk Dubai',
      url: 'https://www.takemyjunkserviceindubai.com/',
      category: 'Service Business',
      platform: 'WordPress',
      market: 'Dubai',
      owner: 'Farhan',
      completion: 'Delivered on schedule',
      description: 'A professional WordPress website for a Dubai-based junk removal company providing waste collection, safe handling, and responsible disposal services for homes and businesses — designed to generate leads, build trust, and make it easy for customers to request quotes.',
      feedback: 'The website clearly represents our services and helps us generate consistent customer inquiries. The layout is professional, fast, and easy to manage. The development process was smooth and well-organised.',
      techStack: ['WordPress', 'PHP', 'Contact Form 7', 'Performance Optimisation', 'Responsive Design', 'On-Page SEO'],
      logo: '/takemyjunkserviceindubai.png',
    },
    {
      id: 'medicalsafety',
      title: 'Medical Safety',
      url: 'https://www.medicalsafety.co.uk/',
      category: 'IT Services Website',
      platform: 'WordPress',
      market: 'United Kingdom',
      owner: 'Abdul Kareem',
      completion: 'Delivered on schedule',
      description: 'A professionally developed WordPress website for a UK IT solutions and technology services company. The platform presents services covering Web Development, App Development, IT Management, Business Analysis, and AI Automation with a clean, corporate layout optimised for credibility and lead generation.',
      feedback: 'A high-quality, structured web presence that clearly showcases our IT and recruitment services. Delivered with professionalism, strong performance, and solid SEO foundations.',
      techStack: ['WordPress', 'PHP', 'Custom Theme', 'Contact Forms', 'Responsive Design', 'On-Page SEO'],
      logo: '/medicalsafety.png',
    },
    {
      id: 'purplepay',
      title: 'Purple Pay Umbrella',
      url: 'https://purplepayumbrella.co.uk/',
      category: 'Payroll Solutions',
      platform: 'WordPress',
      market: 'United Kingdom',
      owner: 'Taimoor',
      completion: 'Delivered on time',
      description: 'A UK-based payroll solution website designed to help contractors and businesses streamline payment processes with same-day pay, full compliance, and hassle-free tax management. Built to reflect trust, security, and professionalism within the UK contractor finance market.',
      feedback: 'We are extremely satisfied with the development of the Purple Pay Umbrella website. The platform reflects our brand professionalism and clearly communicates our payroll and compliance services. Delivered on time with excellent attention to detail. Highly recommended.',
      techStack: ['WordPress', 'PHP', 'Lead Gen Forms', 'Corporate UI Design', 'UK SEO', 'Performance Optimisation'],
      logo: '/purplepay.png',
    },
    {
      id: 'radstudy',
      title: 'Global Age Testing System',
      url: 'https://frontend-lms-psi.vercel.app/',
      category: 'Learning & Assessment Platform',
      platform: 'MEAN Stack',
      market: 'Global',
      owner: 'Daniel Harper & Sophia Reeves',
      completion: '4 months (agile lifecycle)',
      description: 'Global Age Testing System is a web-based learning and assessment platform that connects instructors and learners through a modern, intuitive interface. The system supports role-based dashboards, course and module management, assessments, and progress tracking, with a scalable architecture optimized for desktop and mobile.',
      feedback: "Working with the ScriptOne team was a smooth experience from start to finish. They understood our vision quickly and delivered a clean, reliable platform ahead of our expected timeline. We'd confidently recommend them to anyone looking for a capable and communicative development team.",
      techStack: ['MEAN Stack', 'Angular 2+', 'Express.js', 'Node.js', 'MongoDB', 'JWT Auth', 'Vercel'],
      logo: '',
    },
    {
      id: 'humanoid',
      title: 'Humanoid CRM',
      url: 'https://humanoidcrm.com/',
      category: 'CRM / SaaS',
      platform: 'MEAN Stack',
      market: 'Global',
      owner: 'Taimoor Khan',
      completion: 'Successfully deployed',
      description: 'A MEAN Stack-based payroll and workforce management CRM that automates payroll services, generates payslips, and manages contractors and clients within a secure centralised dashboard. Features automated payroll calculations, tax handling, reporting, and role-based access control for compliance-focused operations.',
      feedback: 'The Humanoid CRM system has significantly improved our payroll operations. The automation of payslip generation and payroll management has reduced manual errors and increased efficiency. The system is secure, reliable, and perfectly aligned with our business requirements. Exceptional technical execution throughout.',
      techStack: ['MongoDB', 'Express.js', 'Angular', 'NestJS', 'TypeScript', 'RBAC', 'JWT'],
      logo: '',
    }
  ];

  heroServiceIndex = 0;
  heroFading = false;
  private heroAnimating = false;

  heroServices = [
    { key: 'wp',     kicker: 'Platform',    name: 'WordPress',          desc: 'Custom themes, block editors & performance-tuned WordPress sites built for speed and scale.' },
    { key: 'woo',    kicker: 'E-Commerce',  name: 'WooCommerce',         desc: 'High-converting stores with payments, shipping, email flows and analytics built in.' },
    { key: 'webapp', kicker: 'Development', name: 'Custom Web Apps',     desc: 'Bespoke web applications engineered with modern frameworks for complex business needs.' },
    { key: 'ai',     kicker: 'AI',          name: 'Agentic AI Powered Apps', desc: 'AI-powered agents that automate complex workflows and unlock new business capabilities.' },
  ];

  consultServiceOptions = [
    'WordPress Websites',
    'Ecommerce Store',
    'AI-Powered Custom Web Applications',
    'DevOps, Cloud Infrastructure & Integrations',
  ];

  consultForm = {
    name: '',
    email: '',
    service: '',
    description: '',
  };
  consultSubmitted = false;
  consultSubmitting = false;
  consultAlert: { type: 'success' | 'error'; message: string } | null = null;

  moveHeroService(dir: number) {
    if (this.heroAnimating) return;
    this.heroAnimating = true;
    this.heroFading = true;
    setTimeout(() => {
      this.heroServiceIndex = (this.heroServiceIndex + dir + this.heroServices.length) % this.heroServices.length;
      this.heroFading = false;
      setTimeout(() => {
        this.heroAnimating = false;
      }, 160);
    }, 260);
  }

  openConsultWithService(service: string) {
    this.consultForm.service = service;
    this.consultSubmitted = false;
    const consultEl = document.getElementById('sponsor');
    if (!consultEl) return;
    consultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  isConsultFieldInvalid(model: NgModel | null) {
    if (!model) return false;
    return !!(model.invalid && (model.touched || this.consultSubmitted));
  }

  private showConsultAlert(type: 'success' | 'error', message: string) {
    this.consultAlert = { type, message };
    if (this.consultAlertTimer) clearTimeout(this.consultAlertTimer);
    this.consultAlertTimer = setTimeout(() => {
      this.consultAlert = null;
      this.consultAlertTimer = null;
    }, 5000);
  }

  async submitConsultForm(form: NgForm) {
    this.consultSubmitted = true;
    if (form.invalid || this.consultSubmitting) return;
    this.consultSubmitting = true;

    try {
      const response = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: this.consultForm.name.trim(),
          email: this.consultForm.email.trim(),
          service: this.consultForm.service.trim(),
          description: this.consultForm.description.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 404 && window.location.hostname === 'localhost') {
          throw new Error('Local API route not found. Use `vercel dev` for API routes or deploy to Vercel.');
        }
        throw new Error('Request failed');
      }

      form.resetForm({ service: '' });
      this.consultSubmitted = false;
      this.showConsultAlert('success', 'Request submitted successfully. Our team will contact you shortly.');
    } catch (err) {
      console.error('Consult form email send failed', err);
      const message = err instanceof Error ? err.message : 'Unable to send request right now. Please try again in a moment.';
      this.showConsultAlert('error', message);
    } finally {
      this.consultSubmitting = false;
    }
  }

  getAchievement(id: string) {
    return this.state.achievements[id];
  }

  sliderTransform() {
    const idx = this.state.sliderIndex();
    const gap = 40;
    return `translateX(calc(-${idx * 100}% - ${idx * gap}px))`;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.initNeuralChart();
      this.handleReveal();
      this.initScrollSnap();
    }, 100);
    this.heroAutoTimer = setInterval(() => this.moveHeroService(1), 5000);
  }

  ngOnDestroy() {
    if (this.neuralAnimFrame) cancelAnimationFrame(this.neuralAnimFrame);
    if (this.consultAlertTimer) clearTimeout(this.consultAlertTimer);
    if (this.heroAutoTimer) clearInterval(this.heroAutoTimer);
    this.destroyScrollSnap();
  }

  private initNeuralChart() {
    if (!this.neuralCanvas) return;
    const canvas = this.neuralCanvas.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const syncSize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    syncSize();

    const COUNT = 65;
    const MAX_DIST = 140;
    const SPEED = 0.35;

    const spawn = () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * SPEED * 2,
      vy: (Math.random() - 0.5) * SPEED * 2,
      r: Math.random() * 1.5 + 1,
    });

    this.neuralParticles = Array.from({ length: COUNT }, spawn);

    const onResize = () => {
      syncSize();
      this.neuralParticles.forEach(p => {
        p.x = Math.min(p.x, canvas.width);
        p.y = Math.min(p.y, canvas.height);
      });
    };
    window.addEventListener('resize', onResize);

    const draw = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const ps = this.neuralParticles;
      ps.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) { p.x = 0; p.vx *= -1; }
        if (p.x > w) { p.x = w; p.vx *= -1; }
        if (p.y < 0) { p.y = 0; p.vy *= -1; }
        if (p.y > h) { p.y = h; p.vy *= -1; }
      });

      for (let i = 0; i < ps.length; i++) {
        for (let j = i + 1; j < ps.length; j++) {
          const dx = ps[i].x - ps[j].x;
          const dy = ps[i].y - ps[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.45;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(217,119,87,${alpha})`;
            ctx.lineWidth = 0.7;
            ctx.moveTo(ps[i].x, ps[i].y);
            ctx.lineTo(ps[j].x, ps[j].y);
            ctx.stroke();
          }
        }
      }

      ps.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(217,119,87,0.85)';
        ctx.fill();
      });

      this.neuralAnimFrame = requestAnimationFrame(draw);
    };

    this.zone.runOutsideAngular(() => {
      this.neuralAnimFrame = requestAnimationFrame(draw);
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
    this.state.moveSlider(dir, this.portfolioProjects.length);
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

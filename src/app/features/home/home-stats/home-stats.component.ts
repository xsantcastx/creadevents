import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-home-stats',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './home-stats.component.html',
  styleUrl: './home-stats.component.scss'
})
export class HomeStatsComponent implements OnInit {
  minersDeployed = signal(0);
  customerSatisfaction = signal(0);
  uptimeGuarantee = signal(0);
  yearsExperience = signal(0);

  ngOnInit() {
    // Animate counters
    this.animateCounter(this.minersDeployed, 5000, 2000);
    this.animateCounter(this.customerSatisfaction, 98, 2000);
    this.animateCounter(this.uptimeGuarantee, 99.9, 2000, true);
    this.animateCounter(this.yearsExperience, 5, 1500);
  }

  private animateCounter(signal: any, target: number, duration: number, isDecimal = false) {
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        signal.set(isDecimal ? target : Math.floor(target));
        clearInterval(timer);
      } else {
        signal.set(isDecimal ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, 16);
  }
}

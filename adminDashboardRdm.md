1) Admin mode (toggle + auth check)

src/app/services/admin-mode.service.ts

import { Injectable, signal, computed } from '@angular/core';
import { getApp, getApps, initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminModeService {
  private app = getApps().length ? getApp() : initializeApp(environment.firebase);
  private auth = getAuth(this.app);

  readonly on = signal<boolean>(false);
  readonly authed = signal<boolean>(false);

  readonly canEdit = computed(() => this.on() && this.authed());

  constructor() {
    // seed from URL (?admin=1) or localStorage
    const params = new URLSearchParams(window.location.search);
    const q = params.get('admin');
    if (q === '1') localStorage.setItem('adminMode', '1');
    if (q === '0') localStorage.removeItem('adminMode');

    this.on.set(localStorage.getItem('adminMode') === '1');

    onAuthStateChanged(this.auth, (u) => this.authed.set(!!u));
  }

  toggle() {
    const next = !this.on();
    this.on.set(next);
    if (next) localStorage.setItem('adminMode', '1'); else localStorage.removeItem('adminMode');
  }
}

2) Floating admin toolbar (toggle anywhere)

src/app/components/admin-toolbar/admin-toolbar.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminModeService } from '../../services/admin-mode.service';

@Component({
  standalone: true,
  selector: 'app-admin-toolbar',
  imports: [CommonModule],
  template: `
  <div class="atbar" *ngIf="svc.authed()">
    <button (click)="svc.toggle()" [class.on]="svc.on()">
      Admin Mode: {{ svc.on() ? 'ON' : 'OFF' }}
    </button>
    <small *ngIf="!svc.on()">append <code>?admin=1</code> to enable here</small>
  </div>
  `,
  styles: [`
  .atbar{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;gap:8px;align-items:center}
  .atbar button{border:1px solid #ddd;border-radius:999px;padding:8px 12px;background:#fff;cursor:pointer}
  .atbar button.on{border-color:#b3e5c8;background:#e9f9f0}
  .atbar small{background:#fff;padding:4px 8px;border:1px solid #eee;border-radius:6px}
  code{background:#f6f6f6;padding:2px 6px;border-radius:4px}
  `]
})
export class AdminToolbarComponent {
  constructor(public svc: AdminModeService) {}
}


Add this component once in your app shell (e.g., AppComponent template) so it’s on every page:

<router-outlet></router-outlet>
<app-admin-toolbar></app-admin-toolbar>

3) Slot image with inline picker

src/app/components/slot-img/slot-img.component.ts

import { Component, Input, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsService, SlotDoc } from '../../services/cms.service';
import { ImageAssetService, ImageDoc } from '../../services/image-asset.service';
import { AdminModeService } from '../../services/admin-mode.service';

@Component({
  standalone: true,
  selector: 'slot-img',
  imports: [CommonModule],
  templateUrl: './slot-img.component.html',
  styleUrls: ['./slot-img.component.css']
})
export class SlotImgComponent {
  @Input({ required: true }) key!: string;
  @Input() altDefault = '';
  @Input() class = ''; // optional: pass-through class

  slot = signal<SlotDoc | null>(null);
  loading = signal<boolean>(true);

  // picker
  pickerOpen = signal(false);
  pickerLoading = signal(false);
  pickerImages = signal<ImageDoc[]>([]);
  pickerFilter = signal('');

  constructor(
    public admin: AdminModeService,
    private cms: CmsService,
    private assets: ImageAssetService
  ) {
    effect(() => { this.load(); }); // loads once; key is static per instance
  }

  async load() {
    if (!this.key) return;
    this.loading.set(true);
    try {
      this.slot.set(await this.cms.getSlot(this.key));
    } finally {
      this.loading.set(false);
    }
  }

  // overlay actions
  async openPicker() {
    this.pickerOpen.set(true);
    await this.loadPicker();
  }

  async loadPicker() {
    this.pickerLoading.set(true);
    try {
      // If slot has a preferred section, filter by it for convenience
      const sec = this.slot()?.section as any;
      this.pickerImages.set(sec ? await this.assets.list(sec) : await this.assets.listAll());
    } finally {
      this.pickerLoading.set(false);
    }
  }

  get pickerFiltered() {
    const q = this.pickerFilter().toLowerCase().trim();
    const list = this.pickerImages();
    return !q ? list : list.filter(i => i.name.toLowerCase().includes(q));
  }

  async assign(img: ImageDoc) {
    await this.cms.assignSlot(this.key, img);
    this.pickerOpen.set(false);
    await this.load();
  }

  async clear() {
    await this.cms.clearSlot(this.key);
    await this.load();
  }
}


src/app/components/slot-img/slot-img.component.html

<div class="slot-wrap" [class.admin]="admin.canEdit()">
  <!-- Render image or placeholder -->
  <img *ngIf="slot()?.url; else placeholder"
       [src]="slot()!.url"
       [alt]="slot()?.alt || altDefault"
       [class]="class" />

  <ng-template #placeholder>
    <div class="ph" [class]="class"> <!-- keeps space -->
      <span>No image for "{{ key }}"</span>
    </div>
  </ng-template>

  <!-- Inline overlay -->
  <div class="overlay" *ngIf="admin.canEdit()">
    <div class="overlay-bar">
      <strong>{{ key }}</strong>
      <div class="spacer"></div>
      <input type="text" placeholder="Search…" (input)="pickerFilter.set(($event.target as HTMLInputElement).value)" *ngIf="pickerOpen()" />
      <button *ngIf="!pickerOpen()" (click)="openPicker()">Change</button>
      <button *ngIf="slot()?.url" class="ghost" (click)="clear()">Clear</button>
      <button class="ghost" *ngIf="pickerOpen()" (click)="pickerOpen.set(false)">Close</button>
    </div>

    <!-- Picker panel -->
    <div class="picker" *ngIf="pickerOpen()">
      <div class="grid" *ngIf="!pickerLoading(); else busy">
        <button class="tile" *ngFor="let img of pickerFiltered" (click)="assign(img)">
          <img [src]="img.url" [alt]="img.name" />
          <span class="name" title="{{img.name}}">{{ img.name }}</span>
        </button>
      </div>
      <ng-template #busy><div class="busy">Loading…</div></ng-template>
    </div>
  </div>
</div>


src/app/components/slot-img/slot-img.component.css

.slot-wrap { position: relative; display: block; }
.slot-wrap.admin { outline: 1px dashed rgba(0,0,0,0.08); }

.ph { display:flex; align-items:center; justify-content:center; background:#fafafa; color:#999; min-height:120px; border:1px dashed #eee; }

.overlay { position:absolute; inset:auto 0 0 0; background:linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0)); color:#fff; padding:8px; }
.overlay-bar { display:flex; gap:8px; align-items:center; }
.overlay-bar .spacer{flex:1}
.overlay button { border:1px solid rgba(255,255,255,0.6); background:rgba(0,0,0,0.25); color:#fff; border-radius:8px; padding:4px 8px; cursor:pointer; }
.overlay button:hover{ background:rgba(0,0,0,0.4); }
.overlay button.ghost{ background:transparent; }

.picker { margin-top:8px; background:rgba(0,0,0,0.5); padding:8px; border-radius:8px; }
.grid { display:grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap:8px; max-height:40vh; overflow:auto; }
.tile { background:#fff; color:#333; border:1px solid #eee; border-radius:8px; padding:6px; text-align:left; }
.tile img { width:100%; height:120px; object-fit:cover; border-radius:6px; }
.tile .name { font-size:12px; display:block; margin-top:4px; overflow:hidden; white-space:nowrap; text-overflow:ellipsis; }
.busy { padding:8px; }

4) Use it in your pages (replace hard-coded images)

Anywhere you want a slotted image, drop:

<slot-img key="home.header" altDefault="Home Hero" class="hero-img"></slot-img>


Examples:

Home header → key="home.header"

Services header → key="services.header"

Footer logo → key="footer.logo"

As soon as Admin Mode is ON (toggle or ?admin=1) and the admin is signed in, a small overlay appears on each slotted image with Change / Clear and the inline picker.

5) Optional – link the picker to your existing sections

The picker already prefers the slot’s section (e.g., hero) if set in the slot doc; otherwise it shows all. You can set that when creating slots from your Slot Manager (we already added section there).
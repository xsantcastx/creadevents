import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CmsService, SlotDoc } from '../../services/cms.service';
import { ImageAssetService, ImageDoc, Section } from '../../services/image-asset.service';
import { SITE_SLOTS, PageKey } from './site-slots';

@Component({
  selector: 'app-slot-manager',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="wrap">
      <header class="bar">
        <h2>Slots</h2>
      </header>

      <!-- Create via Selectors -->
      <section class="create">
        <h3>Create Slot</h3>

        <div class="form">
          <label>
            <span>Page</span>
            <select [value]="page()" (change)="onPageChange($event)">
              <option *ngFor="let p of pages" [value]="p">{{ p | titlecase }}</option>
            </select>
          </label>

          <label *ngIf="!advanced()">
            <span>Position</span>
            <select [value]="posKey()" (change)="onPosKeyChange($event)">
              <option *ngFor="let d of defs()" [value]="d.key">{{ d.label }}</option>
            </select>
          </label>

          <label class="grow">
            <span>Slot key</span>
            <input type="text" [value]="fullKey()" readonly *ngIf="!advanced()">
            <input type="text" [value]="customKey()" (input)="onCustomKeyChange($event)" *ngIf="advanced()">
          </label>

          <label class="grow">
            <span>Label</span>
            <input type="text" [value]="suggestedLabel()" readonly>
          </label>

          <div class="row">
            <label class="checkbox">
              <input type="checkbox" [checked]="advanced()" (change)="onAdvancedChange($event)">
              <span>Advanced (custom key)</span>
            </label>
            <button (click)="createSlot()">Create</button>
            <button class="ghost" (click)="createDefaultsForPage()">Create defaults for page</button>
          </div>
        </div>

        <!-- Optional page preview (wireframe) -->
        <div class="wireframe" *ngIf="currentDef().preview">
          <img [src]="currentDef().preview" alt="Layout preview" />
          <small>Preview of placement</small>
        </div>
      </section>

      <!-- List for selected page -->
      <section class="list" *ngIf="!loading(); else loadingTpl">
        <h3>{{ page() | titlecase }} — Existing Slots</h3>
        <table>
          <thead>
            <tr>
              <th>Preview</th>
              <th>Key</th>
              <th>Label</th>
              <th>Section</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let slot of filteredSlots()">
              <td class="thumb">
                <img *ngIf="slot.url" [src]="slot.url" [alt]="slot.alt || slot.key" />
                <span *ngIf="!slot.url" class="placeholder">—</span>
              </td>
              <td><code>{{ slot.key }}</code></td>
              <td>{{ slot.label || '—' }}</td>
              <td>{{ slot.section || '—' }}</td>
              <td>{{ getFormattedDate(slot.updatedAt) }}</td>
              <td class="actions">
                <button (click)="openPicker(slot)">Assign image</button>
                <button (click)="clearSlot(slot)" [disabled]="!slot.url">Clear</button>
                <button class="danger" (click)="deleteSlot(slot)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
      <ng-template #loadingTpl><p>Loading…</p></ng-template>

      <!-- Picker -->
      <div class="modal-backdrop" *ngIf="pickerOpen()" (click)="closeModal()"></div>
      <div class="modal" *ngIf="pickerOpen()" (click)="$event.stopPropagation()">
        <header class="modal-bar">
          <h3>Select Image</h3>
          <div class="modal-actions">
            <select [value]="pickerSection()" (change)="onPickerSectionChange($event)">
              <option value="all">All Sections</option>
              <option value="hero">Hero</option>
              <option value="gallery">Gallery</option>
              <option value="about">About</option>
              <option value="services">Services</option>
              <option value="footer">Footer</option>
            </select>
            <input type="text" placeholder="Search filename…" (input)="onPickerFilterChange($event)" />
            <button (click)="closeModal()">Close</button>
          </div>
        </header>

        <div class="picker-grid" *ngIf="!pickerLoading(); else busy">
          <button class="tile" *ngFor="let img of pickerFiltered()" (click)="assign(img)">
            <img [src]="img.url" [alt]="img.name" />
            <span class="tile-name" [title]="img.name">{{ img.name }}</span>
          </button>
        </div>
        <ng-template #busy><p style="padding:12px;">Loading images…</p></ng-template>
      </div>
    </div>
  `,
  styles: [`
    .wrap { max-width: 1100px; margin: 24px auto; padding: 0 16px; }
    .bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
    .create { border: 1px solid #eee; border-radius: 12px; padding: 12px; margin-bottom: 16px; }
    .form { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; align-items: end; }
    .form label { display: grid; gap: 6px; }
    .form input, .form select { padding: 6px 8px; border: 1px solid #ddd; border-radius: 8px; }
    button { appearance: none; border: 1px solid #ddd; background: #fafafa; border-radius: 8px; padding: 6px 10px; cursor: pointer; }
    button:hover { background: #f0f0f0; }
    button.danger { border-color: #ffd7d7; color: #b00020; background: #fff2f2; }

    .list table { width: 100%; border-collapse: collapse; }
    .list th, .list td { border-bottom: 1px solid #eee; padding: 8px; text-align: left; }
    .thumb img { width: 72px; height: 48px; object-fit: cover; border-radius: 6px; background: #f4f4f4; }
    .placeholder { color: #999; }
    .actions { display: flex; gap: 6px; flex-wrap: wrap; }

    /* Modal */
    .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.25); z-index: 1000; }
    .modal { position: fixed; inset: 10% 5% auto 5%; background: #fff; border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.2); max-height: 80vh; overflow: hidden; z-index: 1001; }
    .modal-bar { display: flex; align-items: center; justify-content: space-between; padding: 12px; border-bottom: 1px solid #eee; }
    .modal-actions { display: flex; gap: 8px; align-items: center; }
    .picker-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 12px; padding: 12px; max-height: calc(80vh - 60px); overflow: auto; }
    .tile { border: 1px solid #eee; border-radius: 10px; padding: 6px; background: #fff; text-align: left; }
    .tile img { width: 100%; height: 130px; object-fit: cover; border-radius: 8px; background: #f6f6f6; }
    .tile-name { display: block; margin-top: 6px; font-size: 12px; color: #555; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

    /* Enhanced styles */
    .grow { flex: 1; }
    .row { display: flex; gap: 8px; align-items: center; margin-top: 10px; }
    .checkbox { display: flex; gap: 6px; align-items: center; }
    .wireframe { margin-top: 10px; }
    .wireframe img { max-width: 420px; border: 1px dashed #ddd; border-radius: 8px; }
    button.ghost { border: 1px solid #e6e6e6; background: transparent; }
    button.ghost:hover { background: #f6f6f6; }
  `]
})
export class SlotManagerComponent {
  // Page & Position selectors
  pages: PageKey[] = Object.keys(SITE_SLOTS) as PageKey[];
  page = signal<PageKey>('home');
  posKey = signal<string>(SITE_SLOTS['home'][0].key);

  // Optional advanced mode for custom keys
  advanced = signal(false);
  customKey = signal('');

  // Listing & filters
  slots = signal<SlotDoc[]>([]);
  loading = signal(false);

  // Image picker modal
  pickerOpen = signal(false);
  pickerLoading = signal(false);
  pickerImages = signal<ImageDoc[]>([]);
  pickerFilter = signal('');
  pickerSection = signal<'all' | Section>('all');
  activeSlotKey = signal<string>('');

  constructor(private cms: CmsService, private assets: ImageAssetService) {
    this.refresh();
  }

  // current position definition
  defs = computed(() => SITE_SLOTS[this.page()]);
  currentDef = computed(() => this.defs().find(d => d.key === this.posKey())!);

  // derived full key + label + section
  fullKey = computed(() => this.advanced()
    ? this.customKey().trim().toLowerCase().replace(/\s+/g, '-')
    : `${this.page()}.${this.posKey()}`);

  suggestedLabel = computed(() => this.advanced()
    ? this.customKey() || 'Custom Slot'
    : this.currentDef()?.label || this.fullKey());

  suggestedSection = computed<Section>(() => (this.currentDef()?.section || 'gallery') as Section);

  // Filter slots by current page
  filteredSlots = computed(() => {
    return this.slots().filter(slot => this.byPage(slot));
  });

  // Filter picker images
  pickerFiltered = computed(() => {
    const q = this.pickerFilter().toLowerCase().trim();
    return !q ? this.pickerImages() : this.pickerImages().filter(i => i.name.toLowerCase().includes(q));
  });

  async refresh() {
    this.loading.set(true);
    try {
      // list all and show; you can filter by section if desired
      const all = await this.cms.listSlots(); // we'll filter client-side
      this.slots.set(all.sort((a,b) => a.key.localeCompare(b.key)));
    } finally {
      this.loading.set(false);
    }
  }

  // Create single slot from selectors
  async createSlot() {
    const key = this.fullKey();
    if (!key) return alert('Select a page/position or enter a custom key.');
    await this.cms.upsertSlot({ key, label: this.suggestedLabel(), section: this.suggestedSection() });
    await this.refresh();
  }

  // Seed all predefined slots for the current page (only creates missing ones)
  async createDefaultsForPage() {
    const page = this.page();
    for (const def of SITE_SLOTS[page]) {
      const key = `${page}.${def.key}`;
      const exists = this.slots().some(s => s.key === key);
      if (!exists) {
        await this.cms.upsertSlot({ key, label: def.label, section: def.section });
      }
    }
    await this.refresh();
  }

  byPage(s: SlotDoc) {
    const [p] = s.key.split('.');
    return p === this.page();
  }

  // Basic actions
  async deleteSlot(slot: SlotDoc) {
    if (!confirm(`Delete slot "${slot.key}"?`)) return;
    await this.cms.deleteSlot(slot.key);
    await this.refresh();
  }

  async clearSlot(slot: SlotDoc) {
    if (!confirm(`Clear assignment for "${slot.key}"?`)) return;
    await this.cms.clearSlot(slot.key);
    await this.refresh();
  }

  // Picker
  async openPicker(slot: SlotDoc) {
    this.activeSlotKey.set(slot.key);
    this.pickerOpen.set(true);
    await this.loadPickerImages();
  }

  async loadPickerImages() {
    this.pickerLoading.set(true);
    try {
      const sec = this.pickerSection();
      const imgs = sec === 'all' ? await this.assets.listAll() : await this.assets.list(sec);
      this.pickerImages.set(imgs);
    } finally {
      this.pickerLoading.set(false);
    }
  }

  async assign(img: ImageDoc) {
    await this.cms.assignSlot(this.activeSlotKey(), img);
    this.pickerOpen.set(false);
    await this.refresh();
  }

  // Event handlers for template
  onPageChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.page.set(target.value as PageKey);
    this.posKey.set(this.defs()[0]?.key || 'header');
  }

  onPosKeyChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.posKey.set(target.value);
  }

  onCustomKeyChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.customKey.set(target.value);
  }

  onAdvancedChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.advanced.set(target.checked);
  }

  onPickerSectionChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.pickerSection.set(target.value as any);
    this.loadPickerImages();
  }

  onPickerFilterChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pickerFilter.set(target.value);
  }

  closeModal() {
    this.pickerOpen.set(false);
  }

  getFormattedDate(date: any): string {
    if (!date) return '—';
    try {
      if (date.toDate) {
        return date.toDate().toLocaleDateString();
      }
      return new Date(date).toLocaleDateString();
    } catch {
      return '—';
    }
  }
}
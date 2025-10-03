import { Component, Input, signal, effect, inject } from '@angular/core';
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

  public admin = inject(AdminModeService);
  public cms = inject(CmsService);
  private assets = inject(ImageAssetService);

  constructor() {
    effect(() => { this.load(); }); // loads once; key is static per instance
  }

  async load() {
    if (!this.key) return;
    this.loading.set(true);
    try {
      const result = await this.cms.getSlot(this.key);
      this.slot.set(result);
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
    const success = await this.cms.assignSlot(this.key, img);
    if (success) {
      this.pickerOpen.set(false);
      await this.load();
    }
  }

  async clear() {
    const success = await this.cms.clearSlot(this.key);
    if (success) {
      await this.load();
    }
  }

  onSearchInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.pickerFilter.set(target.value);
  }

  trackImage(index: number, img: ImageDoc): string {
    return img.id || img.name;
  }
}
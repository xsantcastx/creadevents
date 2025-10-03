import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  CdkDragDrop, DragDropModule, moveItemInArray
} from '@angular/cdk/drag-drop';
import { ImageAssetService, ImageDoc, Section } from '../../services/image-asset.service';

@Component({
  selector: 'app-images-dashboard',
  imports: [CommonModule, FormsModule, DragDropModule],
  templateUrl: './images-dashboard.component.html',
  styleUrls: ['./images-dashboard.component.css']
})
export class ImagesDashboardComponent {
  sections: Section[] = ['hero', 'gallery', 'services', 'about', 'footer'];
  section = signal<Section>('gallery');

  // soft limits (optional)
  sectionLimits: Record<Section, number> = {
    hero: 1, gallery: 999, services: 50, about: 20, footer: 10
  };

  uploading = signal(false);
  queue = signal<{ file: File; progress: number }[]>([]);
  images = signal<ImageDoc[]>([]);
  filter = signal('');

  // track dirty states for alt/caption edits
  edited = new Map<string, { alt: string; caption: string; dirty: boolean }>();

  constructor(private svc: ImageAssetService) { this.refresh(); }

  async refresh() {
    this.uploading.set(true);
    try {
      const list = await this.svc.list(this.section());
      this.images.set(list);
      // seed edited map
      this.edited.clear();
      list.forEach(i => this.edited.set(i.id, { alt: i.alt ?? '', caption: i.caption ?? '', dirty: false }));
    } finally {
      this.uploading.set(false);
    }
  }

  onSectionChange(v: string) {
    this.section.set(v as Section);
    this.refresh();
  }

  onDragOver(ev: DragEvent) { ev.preventDefault(); }
  onDropFiles(ev: DragEvent) {
    ev.preventDefault();
    const files = Array.from(ev.dataTransfer?.files ?? []).filter(f => f.type.startsWith('image/'));
    if (files.length) this.enqueue(files);
  }
  onChoose(input: HTMLInputElement) {
    if (!input.files?.length) return;
    const files = Array.from(input.files);
    input.value = '';
    this.enqueue(files);
  }

  private enqueue(files: File[]) {
    const limit = this.sectionLimits[this.section()];
    const spaceLeft = Math.max(0, limit - this.images().length);
    const allowed = limit ? files.slice(0, spaceLeft || limit) : files;
    if (limit && files.length > allowed.length) {
      const ok = confirm(`This section allows ${limit} image(s). Upload only the first ${allowed.length}?`);
      if (!ok) return;
    }
    this.queue.set([...this.queue(), ...allowed.map(f => ({ file: f, progress: 0 }))]);
    this.processQueue();
  }

  private async processQueue() {
    if (this.uploading()) return;
    this.uploading.set(true);
    try {
      for (const item of this.queue()) {
        await this.svc.upload(this.section(), item.file, (p: number) => item.progress = p);
      }
      await this.refresh();
    } finally {
      this.queue.set([]);
      this.uploading.set(false);
    }
  }

  drop(event: CdkDragDrop<ImageDoc[]>) {
    const arr = [...this.images()];
    moveItemInArray(arr, event.previousIndex, event.currentIndex);
    this.images.set(arr);
    this.svc.reorder(arr.map(i => i.id)).catch(console.error);
  }

  meta(id: string) {
    return this.edited.get(id)!;
  }

  markDirty(id: string) {
    const m = this.meta(id);
    m.dirty = true;
  }

  async saveMeta(img: ImageDoc) {
    const m = this.meta(img.id);
    if (!m?.dirty) return;
    await this.svc.updateMeta(img.id, { alt: m.alt, caption: m.caption });
    m.dirty = false;
  }

  async remove(img: ImageDoc) {
    if (!confirm('Delete this image?')) return;
    await this.svc.remove(img);
    // remove from UI
    this.images.set(this.images().filter(i => i.id !== img.id));
    this.edited.delete(img.id);
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
  }

  get filtered(): ImageDoc[] {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.images();
    return this.images().filter(i => i.name.toLowerCase().includes(q));
  }
}
import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Host,
  HostListener,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'ngx-smart-cropper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent implements OnChanges {

  startX = 0;
  startY = 0;

  showGrid = false;
  isDragging = false;
  isResizing = false;

  croppedImageSrc: string | null = null;
  currentHandle: string | null = null;

  @Input() cropX = 50;
  @Input() cropY = 50;
  @Input() cropWidth = 150;
  @Input() cropHeight = 150;
  @Input() minCropSize = 50;
  @Input() imagePreviewWidth = 800;
  @Input() whitePixelThreshold = 20;
  @Input() imageSource: string | null = null;
  @Input() imageChangedEvent: Event | null = null;
  @Input() theme: 'light' | 'dark' | 'mixed' | 'auto' = 'auto';
  @Input() imageType: 'png' | 'jpeg' | 'avif'| 'webp' = 'webp';

  @Output() imageCroppedEvent = new EventEmitter<string>();

  @ViewChild('cropRect') cropRect!: ElementRef;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;

  cropperState: { x: number, y: number, width: number, height: number } = { x: this.cropX, y: this.cropY, width: this.cropWidth, height: this.cropHeight };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageSource'] && this.imageSource && this.theme === 'auto') {
      this.detectWhitePixelsAndSetTheme(this.imageSource!);
    }
  }

  onDragStart(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX - this.cropX;
    this.startY = event.clientY - this.cropY;
  }

  onResizeStart(event: MouseEvent, handle: string): void {
    event.preventDefault();
    this.isResizing = true;
    this.currentHandle = handle;
    this.startX = event.clientX;
    this.startY = event.clientY;
  }

  onTouchDragStart(event: TouchEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.touches[0].clientX - this.cropX;
    this.startY = event.touches[0].clientY - this.cropY;
  }

  onTouchResizeStart(event: TouchEvent, handle: string): void {
    event.preventDefault();
    this.isResizing = true;
    this.currentHandle = handle;
    this.startX = event.touches[0].clientX;
    this.startY = event.touches[0].clientY;
  }

  @HostListener('document:mousemove', ['$event'])
  @HostListener('document:touchmove', ['$event'])
  onMouseMove(event: MouseEvent | TouchEvent): void {

    const clientX = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientX : (event as MouseEvent).clientX;
    const clientY = (event as TouchEvent).touches ? (event as TouchEvent).touches[0].clientY : (event as MouseEvent).clientY;

    if (this.isDragging) {
      this.showGrid = true;
      this.cropX = clientX - this.startX;
      this.cropY = clientY - this.startY;
      this.enforceBounds();
    }
    else if (this.isResizing) {

      this.showGrid = true;
      const dx = clientX - this.startX;
      const dy = clientY - this.startY;

      switch (this.currentHandle) {
        case 'top-left':
          this.cropX += dx;
          this.cropY += dy;
          this.cropWidth -= dx;
          this.cropHeight -= dy;
          break;
        case 'top-middle':
          this.cropY += dy;
          this.cropHeight -= dy;
          break;
        case 'top-right':
          this.cropWidth += dx;
          this.cropY += dy;
          this.cropHeight -= dy;
          break;
        case 'middle-left':
          this.cropX += dx;
          this.cropWidth -= dx;
          break;
        case 'middle-right':
          this.cropWidth += dx;
          break;
        case 'bottom-left':
          this.cropX += dx;
          this.cropWidth -= dx;
          this.cropHeight += dy;
          break;
        case 'bottom-middle':
          this.cropHeight += dy;
          break;
        case 'bottom-right':
          this.cropWidth += dx;
          this.cropHeight += dy;
          break;
      }

      this.startX = clientX;
      this.startY = clientY;
      this.enforceBounds();
    }
  }

  @HostListener('document:mouseup')
  @HostListener('document:touchend')
  onMouseUp(): void {
    this.isDragging = false;
    this.isResizing = false;
    this.currentHandle = null;
    this.showGrid = false;
  }

  enforceBounds(): void {
    const imageBounds = this.imageElement.nativeElement.getBoundingClientRect();
    this.cropWidth = Math.max(this.minCropSize, this.cropWidth);
    this.cropHeight = Math.max(this.minCropSize, this.cropHeight);
    this.cropX = Math.min(Math.max(0, this.cropX), imageBounds.width - this.cropWidth);
    this.cropY = Math.min(Math.max(0, this.cropY), imageBounds.height - this.cropHeight);
    if(this.cropHeight >= imageBounds.height) this.cropHeight = imageBounds.height;
    if(this.cropWidth >= imageBounds.width) this.cropWidth = imageBounds.width;
  }

  setDefaultCropArea() {
    this.cropX = this.cropperState.x;
    this.cropY = this.cropperState.y;
    this.cropWidth = this.cropperState.width;
    this.cropHeight = this.cropperState.height;
  }

  cropImage(): void {
    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = this.imageSource!;
    const scale = image.width / this.imageElement.nativeElement.clientWidth;
    canvas.width = this.cropWidth * scale;
    canvas.height = this.cropHeight * scale;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(
      image,
      this.cropX * scale,
      this.cropY * scale,
      this.cropWidth * scale,
      this.cropHeight * scale,
      0,
      0,
      canvas.width,
      canvas.height
    );
    this.croppedImageSrc = canvas.toDataURL('image/' + this.imageType);
    this.imageCroppedEvent.emit(this.croppedImageSrc);
  }

  clearImage() {
    this.imageSource = '';
    this.croppedImageSrc = '';
    this.setDefaultCropArea();
    this.imageCroppedEvent.emit(this.croppedImageSrc);
  }

  detectWhitePixelsAndSetTheme(imageSrc: string): void {

    const image = new Image();
    image.src = imageSrc;

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let whitePixelCount = 0;
      const totalPixels = imageData.length / 4;
      const threshold = 200;

      for (let i = 0; i < imageData.length; i += 4) {
        const r = imageData[i];
        const g = imageData[i + 1];
        const b = imageData[i + 2];
        if (r > threshold && g > threshold && b > threshold) {
          whitePixelCount++;
        }
      }

      const whitePercentage = (whitePixelCount / totalPixels) * 100;
      this.theme = whitePercentage > this.whitePixelThreshold ? 'dark' : 'light';
    };
  }
}

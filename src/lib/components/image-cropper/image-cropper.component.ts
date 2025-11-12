import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  OnChanges,
  SimpleChanges,
  ViewChild,
  input,
  model,
  output,
  signal,
} from '@angular/core';

@Component({
  selector: 'ngx-smart-cropper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-cropper.component.html',
  styleUrls: ['./image-cropper.component.css']
})
export class ImageCropperComponent implements OnChanges {

  private startX = 0;
  private startY = 0;
  private isDragging = false;
  private isResizing = false;
  private currentHandle: string | null = null;
  private cropperState = signal({ x: 50, y: 50, width: 150, height: 150 });

  showGrid = false;
  croppedImageSrc: string | null = null;
  
  cropX = model(50);
  cropY = model(50);
  cropWidth = model(150);
  cropHeight = model(150);
  imageSource = model<string | null>(null);
  theme = model<'light' | 'dark' | 'mixed' | 'auto'>('auto');
  
  minCropSize = input(50);
  imagePreviewWidth = input(800);
  whitePixelThreshold = input(20);
  aspectRatio = input<number | null>(null);
  imageType = input<'png' | 'jpeg' | 'avif' | 'webp'>('webp');

  imageCroppedEvent = output<string>();
  imageChangedEvent = input<Event | null>(null);

  @ViewChild('cropRect') cropRect!: ElementRef;
  @ViewChild('image') imageElement!: ElementRef<HTMLImageElement>;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['imageSource'] && this.imageSource() && this.theme() === 'auto') {
      this.detectWhitePixelsAndSetTheme(this.imageSource()!);
    }
  }

  onDragStart(event: MouseEvent): void {
    event.preventDefault();
    this.isDragging = true;
    this.startX = event.clientX - this.cropX();
    this.startY = event.clientY - this.cropY();
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
    this.startX = event.touches[0].clientX - this.cropX();
    this.startY = event.touches[0].clientY - this.cropY();
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

    const clientX = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0].clientX
      : (event as MouseEvent).clientX;

    const clientY = (event as TouchEvent).touches
      ? (event as TouchEvent).touches[0].clientY
      : (event as MouseEvent).clientY;

    if (this.isDragging) {
      this.showGrid = true;
      this.cropX.set(clientX - this.startX);
      this.cropY.set(clientY - this.startY);
      this.enforceBounds();
    } 
    else if (this.isResizing) {

      this.showGrid = true;
      const dx = clientX - this.startX;
      const dy = clientY - this.startY;

      switch (this.currentHandle) {
        case 'top-left':
          this.cropX.set(this.cropX() + dx);
          this.cropY.set(this.cropY() + dy);
          this.cropWidth.set(this.cropWidth() - dx);
          this.cropHeight.set(this.cropHeight() - dy);
          break;
        case 'top-middle':
          this.cropY.set(this.cropY() + dy);
          this.cropHeight.set(this.cropHeight() - dy);
          break;
        case 'top-right':
          this.cropWidth.set(this.cropWidth() + dx);
          this.cropY.set(this.cropY() + dy);
          this.cropHeight.set(this.cropHeight() - dy);
          break;
        case 'middle-left':
          this.cropX.set(this.cropX() + dx);
          this.cropWidth.set(this.cropWidth() - dx);
          break;
        case 'middle-right':
          this.cropWidth.set(this.cropWidth() + dx);
          break;
        case 'bottom-left':
          this.cropX.set(this.cropX() + dx);
          this.cropWidth.set(this.cropWidth() - dx);
          this.cropHeight.set(this.cropHeight() + dy);
          break;
        case 'bottom-middle':
          this.cropHeight.set(this.cropHeight() + dy);
          break;
        case 'bottom-right':
          this.cropWidth.set(this.cropWidth() + dx);
          this.cropHeight.set(this.cropHeight() + dy);
          break;
      }

      this.startX = clientX;
      this.startY = clientY;

      if (this.aspectRatio() !== null && this.aspectRatio()! > 0) {
        this.applyAspectRatio();
      }

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

    this.cropWidth.set(Math.max(this.minCropSize(), this.cropWidth()));
    this.cropHeight.set(Math.max(this.minCropSize(), this.cropHeight()));

    if (this.cropWidth() > imageBounds.width) {
      this.cropWidth.set(imageBounds.width);
    }
    if (this.cropHeight() > imageBounds.height) {
      this.cropHeight.set(imageBounds.height);
    }

    this.cropX.set(
      Math.min(Math.max(0, this.cropX()), imageBounds.width - this.cropWidth())
    );
    this.cropY.set(
      Math.min(Math.max(0, this.cropY()), imageBounds.height - this.cropHeight())
    );
  }

  setDefaultCropArea() {
    this.cropX.set(this.cropperState().x);
    this.cropY.set(this.cropperState().y);
    this.cropWidth.set(this.cropperState().width);
    this.cropHeight.set(this.cropperState().height);
  }

  cropImage(): void {

    const canvas = document.createElement('canvas');
    const image = new Image();
    image.src = this.imageSource()!;
    const scale = image.width / this.imageElement.nativeElement.clientWidth;
    canvas.width = this.cropWidth() * scale;
    canvas.height = this.cropHeight() * scale;
    const ctx = canvas.getContext('2d')!;

    ctx.drawImage(
      image,
      this.cropX() * scale,
      this.cropY() * scale,
      this.cropWidth() * scale,
      this.cropHeight() * scale,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    this.croppedImageSrc = canvas.toDataURL('image/' + this.imageType());
    this.imageCroppedEvent.emit(this.croppedImageSrc);
  }

  clearImage() {
    this.imageSource.set('');
    this.croppedImageSrc = '';
    this.setDefaultCropArea();
    this.imageCroppedEvent.emit(this.croppedImageSrc);
  }

  private applyAspectRatio(): void {
    const ratio = this.aspectRatio();
    if (ratio && ratio > 0) {
      const newHeight = this.cropWidth() / ratio;
      this.cropHeight.set(newHeight);
    }
  }

  private detectWhitePixelsAndSetTheme(imageSrc: string): void {

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
      this.theme.set(whitePercentage > this.whitePixelThreshold() ? 'dark' : 'light');
    };
  }
}

# Angular image cropper

The **ngx-smart-cropper** component is an Angular standalone component that allows users to upload, crop, and resize images with ease. It provides intuitive drag-and-resize functionality, grid overlays, and supports various aspect ratios and output formats.

![ngx-smart-cropper](https://upsights.fra1.digitaloceanspaces.com/ngx-smart-cropper/assets/images/michele-ngx-smart-cropper.jpg)

[**Live Demo → ngx-smart-cropper.upsights.be**](https://ngx-smart-cropper.upsights.be)

## Features
- Upload and preview images.
- Intuitive drag-to-crop and resize handles.
- Supports fixed or free aspect ratios via an `aspectRatio` input (available in v1.3.0 and later).
- Emits cropped images as `base64` data.
- Responsive design and easy to integrate.
- Auto theme detection: automatically detects the theme (light or dark) based on the image content.

## Compatibility

The `ngx-smart-cropper` library is compatible with the following versions of Angular:

| `ngx-smart-cropper` Version | Supported Angular Versions |
| --- | --- |
| `1.1.9` | `^19.0.0` |
| `1.2.0` | `^20.0.0` |
| `1.3.0` | `>=19.0.0 <23.0.0` |

> **Note:**  
> The `aspectRatio` input is introduced in version **1.3.0** and is not available in earlier versions.  
> Each library version is compiled for a specific Angular release and is not backwards compatible.

## Installation

### 1. Install via npm

```bash
npm install ngx-smart-cropper --save
```

## Usage

### 1. Import and use the component

```html
<input 
  type="file" 
  accept="image/*" 
  (change)="onFileChange($event)"
>

<ngx-smart-cropper
  [imageType]="'jpeg'"
  [aspectRatio]="1"
  [cropX]="50"
  [cropY]="50"
  [cropWidth]="250"
  [cropHeight]="250"
  [theme]="'mixed'"
  [imageSource]="imageSource"
  (imageCroppedEvent)="imageCropped($event)"
></ngx-smart-cropper>

<img [src]="croppedImage" />
```

### 2. Include the component in your Angular code

```typescript
import { ImageCropperComponent } from 'ngx-smart-cropper';
import { Component } from '@angular/core';

@Component({
  standalone: true,
  imports: [ImageCropperComponent],
  selector: 'my-component',
  templateUrl: './my-component.html'
})
export class MyComponent {
  croppedImage = '';
  imageSource: string | null = null;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) return;

    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = (e: any) => (this.imageSource = e.target.result);
    reader.readAsDataURL(file);
  }

  imageCropped(event: string) {
    this.croppedImage = event;
  }
}
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|----------|-------------|
| `cropX` | `number` | `50` | Initial crop area x-coordinate. |
| `cropY` | `number` | `50` | Initial crop area y-coordinate. |
| `cropWidth` | `number` | `150` | Initial crop width. |
| `cropHeight` | `number` | `150` | Initial crop height. |
| `aspectRatio` | `number` \| `null` | `null` | Fixed aspect ratio (e.g. `1` for 1:1, `16/9` for 16:9). Use `null` for free-form cropping. *(Available in v1.3.0+)* |
| `imageType` | `'png'` \| `'jpeg'` \| `'avif'` \| `'webp'` | `'webp'` | Output file type for cropped image. |
| `theme` | `'light'` \| `'dark'` \| `'mixed'` \| `'auto'` | `'auto'` | Auto-adjusts UI theme between light and dark based on image content. |
| `whitePixelThreshold` | `number` | `20` | Threshold (percentage) for switching between dark and light when `theme = 'auto'`. |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `imageCroppedEvent` | `EventEmitter<string>` | Emits the cropped image as a Base64 string. |

## License
MIT License — see `LICENSE` for details.

## Icons
This project uses free [Tabler Icons](https://tabler.io/icons) for interface elements — modern, customizable SVG icons ideal for any UI.

## Feedback and Contributions
Feel free to open issues or contribute enhancements on [GitHub](https://github.com/kurti-vdb/ngx-smart-cropper).

## Demo
[Live Demo — ngx-smart-cropper.upsights.be](https://ngx-smart-cropper.upsights.be)

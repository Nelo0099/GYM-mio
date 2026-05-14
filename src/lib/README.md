# Lightweight Face Detector

A lightweight, self-contained face detection library for JavaScript that works entirely in the browser without requiring external model downloads.

## Features

- **Zero Dependencies**: No external libraries or model downloads required
- **Real-time Detection**: Processes images instantly in the browser
- **Skin Color Analysis**: Uses advanced color space conversion (RGB → YCbCr)
- **Shape Validation**: Analyzes face proportions and geometry
- **Confidence Scoring**: Provides detection confidence scores
- **Face Descriptors**: Generates 128-dimensional feature vectors

## Algorithm Overview

1. **Skin Detection**: Converts RGB to YCbCr color space and applies skin color thresholds
2. **Region Analysis**: Groups connected skin pixels using flood-fill algorithm
3. **Shape Validation**: Checks aspect ratios, relative sizes, and positional heuristics
4. **Confidence Calculation**: Combines multiple factors for reliable detection
5. **Descriptor Generation**: Creates feature vectors for face recognition

## Usage

```javascript
import { LightweightFaceDetector } from '@/lib/lightweight-face-detector';

// Initialize detector
const detector = new LightweightFaceDetector();

// Detect faces in an image
const faces = await detector.detectFaces(imageElement);

// Results format
[
  {
    box: { x: 100, y: 50, width: 150, height: 180 },
    score: 0.85
  }
]
```

## Performance

- **File Size**: ~15KB minified
- **Processing Speed**: < 100ms per image on modern devices
- **Memory Usage**: Minimal, processes images in-place
- **Compatibility**: Works in all modern browsers

## Limitations

- Optimized for frontal face detection
- Works best with good lighting conditions
- May have reduced accuracy with extreme angles or poor lighting
- Designed for cooperative user scenarios (login/setup)

## Integration

Currently integrated into the Face ID setup system:
- Automatic face detection during photo upload
- Real-time camera capture with visual feedback
- Confidence scoring and user feedback
- Descriptor storage for future recognition
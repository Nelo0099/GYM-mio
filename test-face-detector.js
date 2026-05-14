#!/usr/bin/env node

/**
 * Simple test script for the lightweight face detector
 * Run with: node test-face-detector.js
 */

const { LightweightFaceDetector } = require('./src/lib/lightweight-face-detector.js');

async function testFaceDetector() {
  console.log('Testing Lightweight Face Detector...');

  const detector = new LightweightFaceDetector();

  // Create a mock canvas with some skin-colored pixels
  const canvas = detector.initCanvas(100, 100);
  const ctx = canvas.getContext('2d');

  // Create a simple test pattern with skin-like colors
  const imageData = ctx.createImageData(100, 100);

  // Fill with skin-like colors in a rough face shape
  for (let y = 20; y < 80; y++) {
    for (let x = 20; x < 80; x++) {
      const index = (y * 100 + x) * 4;
      // Skin-like RGB values
      imageData.data[index] = 255;     // R
      imageData.data[index + 1] = 200; // G
      imageData.data[index + 2] = 180; // B
      imageData.data[index + 3] = 255; // A
    }
  }

  ctx.putImageData(imageData, 0, 0);

  try {
    // Test face detection
    const faces = await detector.detectFaces(canvas);

    console.log(`✅ Detection completed. Found ${faces.length} face(s)`);

    faces.forEach((face, index) => {
      console.log(`Face ${index + 1}:`, {
        x: Math.round(face.box.x),
        y: Math.round(face.box.y),
        width: Math.round(face.box.width),
        height: Math.round(face.box.height),
        confidence: Math.round(face.score * 100) + '%'
      });
    });

    if (faces.length > 0) {
      console.log('✅ Face detection is working!');
    } else {
      console.log('⚠️ No faces detected in test pattern');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run test if called directly
if (require.main === module) {
  testFaceDetector();
}

module.exports = { testFaceDetector };
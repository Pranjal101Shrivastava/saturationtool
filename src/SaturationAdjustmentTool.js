import React, { useState, useRef, useEffect, useCallback } from 'react';
import { saveAs } from 'file-saver';

function SaturationAdjustmentTool() {
  const [saturation, setSaturation] = useState(100); // Initial saturation value
  const [imageSrc, setImageSrc] = useState(null);
  const [originalImageData, setOriginalImageData] = useState(null);
  const inputRef = useRef(null);

  const applySaturation = useCallback((newSaturation) => {
    if (!originalImageData) {
      return;
    }

    const factor = newSaturation / 100;

    // Create a copy of the original image data to avoid modifying it directly
    const imageDataCopy = new ImageData(new Uint8ClampedArray(originalImageData.data), originalImageData.width, originalImageData.height);
    const data = imageDataCopy.data;

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const gray = 0.2989 * r + 0.5870 * g + 0.1140 * b;

      data[i] = gray + factor * (r - gray);
      data[i + 1] = gray + factor * (g - gray);
      data[i + 2] = gray + factor * (b - gray);
    }

    // Update the adjusted image source with the new image data
    const canvas = document.createElement('canvas');
    canvas.width = imageDataCopy.width;
    canvas.height = imageDataCopy.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageDataCopy, 0, 0);
    setImageSrc(canvas.toDataURL('image/jpeg'));
  }, [originalImageData]);

  useEffect(() => {
    // Apply the initial saturation adjustment when the component mounts
    if (originalImageData) {
      applySaturation(saturation);
    }
  }, [saturation, applySaturation, originalImageData]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageSrc(event.target.result);
        loadImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadImage = (src) => {
    const img = new Image();
    img.src = src;

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const initialImageData = ctx.getImageData(0, 0, img.width, img.height);
      setOriginalImageData(initialImageData);
    };
  };

  const handleSaturationChange = (e) => {
    const newValue = e.target.value;
    setSaturation(newValue);
  };

  const handleSaveImage = () => {
    saveAs(imageSrc, 'adjusted-image.jpg');
  };

  return (
    <div>
      <h1>Saturation Adjustment Tool</h1>
      <input type="file" accept="image/*" onChange={handleImageUpload} ref={inputRef} />
      <input
        type="range"
        min="0"
        max="200"
        step="1"
        value={saturation}
        onChange={handleSaturationChange}
      />
      <button onClick={handleSaveImage} disabled={!imageSrc}>
        Save Image
      </button>
      <div>
        {imageSrc && <img src={imageSrc} alt="Adjusted" />}
      </div>
    </div>
  );
}

export default SaturationAdjustmentTool;

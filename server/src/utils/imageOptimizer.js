import sharp from 'sharp';
import path from 'path';
import fs from 'fs';

export const optimizeImage = async (file) => {
  const filename = path.parse(file.filename);
  const optimizedFilename = `${filename.name}-optimized${filename.ext}`;
  const outputPath = path.join('uploads/products', optimizedFilename);

  try {
    // Create a sharp instance
    const image = sharp(file.path);

    // Get image metadata
    const metadata = await image.metadata();

    // Calculate new dimensions while maintaining aspect ratio
    let width = metadata.width;
    let height = metadata.height;
    const maxDimension = 1200; // Maximum dimension for either width or height

    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }

    // Resize and optimize the image
    await image
      .resize(width, height, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .jpeg({
        quality: 80,
        progressive: true,
        chromaSubsampling: '4:4:4'
      })
      .toFile(outputPath);

    // Delete the original file
    fs.unlinkSync(file.path);

    return {
      filename: optimizedFilename,
      path: `/uploads/products/${optimizedFilename}`
    };
  } catch (error) {
    console.error('Error optimizing image:', error);
    throw error;
  }
};

export const optimizeMultipleImages = async (files) => {
  const optimizedFiles = await Promise.all(
    files.map(file => optimizeImage(file))
  );
  return optimizedFiles;
}; 
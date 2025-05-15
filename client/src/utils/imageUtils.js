/**
 * Process multiple image files
 * @param {Array} files - Array of File objects
 * @param {Function} setImageFiles - State setter for image files
 * @param {Function} setImagePreviews - State setter for image previews
 * @param {Function} setError - State setter for error message
 */
export const processImageFiles = (files, setImageFiles, setImagePreviews, setError) => {
  const imageFiles = files.filter(file => file.type.match('image.*'));
  
  if (imageFiles.length === 0) {
    setError('Please select image files (PNG, JPG, JPEG, etc.)');
    return;
  }

  const totalSize = imageFiles.reduce((sum, file) => sum + file.size, 0);
  if (totalSize > 16 * 1024 * 1024) {
    setError('Total image size should be less than 16MB');
    return;
  }

  setImageFiles(prevFiles => [...prevFiles, ...imageFiles]);
  
  imageFiles.forEach(file => {
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, 0.7, (compressedDataUrl) => {
        setImagePreviews(prev => [...prev, compressedDataUrl]);
      });
    };
    reader.readAsDataURL(file);
  });
};

/**
 * Compress an image to reduce file size
 * @param {string} dataUrl - The data URL of the image
 * @param {number} quality - Compression quality (0-1)
 * @param {Function} callback - Callback function with compressed image data
 */
export const compressImage = (dataUrl, quality = 0.7, callback) => {
  const img = new Image();
  img.onload = () => {
    const canvas = document.createElement('canvas');
    
    let width = img.width;
    let height = img.height;
    
    const MAX_SIZE = 1600;
    if (width > MAX_SIZE || height > MAX_SIZE) {
      if (width > height) {
        height = Math.round((height * MAX_SIZE) / width);
        width = MAX_SIZE;
      } else {
        width = Math.round((width * MAX_SIZE) / height);
        height = MAX_SIZE;
      }
    }
    
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);
    
    const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
    callback(compressedDataUrl);
  };
  img.src = dataUrl;
};

/**
 * Clear all images from state and reset file input
 * @param {Function} setImageFiles - State setter for image files
 * @param {Function} setImagePreviews - State setter for image previews
 * @param {Object} fileInputRef - Reference to file input element
 */
export const clearAllImages = (setImageFiles, setImagePreviews, fileInputRef) => {
  setImageFiles([]);
  setImagePreviews([]);
  if (fileInputRef.current) {
    fileInputRef.current.value = '';
  }
};

/**
 * Remove a specific image from the previews
 * @param {number} index - Index of the image to remove
 * @param {Function} setImageFiles - State setter for image files
 * @param {Function} setImagePreviews - State setter for image previews
 */
export const removeImage = (index, setImageFiles, setImagePreviews) => {
  setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== index));
};

const imageUtils = {
  processImageFiles,
  compressImage,
  clearAllImages,
  removeImage
};

export default imageUtils;

import React, { useState, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

// Custom renderer for code blocks in Markdown
const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={vscDarkPlus}
      language={match[1]}
      PreTag="div"
      customStyle={{ 
        margin: '1rem 0', 
        borderRadius: '0.375rem' 
      }}
      showLineNumbers={true}
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className ? `${className} bg-gray-800 px-1 rounded` : 'bg-gray-800 px-1 rounded'} {...props}>
      {children}
    </code>
  );
};

const TestCaseGenerator = () => {
  const [formData, setFormData] = useState({
    acceptanceCriteria: '',
    outputType: 'Procedural',
    language: 'English',
    swaggerUrl: ''
  });
  const [inputType, setInputType] = useState('text'); // 'text', 'image', or 'swagger'
  // eslint-disable-next-line no-unused-vars
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const { acceptanceCriteria, outputType, language, swaggerUrl } = formData;

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleInputTypeChange = (type) => {
    setInputType(type);
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const processImageFile = (file) => {
    // Check if file is an image
    if (!file.type.match('image.*')) {
      setError('Please select an image file (PNG, JPG, JPEG, etc.)');
      return;
    }

    // Check file size (max 8MB)
    if (file.size > 8 * 1024 * 1024) {
      setError('Image size should be less than 8MB');
      return;
    }

    setImageFile(file);
    
    // Create image preview with compression
    const reader = new FileReader();
    reader.onloadend = () => {
      compressImage(reader.result, 0.7); // Compress image to 70% quality
    };
    reader.readAsDataURL(file);
  };

  // Function to compress image before sending
  const compressImage = (dataUrl, quality = 0.7) => {
    const img = new Image();
    img.onload = () => {
      // Create canvas for resizing large images
      const canvas = document.createElement('canvas');
      
      // Resize if image is very large
      let width = img.width;
      let height = img.height;
      
      // Maximum dimensions (1600px for either dimension)
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
      
      // Get compressed data URL
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      setImagePreview(compressedDataUrl);
    };
    img.src = dataUrl;
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult('');

    try {
      let requestData = { ...formData };

      if (inputType === 'image' && imagePreview) {
        requestData.imageData = imagePreview;
        requestData.acceptanceCriteria = ''; // Clear text input when sending image
        requestData.swaggerUrl = ''; // Clear swagger URL when sending image
      } else if (inputType === 'swagger') {
        requestData.imageData = ''; // Clear image data when sending swagger URL
        requestData.acceptanceCriteria = ''; // Clear text input when sending swagger URL
      } else {
        // Text input
        requestData.imageData = ''; // Clear image data when sending text
        requestData.swaggerUrl = ''; // Clear swagger URL when sending text
      }

      // Use the full URL to avoid proxy issues
      const res = await axios.post('http://localhost:5000/api/generate-test-cases', requestData);
      setResult(res.data.choices[0].message.content);
    } catch (err) {
      setError(
        err.response?.data?.details || 
        err.response?.data?.error || 
        'Failed to generate test cases. Please try again.'
      );
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSubmitDisabled = () => {
    if (loading) return true;
    if (inputType === 'text') return !acceptanceCriteria;
    if (inputType === 'image') return !imagePreview;
    if (inputType === 'swagger') return !swaggerUrl;
    return true;
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Input Panel - Always on top */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Generate Test Cases</h3>
        
        {/* Input type selector */}
        <div className="flex mb-6 bg-gray-800 p-1 rounded-lg overflow-hidden">
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'text' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('text')}
          >
            Text Input
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'image' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('image')}
          >
            Image Input
          </button>
          <button
            type="button"
            className={`flex-1 py-2 px-3 rounded-md transition-colors ${
              inputType === 'swagger' 
                ? 'bg-gray-700 text-white' 
                : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
            }`}
            onClick={() => handleInputTypeChange('swagger')}
          >
            Swagger API
          </button>
        </div>
        
        <form onSubmit={onSubmit} className="flex flex-col">
          {inputType === 'text' ? (
            <div className="mb-6">
              <label htmlFor="acceptanceCriteria" className="block text-sm font-medium mb-2">
                Acceptance Criteria:
              </label>
              <textarea
                id="acceptanceCriteria"
                name="acceptanceCriteria"
                value={acceptanceCriteria}
                onChange={onChange}
                placeholder="Enter the acceptance criteria here..."
                className="w-full min-h-[200px] max-h-[40vh] bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'text'}
              ></textarea>
              <button
                type="button"
                onClick={() => setFormData({
                  ...formData,
                  acceptanceCriteria: "As a user, I want to be able to reset my password so that I can regain access to my account if I forget my credentials."
                })}
                className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
              >
                Fill with example
              </button>
            </div>
          ) : inputType === 'image' ? (
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Upload Screenshot:
              </label>
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                  isDragging 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : imagePreview 
                      ? 'border-green-500 bg-green-500/10' 
                      : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  ref={fileInputRef}
                />
                
                {imagePreview ? (
                  <div className="relative">
                    <img 
                      src={imagePreview} 
                      alt="Preview" 
                      className="max-h-[300px] mx-auto rounded-lg" 
                    />
                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        clearImage();
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-sm text-gray-400">Drag and drop an image here, or click to select</p>
                    <p className="mt-1 text-xs text-gray-500">(Max file size: 4MB)</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <label htmlFor="swaggerUrl" className="block text-sm font-medium mb-2">
                Swagger/OpenAPI JSON URL:
              </label>
              <input
                id="swaggerUrl"
                name="swaggerUrl"
                type="url"
                value={swaggerUrl}
                onChange={onChange}
                placeholder="Enter the Swagger/OpenAPI JSON URL here..."
                className="w-full bg-gray-800 border border-gray-700 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required={inputType === 'swagger'}
              />
              <p className="mt-2 text-xs text-gray-400">
                Example: https://petstore.swagger.io/v2/swagger.json
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="outputType" className="block text-sm font-medium mb-2">
                Output Format:
              </label>
              <select
                id="outputType"
                name="outputType"
                value={outputType}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="Procedural">Procedural</option>
                <option value="Gherkin">Gherkin</option>
              </select>
            </div>

            <div>
              <label htmlFor="language" className="block text-sm font-medium mb-2">
                Language:
              </label>
              <select
                id="language"
                name="language"
                value={language}
                onChange={onChange}
                className="w-full bg-gray-800 border border-gray-700 py-2 px-3 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="English">English</option>
                <option value="Portuguese">Portuguese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="German">German</option>
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className={`w-full py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors ${
              isSubmitDisabled() ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={isSubmitDisabled()}
          >
            {loading ? 'Generating...' : 'Generate Test Cases'}
          </button>
        </form>
      </div>

      {/* Output Panel - Always below */}
      <div className="bg-gray-900 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-6">Generated Test Cases</h3>
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <div className="animate-pulse">Generating test cases, please wait...</div>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-lg mb-4">
            {error}
          </div>
        )}
        <div className="max-h-[50vh] overflow-auto bg-gray-800 border border-gray-700 p-4 rounded-lg">
          {result && (
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown
                components={{
                  code: CodeBlock,
                  table: ({ node, ...props }) => (
                    <table className="w-full border-collapse my-4" {...props} />
                  ),
                  thead: ({ node, ...props }) => (
                    <thead className="bg-gray-700" {...props} />
                  ),
                  tbody: ({ node, ...props }) => (
                    <tbody {...props} />
                  ),
                  tr: ({ node, ...props }) => (
                    <tr className="border-b border-gray-700 hover:bg-gray-700/50" {...props} />
                  ),
                  th: ({ node, ...props }) => (
                    <th className="p-2 text-left border border-gray-600 font-semibold" {...props} />
                  ),
                  td: ({ node, ...props }) => (
                    <td className="p-2 border border-gray-600" {...props} />
                  )
                }}
              >
                {result}
              </ReactMarkdown>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestCaseGenerator;

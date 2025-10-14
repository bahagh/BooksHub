import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { booksService } from '../../services/booksService';
import ErrorDisplay from '../../components/ErrorDisplay';
import { Book, CreateBookRequest } from '../../types';

interface CreateBookForm {
  title: string;
  content: string;
  description: string;
  author: string;
  genre: string;
  language: string;
  isPublic: boolean;
  status: string;
  tags: string;
}

const COMMON_GENRES = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Thriller',
  'Romance',
  'Historical Fiction',
  'Biography',
  'Self-Help',
  'Business',
  'Technology',
  'Science',
  'History',
  'Philosophy',
  'Poetry',
  'Drama',
  'Horror',
  'Adventure',
  'Classic Fiction',
  'Other'
];

const COMMON_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'ru', name: 'Russian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ar', name: 'Arabic' }
];

export const CreateBookPage: React.FC = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [wordCount, setWordCount] = useState(0);
  
  const [formData, setFormData] = useState<CreateBookForm>({
    title: '',
    content: '',
    description: '',
    author: '',
    genre: '',
    language: 'en',
    isPublic: true,
    status: '2', // Published
    tags: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CreateBookForm, string>>>({});

  // Calculate word count when content changes
  const calculateWordCount = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: undefined }));

    // Update word count if content changed
    if (name === 'content') {
      setWordCount(calculateWordCount(value));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateBookForm, string>> = {};

    // Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.length < 1 || formData.title.length > 500) {
      newErrors.title = 'Title must be between 1 and 500 characters';
    }

    // Content validation
    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.length < 10) {
      newErrors.content = 'Content must be at least 10 characters';
    } else if (formData.content.length > 1000000) {
      newErrors.content = 'Content must not exceed 1,000,000 characters';
    }

    // Description validation
    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must not exceed 1,000 characters';
    }

    // Author validation
    if (formData.author && formData.author.length > 100) {
      newErrors.author = 'Author must not exceed 100 characters';
    }

    // Genre validation
    if (formData.genre && formData.genre.length > 50) {
      newErrors.genre = 'Genre must not exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert tags string to array
      const tagsArray = formData.tags
        ? formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
        : [];

      const bookData = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        description: formData.description.trim() || undefined,
        author: formData.author.trim() || undefined,
        genre: formData.genre.trim() || undefined,
        language: formData.language,
        isPublic: formData.isPublic,
        status: parseInt(formData.status), // Convert to number (0=Draft, 1=InReview, 2=Published, 3=Archived)
        tags: tagsArray.length > 0 ? tagsArray : undefined
      };

      const createdBook = await booksService.createBook(bookData);
      
      // Navigate to the book details page
      navigate(`/books/${createdBook.id}`);
    } catch (err: any) {
      console.error('Create book error:', err);
      setError(err.message || 'Failed to create book. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (formData.title || formData.content || formData.description) {
      if (window.confirm('Are you sure you want to discard this book?')) {
        navigate('/books');
      }
    } else {
      navigate('/books');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Create New Book</h1>
        <p className="mt-2 text-gray-600">
          Share your story with the world
        </p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorDisplay 
            error={{ message: error, type: 'VALIDATION_ERROR' }} 
            onDismiss={() => setError(null)}
            variant="inline"
          />
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter book title"
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
          <p className="mt-1 text-xs text-gray-500">{formData.title.length}/500 characters</p>
        </div>

        {/* Author */}
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            Author
          </label>
          <input
            type="text"
            id="author"
            name="author"
            value={formData.author}
            onChange={handleInputChange}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.author ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Author name"
            maxLength={100}
            disabled={isSubmitting}
          />
          {errors.author && <p className="mt-1 text-sm text-red-500">{errors.author}</p>}
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.description ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Brief description of your book"
            maxLength={1000}
            disabled={isSubmitting}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
          <p className="mt-1 text-xs text-gray-500">{formData.description.length}/1,000 characters</p>
        </div>

        {/* Content */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleInputChange}
            rows={15}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm ${
              errors.content ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Write your book content here..."
            disabled={isSubmitting}
          />
          {errors.content && <p className="mt-1 text-sm text-red-500">{errors.content}</p>}
          <div className="mt-1 flex justify-between text-xs text-gray-500">
            <span>{wordCount.toLocaleString()} words</span>
            <span>{formData.content.length.toLocaleString()}/1,000,000 characters</span>
          </div>
        </div>

        {/* Genre and Language Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Genre */}
          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              id="genre"
              name="genre"
              value={formData.genre}
              onChange={handleInputChange}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.genre ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
            >
              <option value="">Select a genre</option>
              {COMMON_GENRES.map(genre => (
                <option key={genre} value={genre}>{genre}</option>
              ))}
            </select>
            {errors.genre && <p className="mt-1 text-sm text-red-500">{errors.genre}</p>}
          </div>

          {/* Language */}
          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
              Language
            </label>
            <select
              id="language"
              name="language"
              value={formData.language}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isSubmitting}
            >
              {COMMON_LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>{lang.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
            Tags
          </label>
          <input
            type="text"
            id="tags"
            name="tags"
            value={formData.tags}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter tags separated by commas (e.g., fiction, adventure, mystery)"
            disabled={isSubmitting}
          />
          <p className="mt-1 text-xs text-gray-500">Separate multiple tags with commas</p>
        </div>

        {/* Public Toggle */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isPublic"
            name="isPublic"
            checked={formData.isPublic}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            disabled={isSubmitting}
          />
          <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-700">
            Make this book public (visible to all users)
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-4 border-t">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </span>
            ) : (
              'Create Book'
            )}
          </button>
        </div>
      </form>

      {/* Help Text */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Tips for creating a great book:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Choose a clear, descriptive title that captures the essence of your book</li>
          <li>Write a compelling description to help readers understand what your book is about</li>
          <li>Add relevant tags to make your book easier to discover</li>
          <li>Proofread your content before publishing</li>
          <li>Set the book to public when you're ready to share it with others</li>
        </ul>
      </div>
    </div>
  );
};

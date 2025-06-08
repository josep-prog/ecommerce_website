import React from 'react';
import { X } from 'lucide-react';

interface FilterState {
  category: string;
  priceRange: number[];
  sizes: string[];
  colors: string[];
  inStock: boolean;
}

interface ProductFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({ filters, setFilters }) => {
  const categories = [
    'T-Shirts',
    'Shirts',
    'Pants',
    'Dresses',
    'Shoes',
    'Accessories'
  ];

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handlePriceChange = (index: number, value: string) => {
    const newPriceRange = [...filters.priceRange];
    newPriceRange[index] = Number(value);
    setFilters(prev => ({ ...prev, priceRange: newPriceRange }));
  };

  const handleSizeToggle = (size: string) => {
    setFilters(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size]
    }));
  };

  const handleColorToggle = (color: string) => {
    setFilters(prev => ({
      ...prev,
      colors: prev.colors.includes(color)
        ? prev.colors.filter(c => c !== color)
        : [...prev.colors, color]
    }));
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      priceRange: [0, 200],
      sizes: [],
      colors: [],
      inStock: false
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Filters
        </h2>
        <button
          onClick={clearFilters}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          Clear all
        </button>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Category
        </h3>
        <div className="space-y-2">
          {categories.map((category) => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                checked={filters.category === category}
                onChange={() => setFilters(prev => ({ ...prev, category }))}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                {category}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Price Range
        </h3>
        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={filters.priceRange[0]}
            onChange={(e) => handlePriceChange(0, e.target.value)}
            className="w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="0"
          />
          <span className="text-gray-500">to</span>
          <input
            type="number"
            value={filters.priceRange[1]}
            onChange={(e) => handlePriceChange(1, e.target.value)}
            className="w-24 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
            min="0"
          />
        </div>
      </div>

      {/* Size Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Size
        </h3>
        <div className="flex flex-wrap gap-2">
          {sizes.map((size) => (
            <button
              key={size}
              onClick={() => handleSizeToggle(size)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.sizes.includes(size)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* Color Filter */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          Color
        </h3>
        <div className="flex flex-wrap gap-2">
          {['White', 'Black', 'Blue', 'Red', 'Green', 'Yellow'].map((color) => (
            <button
              key={color}
              onClick={() => handleColorToggle(color)}
              className={`px-3 py-1 rounded-full text-sm ${
                filters.colors.includes(color)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Filter */}
      <div className="mb-6">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={(e) => setFilters(prev => ({ ...prev, inStock: e.target.checked }))}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
          />
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            In Stock Only
          </span>
        </label>
      </div>
    </div>
  );
};

export default ProductFilters;
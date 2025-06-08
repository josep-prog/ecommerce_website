import React from 'react';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/currency';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  discount: number;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: number;
  status: string;
}

interface ProductCardProps {
  product: Product;
  viewMode: 'grid' | 'list';
}

const ProductCard: React.FC<ProductCardProps> = ({ product, viewMode }) => {
  const isOutOfStock = product.stock === 0;
  const discountPrice = product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price;

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden ${
      viewMode === 'list' ? 'flex' : ''
    }`}>
      {/* Product Image */}
      <div className={`relative ${viewMode === 'list' ? 'w-1/3' : ''}`}>
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full object-cover ${
            viewMode === 'list' ? 'h-full' : 'h-48'
          }`}
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-bold text-lg">Out of Stock</span>
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 rounded-full bg-white dark:bg-gray-700 shadow-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
          <Heart className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Product Info */}
      <div className={`p-4 ${viewMode === 'list' ? 'w-2/3' : ''}`}>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          {product.name}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(discountPrice)}
            </span>
            {product.discount > 0 && (
              <>
                <span className="ml-2 text-sm text-gray-500 line-through">
                  {formatCurrency(product.price)}
                </span>
                <span className="ml-2 text-sm text-green-600">
                  {product.discount}% OFF
                </span>
              </>
            )}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            {product.stock} in stock
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {product.colors.map((color) => (
            <span
              key={color}
              className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {color}
            </span>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          {product.sizes.map((size) => (
            <span
              key={size}
              className="px-2 py-1 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              {size}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
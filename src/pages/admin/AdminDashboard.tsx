import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart3, 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Plus,
  X
} from 'lucide-react';
import { formatCurrency } from '../../utils/currency';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { toast } from 'react-hot-toast';
import axios, { AxiosError } from 'axios';
import ImageUpload from '../../components/admin/ImageUpload';

// Update the Product interface to match the API response
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

interface ProductFormData {
  name: string;
  description: string;
  price: string;
  discount: string;
  category: string;
  images: string[];
  colors: string[];
  sizes: string[];
  stock: string;
  status: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: '',
    discount: '0',
    category: '',
    images: [],
    colors: [],
    sizes: [],
    stock: '',
    status: 'Active'
  });

  const queryClient = useQueryClient();

  // Stats data
  const stats = [
    {
      title: 'Total Revenue',
      value: formatCurrency(45231000),
      change: '+12.5%',
      icon: DollarSign,
      color: 'bg-green-500'
    },
    {
      title: 'Total Orders',
      value: '1,234',
      change: '+8.2%',
      icon: ShoppingCart,
      color: 'bg-blue-500'
    },
    {
      title: 'Total Products',
      value: '567',
      change: '+3.1%',
      icon: Package,
      color: 'bg-purple-500'
    },
    {
      title: 'Total Users',
      value: '8,901',
      change: '+15.3%',
      icon: Users,
      color: 'bg-orange-500'
    }
  ];

  const recentOrders = [
    {
      id: 'ORD-001',
      customer: 'John Doe',
      product: 'Premium T-Shirt',
      amount: formatCurrency(29999),
      status: 'Completed',
      date: '2024-01-15'
    },
    {
      id: 'ORD-002',
      customer: 'Jane Smith',
      product: 'Designer Sneakers',
      amount: formatCurrency(129999),
      status: 'Processing',
      date: '2024-01-14'
    },
    {
      id: 'ORD-003',
      customer: 'Mike Johnson',
      product: 'Casual Jacket',
      amount: formatCurrency(69999),
      status: 'Shipped',
      date: '2024-01-13'
    }
  ];

  // Fetch products
  const { data: products = [], isLoading: isLoadingProducts, error: productsError } = useQuery<Product[]>('products', async () => {
    try {
      const response = await axios.get('/api/products');
      // Ensure we always return an array
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      console.error('Error fetching products:', error);
      return [];
    }
  }, {
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Add product mutation
  const addProductMutation = useMutation<Product, AxiosError, ProductFormData>(
    async (formData) => {
      console.log('Sending product data:', formData);
      const productData = {
        ...formData,
        price: Number(formData.price),
        discount: Number(formData.discount),
        stock: Number(formData.stock),
        status: formData.status
      };
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/products`, productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('products');
        toast.success('Product added successfully');
        console.log('Product added successfully!', data);
      },
      onError: (error: AxiosError) => {
        toast.error(error.message || 'Error adding product');
        console.error('Error adding product:', error.response?.data || error.message);
      }
    }
  );

  // Update product mutation
  const updateProductMutation = useMutation<Product, AxiosError, { id: string; product: ProductFormData }>(
    async ({ id, product }) => {
      const productData = {
        ...product,
        price: Number(product.price),
        discount: Number(product.discount),
        stock: Number(product.stock),
        status: product.status
      };
      const response = await axios.put(`${import.meta.env.VITE_API_URL}/api/products/${id}`, productData, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        withCredentials: true
      });
      return response.data;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('products');
        toast.success('Product updated successfully');
        console.log('Product updated successfully!', data);
      },
      onError: (error: AxiosError) => {
        toast.error(error.message || 'Error updating product');
        console.error('Error updating product:', error.response?.data || error.message);
      }
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation<void, Error, string>(
    async (id) => {
      const response = await axios.delete(`/api/products/${id}`);
      return response.data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('products');
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        toast.error(error.message || 'Error deleting product');
      }
    }
  );

  const handleProductInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement> | 
    { target: { name: string; value: string[] } }
  ) => {
    const { name, value } = e.target;
    setProductForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProductSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('handleProductSubmit called');
    console.log('Current product form state:', productForm);

    if (editingProduct) {
      console.log('Attempting to update product with data:', productForm);
      await updateProductMutation.mutateAsync({
        id: editingProduct._id,
        product: productForm
      });
    } else {
      console.log('Attempting to add new product with data:', productForm);
      await addProductMutation.mutateAsync(productForm);
    }

    setShowAddProductModal(false);
    setEditingProduct(null);
    setProductForm({
      name: '',
      description: '',
      price: '',
      discount: '0',
      category: '',
      images: [],
      colors: [],
      sizes: [],
      stock: '',
      status: 'Active'
    });
  };

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount.toString(),
      category: product.category,
      images: product.images,
      colors: product.colors,
      sizes: product.sizes,
      stock: product.stock.toString(),
      status: product.status
    });
    setShowAddProductModal(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await deleteProductMutation.mutateAsync(id);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Shipped':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'Out of Stock':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  // Add error handling for the products table
  const renderProductsTable = () => {
    if (isLoadingProducts) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center">
            Loading...
          </td>
        </tr>
      );
    }

    if (productsError) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center text-red-600">
            Error loading products. Please try again later.
          </td>
        </tr>
      );
    }

    if (!Array.isArray(products) || products.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-4 text-center">
            No products found
          </td>
        </tr>
      );
    }

    return products.map((product) => (
      <tr key={product._id}>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div className="h-10 w-10 flex-shrink-0">
              <img
                className="h-10 w-10 rounded-full object-cover"
                src={product.images[0]?.startsWith('http') ? product.images[0] : `${import.meta.env.VITE_API_URL}${product.images[0]}`}
                alt={product.name}
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image';
                }}
              />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-900 dark:text-white">
                {product.name}
              </div>
            </div>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {product.category}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {formatCurrency(product.price)}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm text-gray-900 dark:text-white">
            {product.stock}
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(product.status)}`}>
            {product.status}
          </span>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <button
            onClick={() => handleEditProduct(product)}
            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
          >
            <Edit className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleDeleteProduct(product._id)}
            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </td>
      </tr>
    ));
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your e-commerce platform
          </p>
        </motion.div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'orders', label: 'Orders' },
              { id: 'products', label: 'Products' },
              { id: 'users', label: 'Users' },
              { id: 'analytics', label: 'Analytics' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {stat.value}
                      </p>
                      <p className="text-sm text-green-600 dark:text-green-400">
                        {stat.change}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-full`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Recent Orders
                </h2>
                <button className="text-blue-600 dark:text-blue-400 hover:underline">
                  View All
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Order ID
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Product
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Amount
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 dark:border-gray-700">
                        <td className="py-3 px-4 text-gray-900 dark:text-white">
                          {order.id}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {order.customer}
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {order.product}
                        </td>
                        <td className="py-3 px-4 text-gray-900 dark:text-white font-medium">
                          {order.amount}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-600 dark:text-gray-400">
                          {order.date}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        )}

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Button */}
            <div className="flex justify-end">
              <button
                onClick={() => setShowAddProductModal(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Product
              </button>
            </div>

            {/* Products Table */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Product
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Price
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Stock
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {renderProductsTable()}
                </tbody>
              </table>
              </div>
            </div>

            {/* Add/Edit Product Modal */}
            {showAddProductModal && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl relative flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {editingProduct ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                      onClick={() => setShowAddProductModal(false)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="flex-grow overflow-y-auto pr-2">
                    <form onSubmit={handleProductSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={productForm.name}
                          onChange={handleProductInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Description
                        </label>
                        <textarea
                          name="description"
                          value={productForm.description}
                          onChange={handleProductInputChange}
                          rows={3}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Price
                          </label>
                          <input
                            type="number"
                            name="price"
                            value={productForm.price}
                            onChange={handleProductInputChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Discount (%)
                          </label>
                          <input
                            type="number"
                            name="discount"
                            value={productForm.discount}
                            onChange={handleProductInputChange}
                            min="0"
                            max="100"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Category
                        </label>
                        <select
                          name="category"
                          value={productForm.category}
                          onChange={handleProductInputChange}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        >
                          <option value="">Select a category</option>
                          <option value="T-Shirts">T-Shirts</option>
                          <option value="Shirts">Shirts</option>
                          <option value="Pants">Pants</option>
                          <option value="Dresses">Dresses</option>
                          <option value="Shoes">Shoes</option>
                          <option value="Accessories">Accessories</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Stock
                        </label>
                        <input
                          type="number"
                          name="stock"
                          value={productForm.stock}
                          onChange={handleProductInputChange}
                          min="0"
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Colors (comma-separated)
                        </label>
                        <input
                          type="text"
                          name="colors"
                          value={productForm.colors.join(', ')}
                          onChange={(e) => handleProductInputChange({
                            target: {
                              name: 'colors',
                              value: e.target.value.split(',').map(color => color.trim()).filter(Boolean)
                            }
                          })}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Sizes
                        </label>
                        <div className="mt-2 space-x-4">
                          {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                            <label key={size} className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={productForm.sizes.includes(size)}
                                onChange={(e) => {
                                  const newSizes = e.target.checked
                                    ? [...productForm.sizes, size]
                                    : productForm.sizes.filter(s => s !== size);
                                  handleProductInputChange({
                                    target: {
                                      name: 'sizes',
                                      value: newSizes
                                    }
                                  });
                                }}
                                className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600"
                              />
                              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">{size}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                          Product Images
                        </label>
                        <div className="mt-2">
                          <ImageUpload
                            onImagesUploaded={(images) => setProductForm(prev => ({ ...prev, images }))}
                            maxFiles={5}
                            existingImages={productForm.images}
                          />
                        </div>
                      </div>
                    </form>
                  </div>
                  <div className="flex justify-end space-x-4 pt-4 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddProductModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                      disabled={addProductMutation.isLoading || updateProductMutation.isLoading}
                    >
                      {addProductMutation.isLoading || updateProductMutation.isLoading ? 'Processing...' : (editingProduct ? 'Update Product' : 'Add Product')}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Other tabs content can be added here */}
        {activeTab === 'orders' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Orders Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Orders management interface will be implemented here.
            </p>
          </motion.div>
        )}

        {activeTab === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Users Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Users management interface will be implemented here.
            </p>
          </motion.div>
        )}

        {activeTab === 'analytics' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
              Analytics Dashboard
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Analytics and reporting interface will be implemented here.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
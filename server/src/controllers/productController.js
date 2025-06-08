import Product from '../models/Product.js';

// Get all products (admin view)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      images,
      colors,
      sizes,
      stock
    } = req.body;

    const product = new Product({
      name,
      description,
      price,
      discount,
      category,
      images,
      colors,
      sizes,
      stock
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discount,
      category,
      images,
      colors,
      sizes,
      stock,
      status
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Update fields
    product.name = name || product.name;
    product.description = description || product.description;
    product.price = price || product.price;
    product.discount = discount !== undefined ? discount : product.discount;
    product.category = category || product.category;
    product.images = images || product.images;
    product.colors = colors || product.colors;
    product.sizes = sizes || product.sizes;
    product.stock = stock || product.stock;
    product.status = status || product.status;

    await product.save();
    res.status(200).json(product);
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete product
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.deleteOne();
    res.status(200).json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single product
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.status(200).json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({ message: 'Server error' });
  }
}; 
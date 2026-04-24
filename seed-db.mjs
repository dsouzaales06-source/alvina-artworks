import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function seedDatabase() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);

  try {
    // Insert categories
    const categories = [
      { name: 'Candles', slug: 'candles', description: 'Handcrafted artisanal candles with premium scents and natural ingredients' },
      { name: 'Wedding Decorations', slug: 'wedding-decorations', description: 'Elegant decorations to make your wedding day unforgettable' },
      { name: 'Catholic Church Decorations', slug: 'catholic-church-decorations', description: 'Sacred and beautiful decorations for Catholic ceremonies and celebrations' },
    ];

    for (const category of categories) {
      await connection.execute(
        'INSERT IGNORE INTO categories (name, slug, description) VALUES (?, ?, ?)',
        [category.name, category.slug, category.description]
      );
    }

    console.log('✓ Categories seeded successfully');

    // Insert sample products
    const products = [
      {
        name: 'Lavender Dream Candle',
        slug: 'lavender-dream-candle',
        description: 'A soothing lavender-scented candle handpoured with premium soy wax. Perfect for relaxation and meditation.',
        price: '24.99',
        categoryId: 1,
        sku: 'CANDLE-LAV-001',
        stock: 15,
      },
      {
        name: 'Rose Garden Candle',
        slug: 'rose-garden-candle',
        description: 'Delicate rose fragrance in a hand-poured candle. Brings elegance and romance to any space.',
        price: '26.99',
        categoryId: 1,
        sku: 'CANDLE-ROSE-001',
        stock: 12,
      },
      {
        name: 'Vanilla Bliss Candle',
        slug: 'vanilla-bliss-candle',
        description: 'Warm vanilla scent with hints of cinnamon. A timeless classic that fills your home with comfort.',
        price: '22.99',
        categoryId: 1,
        sku: 'CANDLE-VAN-001',
        stock: 18,
      },
      {
        name: 'Wedding Arch Decoration Set',
        slug: 'wedding-arch-decoration-set',
        description: 'Complete set for decorating your wedding arch. Includes elegant fabric draping and floral accents.',
        price: '89.99',
        categoryId: 2,
        sku: 'WEDDING-ARCH-001',
        stock: 5,
      },
      {
        name: 'Table Centerpiece Collection',
        slug: 'table-centerpiece-collection',
        description: 'Handcrafted table centerpieces with flowers, candles, and elegant accents. Perfect for receptions.',
        price: '45.99',
        categoryId: 2,
        sku: 'WEDDING-CENTER-001',
        stock: 8,
      },
      {
        name: 'Church Altar Candle Set',
        slug: 'church-altar-candle-set',
        description: 'Traditional altar candles for Catholic ceremonies. Made with pure beeswax for a sacred atmosphere.',
        price: '34.99',
        categoryId: 3,
        sku: 'CHURCH-ALTAR-001',
        stock: 20,
      },
      {
        name: 'Processional Banner',
        slug: 'processional-banner',
        description: 'Beautiful handcrafted banner for church processions. Features religious symbols and elegant design.',
        price: '79.99',
        categoryId: 3,
        sku: 'CHURCH-BANNER-001',
        stock: 3,
      },
      {
        name: 'Nativity Scene Decoration',
        slug: 'nativity-scene-decoration',
        description: 'Handcrafted nativity scene for Christmas celebrations. Detailed and beautifully designed.',
        price: '99.99',
        categoryId: 3,
        sku: 'CHURCH-NATIVITY-001',
        stock: 2,
      },
    ];

    for (const product of products) {
      await connection.execute(
        'INSERT IGNORE INTO products (name, slug, description, price, categoryId, sku, stock, isActive) VALUES (?, ?, ?, ?, ?, ?, ?, true)',
        [product.name, product.slug, product.description, product.price, product.categoryId, product.sku, product.stock]
      );
    }

    console.log('✓ Products seeded successfully');
    console.log('✓ Database seeding complete!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await connection.end();
  }
}

seedDatabase();

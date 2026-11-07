/**
 * Default Brew Haven menu used to seed an empty database.
 * Prices are in Maloti (M).
 */

const image = (prompt, size = 'square') =>
  `https://coresg-normal.trae.ai/api/ide/v1/tool_text_to_image?prompt=${encodeURIComponent(
    prompt
  )}&image_size=${size}`;

const timestamp = () => new Date().toISOString();

export const seedMenu = [
  {
    id: 'menu-espresso',
    name: 'Classic Espresso',
    category: 'Coffee',
    description: 'A rich, bold single-origin espresso with a smooth crema finish.',
    price: 25,
    available: true,
    image: image('top down photo of a classic espresso in a small white cup on dark wooden table, professional food photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-caramel-latte',
    name: 'Caramel Latte',
    category: 'Coffee',
    description: 'Velvety steamed milk, double espresso and buttery caramel drizzle.',
    price: 40,
    available: true,
    image: image('caramel latte in a glass cup with latte art and caramel drizzle, professional cafe photography, warm lighting'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-cappuccino',
    name: 'Cappuccino',
    category: 'Coffee',
    description: 'Espresso crowned with a thick layer of airy steamed milk foam.',
    price: 35,
    available: true,
    image: image('cappuccino with cocoa dusting and dense milk foam in a ceramic cup, professional cafe photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-flat-white',
    name: 'Flat White',
    category: 'Coffee',
    description: 'Double ristretto with silky microfoam for a smooth, strong cup.',
    price: 38,
    available: true,
    image: image('flat white coffee with rosetta latte art in a white cup on saucer, professional cafe photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-rooibos',
    name: 'Rooibos Tea',
    category: 'Tea',
    description: 'Naturally caffeine-free red bush tea, served with honey on request.',
    price: 22,
    available: true,
    image: image('rooibos red bush tea in a clear glass teapot with a cup, warm natural light, professional photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-green-tea',
    name: 'Green Tea',
    category: 'Tea',
    description: 'Delicate loose-leaf green tea with a fresh, grassy aroma.',
    price: 24,
    available: true,
    image: image('green tea in a small ceramic cup with loose tea leaves beside it, minimal styling, professional photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-chai-latte',
    name: 'Chai Latte',
    category: 'Tea',
    description: 'Spiced black tea blended with steamed milk and warm cinnamon.',
    price: 34,
    available: true,
    image: image('chai latte in a glass mug topped with cinnamon dust, cozy cafe setting, professional photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-butter-croissant',
    name: 'Butter Croissant',
    category: 'Pastries',
    description: 'Flaky, golden layers baked fresh every morning with real butter.',
    price: 28,
    available: true,
    image: image('golden flaky butter croissant on a rustic wooden board, bakery photography, warm light'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-chocolate-croissant',
    name: 'Chocolate Croissant',
    category: 'Pastries',
    description: 'Buttery croissant filled with rich dark chocolate.',
    price: 30,
    available: true,
    image: image('chocolate filled croissant on a plate with cocoa dusting, artisan bakery photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-blueberry-muffin',
    name: 'Blueberry Muffin',
    category: 'Pastries',
    description: 'Soft vanilla muffin bursting with juicy blueberries.',
    price: 26,
    available: true,
    image: image('blueberry muffin with a golden crumb topping on parchment paper, bakery photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-iced-coffee',
    name: 'Iced Coffee',
    category: 'Cold Drinks',
    description: 'Slow-brewed coffee poured over ice with a splash of milk.',
    price: 38,
    available: true,
    image: image('iced coffee in a tall glass with ice cubes and milk swirl, condensation droplets, professional photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-iced-caramel',
    name: 'Iced Caramel Latte',
    category: 'Cold Drinks',
    description: 'Chilled espresso, cold milk and caramel served over ice.',
    price: 42,
    available: true,
    image: image('iced caramel latte in a tall glass with layered milk and espresso, caramel drizzle, professional photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-brownie',
    name: 'Chocolate Brownie',
    category: 'Desserts',
    description: 'Fudgy dark chocolate brownie with a crisp crackled top.',
    price: 32,
    available: true,
    image: image('fudgy chocolate brownie square on a dark plate, dessert photography, shallow depth of field'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  },
  {
    id: 'menu-cheesecake',
    name: 'Cheesecake Slice',
    category: 'Desserts',
    description: 'Creamy baked cheesecake on a buttery biscuit base.',
    price: 36,
    available: true,
    image: image('slice of creamy baked cheesecake with berry garnish on a ceramic plate, dessert photography'),
    createdAt: timestamp(),
    updatedAt: timestamp()
  }
];

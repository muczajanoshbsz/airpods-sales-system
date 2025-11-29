import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);

// Alap adatok inicializálása
export const initializeDatabase = async () => {
  // Ellenőrizzük, hogy léteznek-e a táblák
  const { data: sales, error: salesError } = await supabase
    .from('sales')
    .select('*')
    .limit(1);

  const { data: products, error: productsError } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  // Ha nincsenek termékek, adjunk hozzá alapértelmezetteket
  if (!products || products.length === 0) {
    const defaultProducts = [
      {
        name: 'AirPods 2. generáció',
        model: 'AirPods 2',
        purchase_price: 45000,
        stock_quantity: 10
      },
      {
        name: 'AirPods 3. generáció',
        model: 'AirPods 3',
        purchase_price: 60000,
        stock_quantity: 8
      },
      {
        name: 'AirPods Pro 2. generáció',
        model: 'AirPods Pro 2',
        purchase_price: 80000,
        stock_quantity: 5
      }
    ];

    for (const product of defaultProducts) {
      await supabase
        .from('products')
        .insert([product]);
    }
  }
};
import { createClient } from '@supabase/supabase-js';

// Debug információk
console.log('🔌 Supabase inicializálás...');
console.log('Supabase URL jelenlét:', !!process.env.REACT_APP_SUPABASE_URL);
console.log('Supabase Key jelenlét:', !!process.env.REACT_APP_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Ellenőrizzük, hogy vannak-e environment változók
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ HIBA: Hiányzó Supabase environment változók!');
  console.error('REACT_APP_SUPABASE_URL:', supabaseUrl);
  console.error('REACT_APP_SUPABASE_ANON_KEY:', supabaseKey?.substring(0, 20) + '...');
} else {
  console.log('✅ Supabase environment változók rendben');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Auth state change listener
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Auth státusz változás:', event, session?.user?.email);
});

// Teszteljük a kapcsolatot
export const testConnection = async () => {
  try {
    console.log('🔌 Supabase kapcsolat tesztelése...');
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    if (error) {
      console.error('❌ Supabase hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      return false;
    }

    console.log('✅ Supabase kapcsolat sikeres!');
    console.log('📊 Termékek száma:', data?.length || 0);
    return true;
  } catch (error) {
    console.error('❌ Kapcsolati hiba:', error);
    return false;
  }
};

// Termék hozzáadása
export const addProduct = async (productData) => {
  try {
    console.log('➕ Termék hozzáadása:', productData);

    const productToInsert = {
      name: productData.name.trim(),
      model: productData.model.trim(),
      purchase_price: parseInt(productData.purchase_price) || 0,
      stock_quantity: parseInt(productData.stock_quantity) || 0,
      created_at: new Date().toISOString()
    };

    console.log('📤 Küldött adatok:', productToInsert);

    const { data, error } = await supabase
      .from('products')
      .insert([productToInsert])
      .select();

    if (error) {
      console.error('❌ Termék hozzáadási hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Termék sikeresen hozzáadva:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('❌ Termék hozzáadás sikertelen:', error);
    return { 
      success: false, 
      error: error.message || 'Ismeretlen hiba történt' 
    };
  }
};

// Eladás hozzáadása
export const addSale = async (saleData) => {
  try {
    console.log('🛒 Eladás hozzáadása:', saleData);

    const saleToInsert = {
      product_id: parseInt(saleData.product_id),
      sale_date: saleData.sale_date,
      quantity: parseInt(saleData.quantity),
      sale_price: parseInt(saleData.sale_price),
      platform: saleData.platform,
      cost_price: parseInt(saleData.cost_price),
      created_at: new Date().toISOString()
    };

    console.log('📤 Küldött eladás adatok:', saleToInsert);

    const { data, error } = await supabase
      .from('sales')
      .insert([saleToInsert])
      .select();

    if (error) {
      console.error('❌ Eladás hozzáadási hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Eladás sikeresen hozzáadva:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('❌ Eladás hozzáadás sikertelen:', error);
    return { 
      success: false, 
      error: error.message || 'Ismeretlen hiba történt' 
    };
  }
};

// Készlet frissítése létező termékhez
export const updateProductStock = async (productId, newQuantity) => {
  try {
    console.log('📦 Készlet frissítése:', { productId, newQuantity });

    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: parseInt(newQuantity),
        updated_at: new Date().toISOString()
      })
      .eq('id', productId)
      .select();

    if (error) {
      console.error('❌ Készlet frissítési hiba:', error);
      console.error('Hiba részletek:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      });
      throw error;
    }

    console.log('✅ Készlet sikeresen frissítve:', data[0]);
    return { success: true, data: data[0] };
  } catch (error) {
    console.error('❌ Készlet frissítés sikertelen:', error);
    return { 
      success: false, 
      error: error.message || 'Ismeretlen hiba történt' 
    };
  }
};

// Termék törlése
export const deleteProduct = async (productId) => {
  try {
    console.log('🗑️ Termék törlése:', productId);

    // Először ellenőrizzük, hogy vannak-e kapcsolódó eladások
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('id')
      .eq('product_id', productId)
      .limit(1);

    if (salesError) {
      console.error('❌ Eladások lekérési hiba:', salesError);
      throw salesError;
    }

    if (sales && sales.length > 0) {
      throw new Error('Nem törölhető a termék, mert már vannak hozzá kapcsolódó eladások!');
    }

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (error) {
      console.error('❌ Termék törlési hiba:', error);
      throw error;
    }

    console.log('✅ Termék sikeresen törölve');
    return { success: true };
  } catch (error) {
    console.error('❌ Termék törlés sikertelen:', error);
    return { 
      success: false, 
      error: error.message || 'Ismeretlen hiba történt' 
    };
  }
};

// Termékek lekérése
export const getProducts = async () => {
  try {
    console.log('📥 Termékek lekérése...');

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Termékek lekérési hiba:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} termék betöltve`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Termékek lekérés sikertelen:', error);
    return { 
      success: false, 
      error: error.message,
      data: [] 
    };
  }
};

// Eladások lekérése
export const getSales = async () => {
  try {
    console.log('📥 Eladások lekérése...');

    const { data, error } = await supabase
      .from('sales')
      .select('*')
      .order('sale_date', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Eladások lekérési hiba:', error);
      throw error;
    }

    console.log(`✅ ${data?.length || 0} eladás betöltve`);
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Eladások lekérés sikertelen:', error);
    return { 
      success: false, 
      error: error.message,
      data: [] 
    };
  }
};

// Termék lekérése ID alapján
export const getProductById = async (productId) => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('❌ Termék lekérési hiba:', error);
    return { success: false, error: error.message };
  }
};

// Eladások szűrése dátum alapján
export const getSalesByDateRange = async (startDate, endDate) => {
  try {
    let query = supabase
      .from('sales')
      .select('*');

    if (startDate) {
      query = query.gte('sale_date', startDate);
    }
    if (endDate) {
      query = query.lte('sale_date', endDate);
    }

    query = query.order('sale_date', { ascending: false });

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data: data || [] };
  } catch (error) {
    console.error('❌ Eladások szűrési hiba:', error);
    return { success: false, error: error.message, data: [] };
  }
};

// Statisztikák lekérése
export const getSalesStats = async () => {
  try {
    // Összes eladás
    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*');

    if (salesError) throw salesError;

    // Összes termék
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*');

    if (productsError) throw productsError;

    // Statisztikák számolása
    const totalRevenue = sales.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0);
    const totalCost = sales.reduce((sum, sale) => sum + (sale.cost_price * sale.quantity), 0);
    const totalProfit = totalRevenue - totalCost;
    const totalUnits = sales.reduce((sum, sale) => sum + sale.quantity, 0);

    // Platform statisztikák
    const platformStats = sales.reduce((stats, sale) => {
      if (!stats[sale.platform]) {
        stats[sale.platform] = { revenue: 0, units: 0, profit: 0 };
      }
      stats[sale.platform].revenue += sale.sale_price * sale.quantity;
      stats[sale.platform].units += sale.quantity;
      stats[sale.platform].profit += (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
      return stats;
    }, {});

    // Termék statisztikák
    const productStats = sales.reduce((stats, sale) => {
      const product = products.find(p => p.id === sale.product_id);
      const productName = product ? `${product.name} - ${product.model}` : 'Ismeretlen';
      
      if (!stats[productName]) {
        stats[productName] = { revenue: 0, units: 0, profit: 0 };
      }
      stats[productName].revenue += sale.sale_price * sale.quantity;
      stats[productName].units += sale.quantity;
      stats[productName].profit += (sale.sale_price * sale.quantity) - (sale.cost_price * sale.quantity);
      return stats;
    }, {});

    return {
      success: true,
      data: {
        totalRevenue,
        totalCost,
        totalProfit,
        totalUnits,
        platformStats,
        productStats,
        totalSales: sales.length,
        totalProducts: products.length
      }
    };
  } catch (error) {
    console.error('❌ Statisztikák lekérési hiba:', error);
    return { success: false, error: error.message };
  }
};

// Adatbázis inicializálás (opcionális)
export const initializeDatabase = async () => {
  try {
    console.log('🗃️ Adatbázis inicializálás...');

    // Ellenőrizzük, hogy léteznek-e a táblák
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .limit(1);

    const { data: sales, error: salesError } = await supabase
      .from('sales')
      .select('*')
      .limit(1);

    // Ha nincsenek termékek, adjunk hozzá alapértelmezetteket
    if ((!products || products.length === 0) && !productsError) {
      console.log('➕ Alapértelmezett termékek hozzáadása...');
      
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
          .insert([{
            ...product,
            created_at: new Date().toISOString()
          }]);
      }

      console.log('✅ Alapértelmezett termékek hozzáadva');
    }

    console.log('✅ Adatbázis inicializálás kész');
    return { success: true };
  } catch (error) {
    console.error('❌ Adatbázis inicializálási hiba:', error);
    return { success: false, error: error.message };
  }
};

// Kapcsolat állapotának monitorozása
export const checkConnectionHealth = async () => {
  try {
    const startTime = Date.now();
    const { data, error } = await supabase
      .from('products')
      .select('count')
      .limit(1)
      .single();

    const responseTime = Date.now() - startTime;

    if (error) {
      return {
        healthy: false,
        responseTime,
        error: error.message
      };
    }

    return {
      healthy: true,
      responseTime,
      message: `Kapcsolat rendben (${responseTime}ms)`
    };
  } catch (error) {
    return {
      healthy: false,
      responseTime: null,
      error: error.message
    };
  }
};
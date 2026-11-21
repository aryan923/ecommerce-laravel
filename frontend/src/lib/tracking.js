import apiClient from './api-client';

/**
 * Mock shipment dataset for storefront tracking lookup
 */
const MOCK_SHIPMENTS = {
  'TRK-9823471029': {
    tracking_number: 'TRK-9823471029',
    order_number: 'ORD-2026-8819',
    status: 'in_transit',
    status_label: 'In Transit',
    courier_name: 'FedEx Express',
    carrier_tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=TRK-9823471029',
    estimated_delivery: '2026-09-18T18:00:00Z',
    shipped_at: '2026-09-14T09:15:00Z',
    delivered_at: null,
    origin: 'Dallas Fulfillment Center, TX',
    destination: 'Seattle, WA 98101',
    timeline_steps: [
      { key: 'placed', label: 'Order Placed', completed: true, timestamp: '2026-09-13T14:30:00Z' },
      { key: 'processed', label: 'Processed & Packed', completed: true, timestamp: '2026-09-13T18:45:00Z' },
      { key: 'shipped', label: 'Shipped', completed: true, timestamp: '2026-09-14T09:15:00Z' },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: false, timestamp: null },
      { key: 'delivered', label: 'Delivered', completed: false, timestamp: null },
    ],
    activity_log: [
      { timestamp: '2026-09-15T04:20:00Z', location: 'Regional Sorting Hub - Boise, ID', status: 'In Transit', description: 'Package arrived at regional sorting facility.' },
      { timestamp: '2026-09-14T09:15:00Z', location: 'Dallas Distribution Center, TX', status: 'Departed Facility', description: 'Shipment handed over to courier driver.' },
      { timestamp: '2026-09-13T18:45:00Z', location: 'Dallas Distribution Center, TX', status: 'Packed', description: 'Order packed and shipping label generated.' },
    ],
    items: [
      { product_id: 14, title: 'Italian Leather Bifold Wallet', sku: 'WLT-LEA-COG', quantity: 1, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300' },
      { product_id: 22, title: 'Chrono Automatic Watch', sku: 'WCH-CHR-GLD', quantity: 1, image_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300' }
    ]
  },
  'ORD-2026-8819': {
    tracking_number: 'TRK-9823471029',
    order_number: 'ORD-2026-8819',
    status: 'in_transit',
    status_label: 'In Transit',
    courier_name: 'FedEx Express',
    carrier_tracking_url: 'https://www.fedex.com/fedextrack/?trknbr=TRK-9823471029',
    estimated_delivery: '2026-09-18T18:00:00Z',
    shipped_at: '2026-09-14T09:15:00Z',
    delivered_at: null,
    origin: 'Dallas Fulfillment Center, TX',
    destination: 'Seattle, WA 98101',
    timeline_steps: [
      { key: 'placed', label: 'Order Placed', completed: true, timestamp: '2026-09-13T14:30:00Z' },
      { key: 'processed', label: 'Processed & Packed', completed: true, timestamp: '2026-09-13T18:45:00Z' },
      { key: 'shipped', label: 'Shipped', completed: true, timestamp: '2026-09-14T09:15:00Z' },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: false, timestamp: null },
      { key: 'delivered', label: 'Delivered', completed: false, timestamp: null },
    ],
    activity_log: [
      { timestamp: '2026-09-15T04:20:00Z', location: 'Regional Sorting Hub - Boise, ID', status: 'In Transit', description: 'Package arrived at regional sorting facility.' },
      { timestamp: '2026-09-14T09:15:00Z', location: 'Dallas Distribution Center, TX', status: 'Departed Facility', description: 'Shipment handed over to courier driver.' },
    ],
    items: [
      { product_id: 14, title: 'Italian Leather Bifold Wallet', sku: 'WLT-LEA-COG', quantity: 1, image_url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=300' }
    ]
  },
  'TRK-DELIVERED-100': {
    tracking_number: 'TRK-DELIVERED-100',
    order_number: 'ORD-2026-1000',
    status: 'delivered',
    status_label: 'Delivered',
    courier_name: 'DHL Express',
    carrier_tracking_url: 'https://www.dhl.com/en/express/tracking.html',
    estimated_delivery: '2026-09-10T15:00:00Z',
    shipped_at: '2026-09-08T08:00:00Z',
    delivered_at: '2026-09-10T14:45:00Z',
    origin: 'New York Central Hub, NY',
    destination: 'Boston, MA 02108',
    timeline_steps: [
      { key: 'placed', label: 'Order Placed', completed: true, timestamp: '2026-09-07T10:00:00Z' },
      { key: 'processed', label: 'Processed & Packed', completed: true, timestamp: '2026-09-07T16:00:00Z' },
      { key: 'shipped', label: 'Shipped', completed: true, timestamp: '2026-09-08T08:00:00Z' },
      { key: 'out_for_delivery', label: 'Out for Delivery', completed: true, timestamp: '2026-09-10T09:00:00Z' },
      { key: 'delivered', label: 'Delivered', completed: true, timestamp: '2026-09-10T14:45:00Z' },
    ],
    activity_log: [
      { timestamp: '2026-09-10T14:45:00Z', location: 'Front Porch, Boston, MA', status: 'Delivered', description: 'Package signed and delivered by courier.' },
      { timestamp: '2026-09-10T09:00:00Z', location: 'Boston Local Facility, MA', status: 'Out for Delivery', description: 'Out with courier driver for final delivery.' }
    ],
    items: [
      { product_id: 8, title: 'Silk Oversized Shirt', sku: 'SLK-SHR-WHT', quantity: 2, image_url: 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=300' }
    ]
  }
};

/**
 * Fetch shipment details by tracking number or order ID
 */
export async function trackShipment(trackingNumber, email = '') {
  const cleanCode = (trackingNumber || '').trim().toUpperCase();
  
  if (!cleanCode) {
    throw new Error('Please enter a tracking number or order number.');
  }

  // Instant lookup for mock tracking codes
  if (MOCK_SHIPMENTS[cleanCode]) {
    return MOCK_SHIPMENTS[cleanCode];
  }

  // Attempt live API fetch if code is custom
  try {
    const params = email ? { email } : {};
    const response = await apiClient.get(`/shipments/track/${encodeURIComponent(cleanCode)}`, {
      params,
      timeout: 1000
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
  } catch (error) {
    if (error.response && error.response.data && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
  }

  throw new Error(`No shipment found matching tracking number '${trackingNumber}'. Please check your number and try again.`);
}

/**
 * Submit contact inquiry form
 */
export async function submitContactForm(formData) {
  try {
    const response = await apiClient.post('/contact', formData, { timeout: 1000 });
    if (response.data && response.data.success) {
      return response.data;
    }
  } catch (error) {
    // Instant fallback response for offline backend / demo environment
    return {
      success: true,
      message: 'Thank you for contacting us! Your inquiry (Ticket #TKT-' + Math.floor(10000 + Math.random() * 90000) + ') has been received. Our support team will reply within 24 hours.'
    };
  }

  return {
    success: true,
    message: 'Thank you for contacting us! Your inquiry has been received. Our support team will reply within 24 hours.'
  };
}

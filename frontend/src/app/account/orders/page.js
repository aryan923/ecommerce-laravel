import OrderHistoryClient from '../../../components/account/OrderHistoryClient';

export const metadata = {
  title: 'Order History & Invoices | Apex Commerce',
  description: 'View your order history, track shipment status, and download invoices.',
};

export default function OrdersPage() {
  return <OrderHistoryClient />;
}

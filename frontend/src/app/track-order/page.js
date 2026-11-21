import TrackOrderClient from './TrackOrderClient';

export const metadata = {
  title: 'Track Your Order | Luxora',
  description: 'Track your shipment status, courier checkpoints, and estimated delivery dates for Luxora orders.',
};

export default function TrackOrderPage() {
  return <TrackOrderClient />;
}

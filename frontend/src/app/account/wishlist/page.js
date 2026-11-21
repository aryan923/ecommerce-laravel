import WishlistClient from '../../wishlist/WishlistClient';

export const metadata = {
  title: 'My Wishlist | Apex Commerce',
  description: 'View and manage your saved luxury products, track availability, and transfer items to your shopping cart.',
};

export default function AccountWishlistPage() {
  return <WishlistClient />;
}

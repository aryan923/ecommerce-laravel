import DynamicPageClient from '@/components/cms/DynamicPageClient';
import { fetchPageBySlug } from '@/lib/cms-api';

export const metadata = {
  title: 'Shipping Policy | Storefront',
  description: 'Read our official shipping policy, delivery timelines, courier partners, and rates.',
};

export default async function ShippingPolicyPage() {
  const pageData = await fetchPageBySlug('shipping-policy');
  return <DynamicPageClient slug="shipping-policy" initialData={pageData} />;
}

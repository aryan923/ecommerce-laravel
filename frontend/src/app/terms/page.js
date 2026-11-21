import DynamicPageClient from '@/components/cms/DynamicPageClient';
import { fetchPageBySlug } from '@/lib/cms-api';

export const metadata = {
  title: 'Terms of Service | Storefront',
  description: 'Read our official terms and conditions, user agreement, and legal policies.',
};

export default async function TermsPage() {
  const pageData = await fetchPageBySlug('terms-and-conditions');
  return <DynamicPageClient slug="terms-and-conditions" initialData={pageData} />;
}

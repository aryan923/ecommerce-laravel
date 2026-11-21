import DynamicPageClient from '@/components/cms/DynamicPageClient';
import { fetchPageBySlug } from '@/lib/cms-api';

export const metadata = {
  title: 'Privacy Policy | Storefront',
  description: 'Read our official store privacy policy, cookie disclosures, and data protection terms.',
};

export default async function PrivacyPage() {
  const pageData = await fetchPageBySlug('privacy-policy');
  return <DynamicPageClient slug="privacy-policy" initialData={pageData} />;
}

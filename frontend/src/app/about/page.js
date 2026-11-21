import DynamicPageClient from '@/components/cms/DynamicPageClient';
import { fetchPageBySlug } from '@/lib/cms-api';

export const metadata = {
  title: 'About Us | Storefront',
  description: 'Learn about our brand story, mission, quality commitments, and team.',
};

export default async function AboutPage() {
  const pageData = await fetchPageBySlug('about-us');
  return <DynamicPageClient slug="about-us" initialData={pageData} />;
}

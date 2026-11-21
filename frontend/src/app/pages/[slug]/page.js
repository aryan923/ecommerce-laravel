import DynamicPageClient from '@/components/cms/DynamicPageClient';
import { fetchPageBySlug } from '@/lib/cms-api';

export async function generateMetadata({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;

  if (!slug) {
    return {
      title: 'Page Not Found',
    };
  }

  const page = await fetchPageBySlug(slug);

  if (!page) {
    return {
      title: 'Page Not Found | Storefront',
    };
  }

  return {
    title: page.seo_title || `${page.title} | Storefront`,
    description: page.seo_description || 'Read official store policies, legal notices, and information.',
  };
}

export default async function CMSPage({ params }) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug;
  const pageData = slug ? await fetchPageBySlug(slug) : null;

  return <DynamicPageClient slug={slug} initialData={pageData} />;
}

/* 搜索引擎结构化数据（JSON-LD）：组织、站点、商品列表、常见问题。 */
import { productById } from './core.js';

const abs = (site, path) => (/^https?:/.test(path) ? path : `${site.meta.url}/${path.replace(/^\//, '')}`);

/** 单件商品的结构化数据。评价默认不输出（reviews.seo 为 false），确认是真实数据后再打开。 */
export function productLd(site, p) {
  const withReviews = site.reviews.seo === true;
  return {
    '@type': 'Product',
    name: `${p.name} ${p.cn}`,
    description: p.desc,
    image: [abs(site, p.images.main)],
    sku: p.sku || p.id,
    brand: { '@type': 'Brand', name: site.brand.name },
    offers: {
      '@type': 'Offer', priceCurrency: 'CNY', price: p.price,
      availability: 'https://schema.org/InStock', url: `${site.meta.url}/#product-${p.id}`,
      itemCondition: 'https://schema.org/NewCondition',
    },
    ...(withReviews && p.rating ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: p.rating, reviewCount: p.reviews || 1, bestRating: 5 } } : {}),
  };
}

export function jsonLd(site) {
  const { brand, contact, company } = site;
  const products = site.collection.products;
  return [
    {
      '@context': 'https://schema.org', '@type': 'Organization', name: brand.name, legalName: company.legalName,
      url: `${site.meta.url}/`, logo: brand.logoImage ? abs(site, brand.logoImage) : undefined,
      contactPoint: { '@type': 'ContactPoint', telephone: contact.phone, contactType: 'customer service', areaServed: 'CN', availableLanguage: ['zh-CN'] },
      address: { '@type': 'PostalAddress', streetAddress: contact.address, addressCountry: 'CN' },
    },
    { '@context': 'https://schema.org', '@type': 'WebSite', name: brand.name, url: `${site.meta.url}/`, description: site.meta.description, inLanguage: site.meta.lang },
    {
      '@context': 'https://schema.org', '@type': 'ItemList', name: site.collection.title,
      itemListElement: products.map((p, i) => ({ '@type': 'ListItem', position: i + 1, item: productLd(site, p) })),
    },
    {
      '@context': 'https://schema.org', '@type': 'FAQPage',
      mainEntity: site.care.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
    },
  ].filter(Boolean);
}

export const hasProduct = (site, id) => !!productById(site, id);

import { ShopCartButton } from "@/components/shop/ShopCartDrawer";
import { ShopProductCard } from "@/components/shop/ShopProductCard";
import type { ShopLandingData } from "@/lib/shopify/types";

export function ShopLanding({ data }: { data: ShopLandingData }) {
  const sections = data.collections.filter((collection) => collection.products.length > 0);
  return <div className="shop-page">
    <section className="shop-masthead" aria-labelledby="shop-heading">
      <div className="shop-masthead__inner">
        <p>PANDA SHOP</p><h1 id="shop-heading">Take the adventure with you</h1>
        <span>Thoughtful Panda favourites for family days beyond the screen.</span>
        <div className="shop-masthead__actions"><a className="button button--primary" href="#shop-collection">Shop the collection</a><ShopCartButton /></div>
      </div>
      {data.mode === "demo" ? <span className="shop-mode-badge">Shop mode: Demo</span> : null}
    </section>
    <div className="shop-collections" id="shop-collection">
      {sections.length > 1 ? (
        <nav className="shop-collection-tabs" aria-label="Shop collections">
          <a href="#shop-collection">All collections</a>
          {sections.map((collection) => <a key={collection.id} href={`#collection-${collection.handle}`}>{collection.title}</a>)}
        </nav>
      ) : null}
      {sections.map((collection) => <section className="shop-collection" key={collection.id} aria-labelledby={`collection-${collection.handle}`}>
        <div className="shop-collection__header"><div><p>SHOP COLLECTION</p><h2 id={`collection-${collection.handle}`}>{collection.title}</h2>{collection.description ? <span>{collection.description}</span> : null}</div></div>
        <div className="shop-product-grid">{collection.products.map((product) => <ShopProductCard key={product.id} product={product} />)}</div>
      </section>)}
      {sections.length === 0 ? <p className="shop-empty-state">This collection is being prepared. Please check back soon.</p> : null}
    </div>
  </div>;
}

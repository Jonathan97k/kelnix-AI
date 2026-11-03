import { useMemo, useState } from 'react';
import {
  ArrowRight, ArrowUpRight, BookOpen, BriefcaseBusiness, Check, ChevronDown,
  Download, Globe2, Heart, Menu, Search, ShieldCheck, ShoppingBag, Sparkles,
  Wallet, X, Zap, Star, Mail
} from 'lucide-react';

type Category = 'All products' | 'Business' | 'Money' | 'Career' | 'Productivity';
type Product = {
  id: number; title: string; subtitle: string; category: Exclude<Category, 'All products'>;
  price: string; label: string; palette: string; icon: 'business' | 'money' | 'career' | 'productivity';
  description: string; pages: string; featured?: boolean;
};

const products: Product[] = [
  { id: 1, title: 'The Small Business Launch Kit', subtitle: 'A clearer path from idea to first customer.', category: 'Business', price: '$14.99', label: 'BESTSELLER', palette: 'mint', icon: 'business', description: 'A practical starter collection with business planning prompts, launch checklists, a simple budget planner and marketing worksheets.', pages: 'Workbook + templates', featured: true },
  { id: 2, title: 'The Personal Money Planner', subtitle: 'Make every dollar work with a plan.', category: 'Money', price: '$7.99', label: 'COMING SOON', palette: 'lavender', icon: 'money', description: 'A printable system for monthly budgeting, savings goals, spending reviews and debt payoff planning.', pages: 'Printable planner' },
  { id: 3, title: 'The Career Ready Bundle', subtitle: 'Present your experience with confidence.', category: 'Career', price: '$9.99', label: 'COMING SOON', palette: 'peach', icon: 'career', description: 'CV planning worksheets, achievement prompts, application trackers and interview preparation exercises.', pages: 'Guide + worksheets' },
  { id: 4, title: 'The Focus & Productivity Planner', subtitle: 'Turn busy days into meaningful progress.', category: 'Productivity', price: '$6.99', label: 'COMING SOON', palette: 'blue', icon: 'productivity', description: 'A practical daily and weekly planning system with priority mapping, habit tracking and review pages.', pages: 'Printable planner' },
  { id: 5, title: 'Freelancer Client Toolkit', subtitle: 'Look organised from the first enquiry.', category: 'Business', price: '$11.99', label: 'COMING SOON', palette: 'sand', icon: 'business', description: 'Client intake, project scope, quotation, invoice and handover templates for independent professionals.', pages: 'Template pack' },
  { id: 6, title: 'The Simple Savings Challenge', subtitle: 'Build a savings habit one week at a time.', category: 'Money', price: '$4.99', label: 'COMING SOON', palette: 'rose', icon: 'money', description: 'A flexible savings challenge with trackers, milestones and a monthly reflection sheet.', pages: 'Printable challenge' },
];

const categories: Category[] = ['All products', 'Business', 'Money', 'Career', 'Productivity'];

function CoverArt({ product }: { product: Product }) {
  const Icon = product.icon === 'business' ? BriefcaseBusiness : product.icon === 'money' ? Wallet : product.icon === 'career' ? BookOpen : Zap;
  return (
    <div className={'cover-art cover-' + product.palette}>
      <div className="cover-orbit orbit-one" /><div className="cover-orbit orbit-two" />
      <div className="cover-topline"><span>KELNIX MARKET</span><span>№ 0{product.id}</span></div>
      <div className="cover-center">
        <div className="cover-icon"><Icon size={24} strokeWidth={1.7} /></div>
        <span className="cover-kicker">THE PRACTICAL COLLECTION</span>
        <strong>{product.title}</strong>
        <span className="cover-subtitle">{product.subtitle}</span>
      </div>
      <div className="cover-footer"><span>DIGITAL DOWNLOAD</span><span>PDF · INSTANT ACCESS</span></div>
    </div>
  );
}

function App() {
  const [category, setCategory] = useState<Category>('All products');
  const [search, setSearch] = useState('');
  const [mobileMenu, setMobileMenu] = useState(false);
  const [selected, setSelected] = useState<Product | null>(null);
  const [saved, setSaved] = useState<number[]>([]);
  const [toast, setToast] = useState('');

  const filtered = useMemo(() => products.filter((product) => {
    const matchesCategory = category === 'All products' || product.category === category;
    const term = search.trim().toLowerCase();
    const matchesSearch = !term || (product.title + ' ' + product.subtitle + ' ' + product.category).toLowerCase().includes(term);
    return matchesCategory && matchesSearch;
  }), [category, search]);

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  };

  const toggleSaved = (id: number) => {
    setSaved((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
    notify(saved.includes(id) ? 'Removed from your saved list' : 'Saved for later');
  };

  const scrollToProducts = () => document.getElementById('collection')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="store-shell">
      <div className="announcement"><Sparkles size={13} /> Thoughtful digital tools for your next big step <span className="announcement-divider">·</span> First collection coming soon</div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="Kelnix Market home">
          <span className="brand-mark"><span /><span /><span /></span>
          <span className="brand-name">kelnix<span>market</span></span>
        </a>
        <nav className={mobileMenu ? 'main-nav nav-open' : 'main-nav'}>
          <a href="#collection" onClick={() => setMobileMenu(false)}>Shop all</a>
          <a href="#why-kelnix" onClick={() => setMobileMenu(false)}>Why Kelnix</a>
          <a href="#about" onClick={() => setMobileMenu(false)}>Our approach</a>
        </nav>
        <div className="header-actions">
          <button className="header-search" onClick={scrollToProducts}><Search size={17} /><span>Explore</span></button>
          <button className="bag-button" onClick={() => notify('Your shopping bag will be enabled when the first downloads go live.')} aria-label="Shopping bag"><ShoppingBag size={18} /><span className="bag-count">0</span></button>
          <button className="mobile-toggle" onClick={() => setMobileMenu(!mobileMenu)} aria-label="Toggle navigation">{mobileMenu ? <X /> : <Menu />}</button>
        </div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="eyebrow"><span className="eyebrow-dot" /> THE DIGITAL RESOURCE STORE</div>
            <h1>Make your next move<br />a <em>smart</em> one.</h1>
            <p className="hero-description">Practical guides, thoughtful templates and digital tools designed to help you build, organise and move forward.</p>
            <div className="hero-actions">
              <button className="button-primary" onClick={scrollToProducts}>Explore the collection <ArrowRight size={17} /></button>
              <a className="text-link" href="#about">Discover our approach <ArrowUpRight size={16} /></a>
            </div>
            <div className="hero-proof">
              <div className="proof-avatars"><span> K </span><span> M </span><span>+</span></div>
              <div><strong>Made to be useful.</strong><small>Clear, practical and easy to use.</small></div>
            </div>
          </div>
          <div className="hero-art" aria-label="Preview of Kelnix Market digital product collections">
            <div className="hero-glow" />
            <div className="floating-note note-top"><span className="note-icon"><Check size={15} /></span><span><b>Less overwhelm</b><small>More forward motion</small></span></div>
            <div className="hero-stack stack-back"><div className="stack-label">THE EVERYDAY EDIT</div><div className="stack-lines" /><div className="stack-seal">KM</div></div>
            <div className="hero-stack stack-front">
              <div className="stack-label">KELNIX MARKET <span>VOL. 01</span></div>
              <div className="stack-title">A better way<br />to get things<br /><i>moving.</i></div>
              <div className="stack-graphic"><div className="graphic-sun" /><div className="graphic-arch" /><div className="graphic-line" /></div>
              <div className="stack-bottom"><span>GUIDES · PLANNERS · TEMPLATES</span><b>01 / 06</b></div>
            </div>
            <div className="floating-note note-bottom"><span className="download-icon"><Download size={16} /></span><span><b>Digital by design</b><small>Ready when you are</small></span></div>
            <div className="hero-sticker"><span>MAKE<br />IT<br /><i>HAPPEN.</i></span><ArrowUpRight size={18} /></div>
          </div>
          <div className="hero-bottomline"><span>01 — CURATED DIGITAL GOODS</span><span>DESIGNED FOR REAL LIFE <span className="bottom-star">✳</span> BUILT FOR PROGRESS</span></div>
        </section>

        <section className="trust-strip" id="why-kelnix">
          <div><ShieldCheck /><span><b>Thoughtfully made</b><small>Useful, not overwhelming</small></span></div>
          <div><Download /><span><b>Digital-first</b><small>Downloads, not clutter</small></span></div>
          <div><Globe2 /><span><b>Made for everywhere</b><small>Useful wherever you are</small></span></div>
          <div><Heart /><span><b>Practical by nature</b><small>Tools you can put to work</small></span></div>
        </section>

        <section className="collection-section" id="collection">
          <div className="section-heading">
            <div><div className="eyebrow"><span className="eyebrow-dot" /> THE KELNIX EDIT</div><h2>Find what moves<br /><em>you forward.</em></h2></div>
            <p>Small, useful resources for big everyday ambitions. Explore the collection and find the right place to start.</p>
          </div>
          <div className="shop-toolbar">
            <div className="category-tabs">
              {categories.map((item) => <button key={item} className={category === item ? 'category-tab active' : 'category-tab'} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
            <label className="product-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search resources..." /><span>⌘ K</span></label>
          </div>
          <div className="product-grid">
            {filtered.map((product, index) => (
              <article className="product-card" key={product.id}>
                <div className="product-visual">
                  <CoverArt product={product} />
                  <span className={product.featured ? 'product-label featured-label' : 'product-label'}>{product.featured ? 'EDITOR’S PICK' : product.label}</span>
                  <button className={saved.includes(product.id) ? 'save-button is-saved' : 'save-button'} onClick={() => toggleSaved(product.id)} aria-label="Save product"><Heart size={17} fill={saved.includes(product.id) ? 'currentColor' : 'none'} /></button>
                </div>
                <div className="product-info">
                  <div className="product-meta"><span>{product.category}</span><span>{product.pages}</span></div>
                  <button className="product-title" onClick={() => setSelected(product)}>{product.title}<ArrowUpRight size={15} /></button>
                  <p>{product.subtitle}</p>
                  <div className="product-bottom"><strong>{product.price}</strong><button onClick={() => setSelected(product)}>View details <ArrowRight size={14} /></button></div>
                </div>
              </article>
            ))}
            {filtered.length === 0 && <div className="empty-state"><Search size={25} /><h3>No matches just yet</h3><p>Try another search or choose a different category.</p><button onClick={() => { setSearch(''); setCategory('All products'); }}>Clear filters</button></div>}
          </div>
          <div className="collection-foot"><span>SHOWING {filtered.length.toString().padStart(2, '0')} OF 06 COLLECTIONS</span><span>MORE GOOD THINGS ARE ON THE WAY <span className="bottom-star">✳</span></span></div>
        </section>

        <section className="manifesto" id="about">
          <div className="manifesto-mark"><span className="brand-mark large"><span /><span /><span /></span><span className="manifesto-caption">A NOTE FROM KELNIX MARKET</span></div>
          <div className="manifesto-copy"><h2>Good tools make<br />good things <em>possible.</em></h2><p>We believe useful resources should make life feel clearer, not more complicated. That’s why every Kelnix Market download is being shaped around one idea: give people practical tools they can actually use.</p><a href="#collection" className="text-link">Find your starting point <ArrowUpRight size={16} /></a></div>
          <div className="manifesto-side"><div className="side-star">✳</div><span>LESS NOISE.<br />MORE MOMENTUM.</span></div>
        </section>

        <section className="bottom-cta">
          <div><div className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT CHAPTER STARTS HERE</div><h2>Ready when<br /><em>you are.</em></h2></div>
          <div className="bottom-cta-right"><p>Explore practical resources built to help you take the next step with confidence.</p><button className="button-light" onClick={scrollToProducts}>Explore Kelnix Market <ArrowRight size={17} /></button></div>
          <div className="cta-decoration">KM<span>✳</span></div>
        </section>
      </main>

      <footer className="site-footer">
        <a className="brand footer-brand" href="#"><span className="brand-mark"><span /><span /><span /></span><span className="brand-name">kelnix<span>market</span></span></a>
        <span className="footer-copy">© {new Date().getFullYear()} Kelnix Market. Thoughtfully made for forward motion.</span>
        <div className="footer-links"><a href="#collection">Shop</a><a href="#why-kelnix">Our promise</a><a href="mailto:kaphirij9@gmail.com">Contact</a></div>
      </footer>

      {selected && <div className="modal-backdrop" onClick={() => setSelected(null)}><div className="product-modal" onClick={(event) => event.stopPropagation()}><button className="modal-close" onClick={() => setSelected(null)} aria-label="Close"><X size={20} /></button><div className="modal-cover"><CoverArt product={selected} /></div><div className="modal-content"><div className="eyebrow"><span className="eyebrow-dot" /> {selected.category.toUpperCase()} COLLECTION</div><h2>{selected.title}</h2><p>{selected.description}</p><div className="modal-spec"><span><BookOpen size={16} /> {selected.pages}</span><span><Download size={16} /> Digital PDF</span></div><div className="modal-price"><strong>{selected.price}</strong><span>Planned launch price</span></div><div className="coming-soon"><Sparkles size={17} /><span><b>Preparing this download</b><small>Our first digital collection is being finalised. This item is not available to purchase yet.</small></span></div><button className="button-primary modal-button" onClick={() => { setSelected(null); notify('Thanks for your interest. The collection is being prepared.'); }}>Got it <Check size={16} /></button></div></div></div>}
      {toast && <div className="toast"><Check size={16} />{toast}</div>}
    </div>
  );
}

export default App;

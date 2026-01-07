import Link from "next/link";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { name: "All Products", href: "/shop" },
      { name: "New Arrivals", href: "/shop/new" },
      { name: "Best Sellers", href: "/shop/bestsellers" },
      { name: "Sale", href: "/shop/sale" },
    ],
    collections: [
      { name: "Street Style", href: "/collections/street-style" },
      { name: "Minimalist", href: "/collections/minimalist" },
      { name: "Vintage", href: "/collections/vintage" },
      { name: "Art Series", href: "/collections/art-series" },
    ],
    company: [
      { name: "About Us", href: "/about" },
      { name: "Sustainability", href: "/sustainability" },
      { name: "Careers", href: "/careers" },
      { name: "Press", href: "/press" },
    ],
    support: [
      { name: "Contact", href: "/contact" },
      { name: "FAQs", href: "/faqs" },
      { name: "Shipping", href: "/shipping" },
      { name: "Returns", href: "/returns" },
    ],
  };

  const socialLinks = [
    { name: "Instagram", href: "https://instagram.com" },
    { name: "TikTok", href: "https://tiktok.com" },
    { name: "Twitter", href: "https://twitter.com" },
    { name: "Pinterest", href: "https://pinterest.com" },
  ];

  return (
    <footer className="bg-background border-t border-card-border">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8">
          {/* Brand Column */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg" style={{ fontFamily: 'var(--font-heading)' }}>TD</span>
              </div>
              <span className="text-2xl tracking-wider" style={{ fontFamily: 'var(--font-heading)' }}>
                TASTE-DEES
              </span>
            </Link>
            <p className="text-muted mb-6 max-w-xs">
              Premium t-shirts for those who dare to express themselves. Handcrafted with love, designed for the bold.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-card-bg border border-card-border rounded-full flex items-center justify-center text-muted hover:text-accent hover:border-accent transition-colors"
                >
                  <span className="sr-only">{social.name}</span>
                  <span className="text-xs font-medium">{social.name.charAt(0)}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>SHOP</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>COLLECTIONS</h4>
            <ul className="space-y-3">
              {footerLinks.collections.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>COMPANY</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4" style={{ fontFamily: 'var(--font-heading)' }}>SUPPORT</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted hover:text-accent transition-colors">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-card-border">
        <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-muted text-sm">
            © {currentYear} Taste-Dees. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted">
            <Link href="/privacy" className="hover:text-accent transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-accent transition-colors">Terms of Service</Link>
            <Link href="/cookies" className="hover:text-accent transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

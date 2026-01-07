export default function Marquee() {
  const items = [
    "FREE SHIPPING OVER $75",
    "★",
    "100% PREMIUM COTTON",
    "★",
    "HANDCRAFTED DESIGNS",
    "★",
    "SUSTAINABLE MATERIALS",
    "★",
    "30-DAY RETURNS",
    "★",
  ];

  return (
    <section className="bg-foreground text-background py-4 overflow-hidden">
      <div className="flex whitespace-nowrap">
        <div className="flex animate-marquee">
          {[...items, ...items].map((item, index) => (
            <span 
              key={index}
              className="mx-8 text-sm font-medium tracking-widest"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {item}
            </span>
          ))}
        </div>
        <div className="flex animate-marquee">
          {[...items, ...items].map((item, index) => (
            <span 
              key={`duplicate-${index}`}
              className="mx-8 text-sm font-medium tracking-widest"
              style={{ fontFamily: 'var(--font-heading)' }}
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

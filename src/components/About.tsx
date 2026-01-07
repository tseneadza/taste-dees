export default function About() {
  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
        </svg>
      ),
      title: "Unique Designs",
      description: "Every piece is crafted by independent artists who bring fresh perspectives to streetwear.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
      ),
      title: "Sustainable",
      description: "We use organic cotton and eco-friendly inks. Better for you, better for the planet.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
        </svg>
      ),
      title: "Made with Love",
      description: "Each t-shirt is made to order with attention to every detail. Quality you can feel.",
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
        </svg>
      ),
      title: "Fast Shipping",
      description: "Free worldwide shipping on orders over $75. Most orders arrive within 5-7 days.",
    },
  ];

  return (
    <section className="py-20 md:py-32 relative overflow-hidden noise-bg">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left Column - Image/Visual */}
          <div className="relative">
            <div className="aspect-square max-w-lg mx-auto">
              {/* Decorative background shapes */}
              <div className="absolute inset-0 bg-accent/20 rounded-full transform -translate-x-8 translate-y-8" />
              <div className="absolute inset-0 bg-secondary/20 rounded-full transform translate-x-8 -translate-y-8" />
              
              {/* Main content box */}
              <div className="relative h-full bg-gradient-to-br from-foreground to-secondary rounded-3xl flex items-center justify-center overflow-hidden">
                <div className="text-center text-background p-8">
                  <div 
                    className="text-8xl md:text-9xl opacity-10"
                    style={{ fontFamily: 'var(--font-heading)' }}
                  >
                    TD
                  </div>
                  <p className="text-2xl font-light -mt-12">Since 2024</p>
                </div>
                
                {/* Floating accent */}
                <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-accent rounded-full opacity-80" />
              </div>
            </div>
          </div>

          {/* Right Column - Content */}
          <div className="space-y-8">
            <div>
              <span className="text-accent font-medium tracking-wide">OUR STORY</span>
              <h2 
                className="text-4xl md:text-5xl lg:text-6xl mt-2"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                MORE THAN JUST<br />
                <span className="gradient-text">A T-SHIRT</span>
              </h2>
            </div>
            
            <p className="text-lg text-muted">
              Taste-Dees was born from a simple idea: clothing should be a canvas for self-expression. 
              We partner with independent artists and use only premium, sustainable materials to create 
              pieces that are as unique as you are.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div key={feature.title} className="group">
                  <div className="w-14 h-14 bg-accent/10 rounded-2xl flex items-center justify-center text-accent mb-4 transition-colors group-hover:bg-accent group-hover:text-white">
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-muted text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

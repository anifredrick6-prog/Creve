function Landing() {
  return (
    <div className="min-h-screen bg-paper text-ink font-body overflow-x-hidden">
      <Nav />
      <Hero />
      <TrustStrip />
      <Problems />
      <VerifiedSignature />
      <FinalCTA />
      <Footer />
    </div>
  )
}

function Nav() {
  return (
    <header className="sticky top-0 z-30 bg-paper/90 backdrop-blur-sm border-b border-line">
      <div className="max-w-5xl mx-auto px-5 h-16 flex items-center justify-between">
        <span className="font-display text-2xl font-semibold tracking-tight text-ink">Creve</span>
        <div className="flex items-center gap-2">
          <a
            href="#login"
            className="text-sm font-semibold px-3 py-2 text-ink/70 hover:text-ink transition-colors"
          >
            Log in
          </a>
          <a
            href="#signup"
            className="text-sm font-bold px-4 py-2 rounded-full bg-teal text-paper hover:bg-teal-deep transition-colors"
          >
            Sign up
          </a>
        </div>
      </div>
    </header>
  )
}

function Hero() {
  return (
    <section className="max-w-5xl mx-auto px-5 pt-14 pb-16">
      <p className="text-xs font-bold tracking-[0.14em] uppercase text-teal mb-4">
        Built for FUTO
      </p>
      <h1 className="font-display font-semibold text-[2.5rem] leading-[1.08] sm:text-6xl sm:leading-[1.05] tracking-tight text-ink max-w-3xl">
        Buy from vendors you can actually trust.
      </h1>
      <p className="mt-5 text-base sm:text-lg text-ink/70 max-w-xl leading-relaxed">
        Creve is a marketplace built for FUTO students. Every vendor submits
        real identity details before they can sell — so you know who you're
        buying from, every time.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <a
          href="#signup-buyer"
          className="text-center font-bold text-sm px-6 py-3.5 rounded-full bg-teal text-paper hover:bg-teal-deep transition-colors"
        >
          Start browsing
        </a>
        <a
          href="#signup-vendor"
          className="text-center font-bold text-sm px-6 py-3.5 rounded-full border border-ink/15 text-ink hover:border-ink/40 transition-colors"
        >
          Sell on Creve
        </a>
      </div>
    </section>
  )
}

function TrustStrip() {
  return (
    <section className="border-y border-line bg-teal-deep">
      <div className="max-w-5xl mx-auto px-5 py-4 flex flex-wrap items-center gap-x-8 gap-y-2">
        <TrustItem label="Vendors verified with NIN + school ID" />
        <TrustItem label="Every listing tied to a real FUTO vendor" />
        <TrustItem label="Reports investigated, not ignored" />
      </div>
    </section>
  )
}

function TrustItem({ label }) {
  return (
    <div className="flex items-center gap-2">
      <span className="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
      <span className="text-xs font-semibold text-paper/90">{label}</span>
    </div>
  )
}

function Problems() {
  const items = [
    {
      label: 'Audience',
      title: 'Vendors and buyers, finally in one place',
      body: "No more scattered WhatsApp statuses and word-of-mouth. Creve makes it easy for FUTO vendors and students to find each other directly.",
    },
    {
      label: 'Versatility',
      title: 'Compare price and speed, side by side',
      body: 'Browse listings from multiple vendors at once, so you can find the best price for what you need and the fastest way to get it.',
    },
    {
      label: 'Accessibility',
      title: 'Reach any vendor, any time',
      body: "Every vendor profile carries their contact details, so you're never stuck waiting on a status update to know if they're open for business.",
    },
    {
      label: 'Accountability',
      title: 'Verified identity, before the first sale',
      body: 'Vendors submit their NIN, full name, department and level before they can list. If something goes wrong, that record backs you up.',
    },
  ]

  return (
    <section className="max-w-5xl mx-auto px-5 py-20">
      <p className="text-xs font-bold tracking-[0.14em] uppercase text-teal mb-3">
        What Creve solves
      </p>
      <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight text-ink max-w-2xl">
        Campus buying, without the guesswork.
      </h2>
      <div className="mt-10 grid sm:grid-cols-2 gap-6">
        {items.map((item) => (
          <div key={item.label} className="border border-line rounded-2xl p-6 bg-white/40">
            <p className="text-xs font-bold tracking-wide uppercase text-amber mb-3">
              {item.label}
            </p>
            <h3 className="font-display font-semibold text-xl text-ink mb-2 leading-snug">
              {item.title}
            </h3>
            <p className="text-sm text-ink/65 leading-relaxed">{item.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function VerifiedSignature() {
  return (
    <section className="bg-teal-deep">
      <div className="max-w-5xl mx-auto px-5 py-20 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] uppercase text-amber mb-3">
            The Verified badge
          </p>
          <h2 className="font-display font-semibold text-3xl sm:text-4xl leading-tight text-paper">
            One badge means one thing: this is a real person.
          </h2>
          <p className="mt-4 text-paper/70 text-base leading-relaxed max-w-md">
            Before a vendor's badge turns on, we confirm their NIN, full
            name, department and level are real. If a buyer ever gets
            scammed, that information is there — and it's only released
            after we've confirmed the report against the vendor.
          </p>
        </div>
        <VendorCardMock />
      </div>
    </section>
  )
}

function VendorCardMock() {
  return (
    <div className="bg-paper rounded-2xl p-5 max-w-sm mx-auto shadow-xl">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-teal/15 flex items-center justify-center font-display font-semibold text-teal-deep">
          AF
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-sm text-ink">Ada's Fabrics</span>
            <VerifiedDot />
          </div>
          <span className="text-xs text-ink/50">
            Fashion Design &middot; 200 Level
          </span>
        </div>
      </div>
      <div className="mt-4 h-28 rounded-xl bg-teal/10 flex items-center justify-center">
        <span className="text-xs text-teal-deep/60 font-semibold">
          Product photo
        </span>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-sm font-bold text-ink">₦8,500</span>
        <span className="text-xs font-semibold text-teal-deep bg-teal/10 px-2.5 py-1 rounded-full">
          Ankara fabric, 6 yards
        </span>
      </div>
    </div>
  )
}

function VerifiedDot() {
  return (
    <span
      className="inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber"
      aria-label="Verified vendor"
      title="Verified vendor"
    >
      <svg viewBox="0 0 12 12" className="w-2 h-2" fill="none">
        <path
          d="M2.5 6.2L4.8 8.5L9.5 3.5"
          stroke="#0F2E28"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

function FinalCTA() {
  return (
    <section className="max-w-5xl mx-auto px-5 py-20 text-center">
      <h2 className="font-display font-semibold text-3xl sm:text-4xl text-ink max-w-xl mx-auto leading-tight">
        Ready to buy — or sell — with confidence?
      </h2>
      <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <a
          href="#signup-buyer"
          className="text-center font-bold text-sm px-6 py-3.5 rounded-full bg-teal text-paper hover:bg-teal-deep transition-colors"
        >
          Start browsing
        </a>
        <a
          href="#signup-vendor"
          className="text-center font-bold text-sm px-6 py-3.5 rounded-full border border-ink/15 text-ink hover:border-ink/40 transition-colors"
        >
          Sell on Creve
        </a>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="max-w-5xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="font-display font-semibold text-ink/80">Creve</span>
        <span className="text-xs text-ink/45">
          Made for FUTO students. Not affiliated with the university.
        </span>
      </div>
    </footer>
  )
}

export default Landing

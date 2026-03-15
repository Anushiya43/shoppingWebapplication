import { useState } from 'react'

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-primary selection:text-white">
      {/* Mobile Navbar */}
      <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-white/10 px-6 py-4">
        <div className="flex justify-between items-center max-w-7xl mx-auto">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary-light to-secondary bg-clip-text text-transparent">
            FreshShop
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
            </svg>
          </button>

          {/* Desktop Nav */}
          <div className="hidden md:flex gap-8 items-center">
            <a href="#" className="text-white/70 hover:text-white transition-colors">Products</a>
            <a href="#" className="text-white/70 hover:text-white transition-colors">Categories</a>
            <a href="#" className="px-6 py-2 bg-primary rounded-full hover:bg-primary-light transition-all shadow-lg shadow-primary/20">Login</a>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-slate-800 border-b border-white/10 py-6 px-6 animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-6">
              <a href="#" className="text-lg">Products</a>
              <a href="#" className="text-lg">Categories</a>
              <button className="w-full py-4 bg-primary rounded-xl font-bold">Login with Google</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <main className="px-6 py-12 max-w-7xl mx-auto">
        <section className="text-center py-20 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/20 blur-[120px] rounded-full -z-10"></div>
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight">
            The Future of <br />
            <span className="bg-gradient-to-r from-primary-light via-secondary to-primary-dark bg-clip-text text-transparent">
              Modern Shopping
            </span>
          </h1>
          <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Experience the most premium, mobile-first ecommerce platform built with speed and aesthetics in mind.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold hover:scale-105 transition-transform">
              Start Shopping
            </button>
            <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-full font-bold hover:bg-white/10 transition-colors">
              View Analytics
            </button>
          </div>
        </section>

        {/* Feature Cards Preview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
          {[
            { title: 'Ultra Fast', desc: 'Optimized for performance and blazing fast load times.' },
            { title: 'Secure', desc: 'Enterprise-grade security with Google OAuth integration.' },
            { title: 'Scalable', desc: 'Built on a robust NestJS and PostgreSQL foundation.' }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/5 hover:border-primary/30 transition-colors group">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <span className="text-primary text-xl">✨</span>
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-white/50 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </section>
      </main>
    </div>
  )
}

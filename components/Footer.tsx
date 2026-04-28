import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Phone, Mail, MapPin, ArrowRight, Shield, Clock, Leaf } from 'lucide-react';
import whiteLogo from '@/assets/HonorCleaners-WhiteLogo.png';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 relative overflow-hidden">
      {/* Top accent line */}
      <div className="h-0.5 bg-brand-600" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Trust bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-14 pb-14 border-b border-gray-800">
          {[
            { icon: Shield, label: 'Licensed & Insured', desc: 'Full coverage in MA' },
            { icon: Leaf, label: 'Eco-Friendly', desc: 'Non-toxic products' },
            { icon: Clock, label: 'Same-Week Booking', desc: 'Fast scheduling' },
            { icon: Sparkles, label: '100% Guarantee', desc: 'Free re-clean' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                <item.icon className="h-5 w-5 text-brand-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{item.label}</p>
                <p className="text-gray-500 text-xs">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1">
            <div className="mb-5">
              <Image
                src={whiteLogo}
                alt="Honor Cleaning Co."
                height={40}
                style={{ width: 'auto', height: '40px' }}
              />
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-6">
              Professional commercial cleaning throughout Massachusetts.
              Keeping businesses spotless since day one.
            </p>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-brand-500/10 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full border border-brand-500/20">
                <Shield className="h-3 w-3" /> Licensed &amp; Insured
              </span>
            </div>
          </div>

          {/* Services column */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider font-display">Services</h3>
            <ul className="space-y-3 text-sm">
              {['Home Cleaning', 'Deep Clean', 'Move-In / Move-Out', 'Office Cleaning', 'Retail & Storefront', 'Medical & Clinic', 'Industrial & Warehouse'].map((service) => (
                <li key={service}>
                  <Link href="/booking" className="text-gray-400 hover:text-brand-400 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider font-display">Company</h3>
            <ul className="space-y-3 text-sm">
              {[
                { label: 'About Us', href: '/about' },
                { label: 'Book Online', href: '/booking' },
                { label: 'Customer Login', href: '/login' },
                { label: 'Privacy Policy', href: '/privacy-policy' },
                { label: 'Create Account', href: '/register' },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-gray-400 hover:text-brand-400 transition-colors duration-200 flex items-center gap-2 group">
                    <ArrowRight className="h-3 w-3 opacity-0 -ml-5 group-hover:opacity-100 group-hover:ml-0 transition-all duration-200" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-white font-bold mb-5 text-sm uppercase tracking-wider font-display">Get in Touch</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Link href="tel:+15083331838" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 group-hover:bg-brand-600 flex items-center justify-center transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium">(508) 333-1838</p>
                    <p className="text-xs text-gray-500">Mon-Sat 7AM - 7PM</p>
                  </div>
                </Link>
              </li>
              <li>
                <Link href="mailto:hello@honorcleaning.com" className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 group-hover:bg-ocean-600 flex items-center justify-center transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium">hello@honorcleaning.com</p>
                    <p className="text-xs text-gray-500">We reply within 2 hours</p>
                  </div>
                </Link>
              </li>
              <li>
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-9 h-9 rounded-xl bg-gray-800 flex items-center justify-center">
                    <MapPin className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-white font-medium">738 Main St, Waltham</p>
                    <p className="text-xs text-gray-500">MA 02451, USA</p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-800 mt-14 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} Honor Cleaning Co. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-xs text-gray-500">
            <Link href="/privacy-policy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span className="w-1 h-1 bg-gray-700 rounded-full" />
            <span>Serving Massachusetts with pride</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

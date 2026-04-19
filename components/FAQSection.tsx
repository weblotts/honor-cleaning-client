'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, ChevronDown, Plus, Minus, MessageCircle, Phone, Mail, ArrowRight, Sparkles } from 'lucide-react';

const categories = [
  { key: 'all', label: 'All Questions' },
  { key: 'services', label: 'Services' },
  { key: 'pricing', label: 'Pricing & Plans' },
  { key: 'trust', label: 'Trust & Safety' },
];

const faqs = [
  {
    q: 'What types of commercial spaces do you clean?',
    a: 'We clean offices, coworking spaces, retail stores, medical clinics, dental offices, warehouses, industrial facilities, restaurants, and more. If you have a commercial space that needs cleaning, we can create a custom plan for you.',
    category: 'services',
  },
  {
    q: 'What areas do you serve?',
    a: 'We serve the entire Greater Boston metro area including Cambridge, Somerville, Brookline, Newton, Quincy, and 15+ surrounding towns. If you are unsure, enter your zip code during booking and we will confirm availability.',
    category: 'services',
  },
  {
    q: 'Do you provide after-hours cleaning?',
    a: 'Yes! Most of our commercial clients prefer after-hours service so their business operations are not disrupted. We offer evening, overnight, and weekend cleaning at no additional charge.',
    category: 'services',
  },
  {
    q: 'Do we need to provide cleaning supplies?',
    a: 'No. Our team arrives fully equipped with all professional-grade, eco-friendly cleaning supplies and commercial equipment. If your facility requires specific products (e.g., healthcare-grade disinfectants), we accommodate that as well.',
    category: 'services',
  },
  {
    q: 'How is pricing determined?',
    a: 'Every commercial space is unique, so we provide custom quotes based on your facility size, type, cleaning frequency, and specific requirements. Request a quote online and we will send a detailed proposal within 24 hours.',
    category: 'pricing',
  },
  {
    q: 'Are your cleaners background-checked and insured?',
    a: 'Absolutely. Every team member undergoes a thorough background check, reference verification, and in-person interview. We carry full liability insurance and workers compensation coverage to protect your business.',
    category: 'trust',
  },
  {
    q: 'What is your satisfaction guarantee?',
    a: 'If you are not 100% satisfied with any part of our service, contact us within 24 hours and we will send a team back to re-clean the area at no additional cost. No questions asked.',
    category: 'trust',
  },
  {
    q: 'Do you offer recurring maintenance contracts?',
    a: 'Yes! We offer daily, weekly, bi-weekly, and monthly maintenance plans with up to 20% savings. No long-term lock-in — you can adjust frequency or cancel anytime from your dashboard.',
    category: 'pricing',
  },
];

function FAQItem({ q, a, index }: { q: string; a: string; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={`group relative rounded-2xl transition-all duration-300 ${
        open
          ? 'bg-white shadow-lg shadow-brand-500/5 ring-1 ring-brand-200'
          : 'bg-white shadow-sm hover:shadow-md ring-1 ring-gray-100 hover:ring-gray-200'
      }`}
    >
      <button
        className="w-full flex items-start gap-4 px-6 py-5 text-left"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <span
          className={`shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-colors duration-200 ${
            open
              ? 'bg-brand-600 text-white'
              : 'bg-gray-100 text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-600'
          }`}
        >
          {open ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        </span>
        <span className={`font-semibold pt-1 pr-4 transition-colors duration-200 ${open ? 'text-brand-700' : 'text-gray-900'}`}>
          {q}
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-6 pl-[4.5rem] text-gray-500 leading-relaxed text-[15px]">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState('all');

  const filtered = activeCategory === 'all'
    ? faqs
    : faqs.filter((faq) => faq.category === activeCategory);

  return (
    <section className="py-28 bg-white relative overflow-hidden">

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 bg-ocean-50 border border-ocean-100 text-ocean-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <MessageCircle className="h-4 w-4" />
            Got Questions?
          </div>
          <h2 className="section-heading">
            Frequently Asked{' '}
            <span className="gradient-text">Questions</span>
          </h2>
          <p className="section-subheading">
            Everything you need to know before scheduling your first commercial cleaning.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-colors duration-200 ${
                activeCategory === cat.key
                  ? 'bg-brand-600 text-white'
                  : 'bg-white text-gray-600 hover:text-brand-700 hover:bg-brand-50 ring-1 ring-gray-200 hover:ring-brand-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* FAQ list */}
        <div className="space-y-3">
          {filtered.map((faq, i) => (
            <FAQItem key={faq.q} q={faq.q} a={faq.a} index={i} />
          ))}
        </div>

        {/* Contact CTA card */}
        <div className="mt-14 bg-gray-900 rounded-3xl p-8 md:p-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-xs font-medium px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="h-3 w-3" />
                We&apos;re here to help
              </div>
              <h3 className="text-xl font-bold text-white font-display mb-2">
                Still have questions?
              </h3>
              <p className="text-gray-400 text-sm">
                Our team typically responds within 2 hours during business hours.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <a
                href="tel:+15083331838"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-gray-900 font-semibold text-sm hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
              >
                <Phone className="h-4 w-4 text-brand-600" />
                (508) 333-1838
              </a>
              <a
                href="mailto:hello@honorcleaning.com"
                className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl border border-gray-700 text-gray-300 font-medium text-sm hover:bg-gray-800 hover:text-white hover:-translate-y-0.5 transition-all duration-300"
              >
                <Mail className="h-4 w-4 text-ocean-400" />
                Email Us
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

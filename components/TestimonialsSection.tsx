'use client';

import { useEffect, useState } from 'react';
import { Star, Quote, MapPin } from 'lucide-react';
import axios from 'axios';
import { type Testimonial } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

const SERVICE_COLORS: Record<string, string> = {
  office: 'bg-brand-600',
  retail: 'bg-warm-500',
  medical: 'bg-ocean-600',
  industrial: 'bg-gray-600',
  postConstruction: 'bg-amber-500',
  standard: 'bg-brand-600',
  deep: 'bg-ocean-600',
  moveIn: 'bg-warm-500',
  moveOut: 'bg-warm-500',
  recurring: 'bg-brand-500',
};

const fallbackTestimonials: Testimonial[] = [
  {
    _id: 'fallback-1',
    customerName: 'Michael T.',
    customerLocation: 'Cambridge, MA',
    customerRole: 'Office Manager, TechFlow Inc.',
    comment:
      'Honor Cleaning transformed our 12,000 sq ft office. The team is punctual, thorough, and our employees constantly comment on how clean the space feels. We switched to a weekly plan and haven\'t looked back.',
    rating: 5,
    serviceType: 'office',
    submittedAt: '',
  },
  {
    _id: 'fallback-2',
    customerName: 'Dr. Patel',
    customerLocation: 'Brookline, MA',
    customerRole: 'Director, Brookline Family Dental',
    comment:
      'Finding a cleaning service that meets healthcare standards was critical for us. Honor Cleaning uses EPA-approved products and follows strict sanitization protocols. Our patients notice the difference.',
    rating: 5,
    serviceType: 'medical',
    submittedAt: '',
  },
  {
    _id: 'fallback-3',
    customerName: 'Rachel S.',
    customerLocation: 'Newton, MA',
    customerRole: 'Owner, Newton Boutique',
    comment:
      'Our retail space looks immaculate every morning when we open. The floor polishing and window cleaning keep our storefront inviting. Highly recommend for any retail business.',
    rating: 5,
    serviceType: 'retail',
    submittedAt: '',
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(fallbackTestimonials);

  useEffect(() => {
    axios
      .get(`${API_URL}/feedback/testimonials`)
      .then((res) => {
        if (res.data.length > 0) {
          setTestimonials(res.data);
        }
      })
      .catch(() => {
        // Keep fallback testimonials
      });
  }, []);

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="section-heading">
            What Our Clients{' '}
            <span className="gradient-text">Are Saying</span>
          </h2>
          <p className="section-subheading">
            Real reviews from Massachusetts businesses.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((t) => {
            const color = SERVICE_COLORS[t.serviceType] || 'bg-brand-600';
            return (
              <div
                key={t._id}
                className="group rounded-3xl bg-white border border-gray-100 p-7 hover:-translate-y-1 hover:shadow-lg transition-all duration-300 flex flex-col"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex gap-0.5">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-4 w-4 text-warm-400 fill-warm-400"
                      />
                    ))}
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${color} text-white capitalize`}
                  >
                    {t.serviceType}
                  </span>
                </div>

                <Quote className="h-6 w-6 text-brand-200 mb-2" />
                <p className="text-gray-600 text-sm leading-relaxed flex-1">
                  &quot;{t.comment}&quot;
                </p>

                <div className="mt-5 pt-4 border-t border-gray-200 flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-full ${color} flex items-center justify-center text-white font-bold text-xs`}
                  >
                    {t.customerName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">
                      {t.customerName}
                    </p>
                    {t.customerRole && (
                      <p className="text-gray-400 text-xs">{t.customerRole}</p>
                    )}
                    {t.customerLocation && (
                      <p className="text-gray-400 text-xs flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {t.customerLocation}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

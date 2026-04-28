import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FAQSection from "@/components/FAQSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import {
  Sparkles,
  Shield,
  Clock,
  Star,
  CheckCircle,
  ArrowRight,
  Phone,
  Building2,
  CalendarCheck,
  Leaf,
  FileText,
  Briefcase,
  Stethoscope,
  Store,
  Warehouse,
  HardHat,
  Users,
  Home,
  SprayCan,
  DoorOpen,
} from "lucide-react";

const homeServices = [
  {
    title: "Standard Home Clean",
    price: "From $150",
    description:
      "Regular maintenance cleaning for homes and apartments. Kitchens, bathrooms, bedrooms, and living areas.",
    features: [
      "Kitchen surfaces & appliances",
      "Bathroom scrub & sanitize",
      "Vacuuming & mopping",
      "Dusting & trash removal",
    ],
    icon: Home,
    bg: "bg-emerald-600",
  },
  {
    title: "Deep Clean",
    price: "From $250",
    description:
      "Top-to-bottom intensive clean. Perfect for a first clean, seasonal reset, or long-overdue refresh.",
    features: [
      "Inside ovens & fridges",
      "Baseboards & light fixtures",
      "Cabinet interiors",
      "Window sills & blinds",
    ],
    icon: SprayCan,
    bg: "bg-teal-600",
  },
  {
    title: "Move-In / Move-Out",
    price: "From $300",
    description:
      "Spotless handover cleaning for tenants and landlords. Leave it — or find it — in perfect condition.",
    features: [
      "Full deep clean, every room",
      "Inside all cabinets & closets",
      "Appliance interiors",
      "Walls, switches & door frames",
    ],
    icon: DoorOpen,
    bg: "bg-amber-500",
  },
];

const commercialServices = [
  {
    title: "Office Cleaning",
    description:
      "Daily, weekly, or monthly cleaning for offices, coworking spaces, and corporate environments.",
    features: [
      "Workstation & desk sanitizing",
      "Restroom deep cleaning",
      "Break room & kitchen upkeep",
      "Trash & recycling removal",
    ],
    icon: Briefcase,
    bg: "bg-brand-600",
  },
  {
    title: "Retail & Storefront",
    description:
      "Keep your customer-facing spaces spotless and inviting every day.",
    features: [
      "Floor care & polishing",
      "Window & glass cleaning",
      "Display & fixture dusting",
      "Entryway & lobby maintenance",
    ],
    icon: Store,
    bg: "bg-blue-600",
  },
  {
    title: "Medical & Clinic",
    description:
      "Healthcare-grade sanitization for clinics, dental offices, and wellness centers.",
    features: [
      "EPA-approved disinfectants",
      "Exam room sanitization",
      "Waiting area deep clean",
      "Biohazard-safe protocols",
    ],
    icon: Stethoscope,
    bg: "bg-amber-500",
  },
  {
    title: "Industrial & Warehouse",
    description:
      "Heavy-duty cleaning for warehouses, factories, and post-construction sites.",
    features: [
      "Industrial floor scrubbing",
      "Dust & debris removal",
      "Loading dock cleaning",
      "Post-construction cleanup",
    ],
    icon: Warehouse,
    bg: "bg-violet-600",
  },
];

const howItWorks = [
  {
    step: "1",
    title: "Request a Quote",
    description:
      "Tell us about your facility and get a custom cleaning proposal. Takes under 2 minutes.",
    icon: CalendarCheck,
  },
  {
    step: "2",
    title: "Custom Proposal",
    description:
      "We assess your space and send a tailored cleaning plan within 24 hours. You approve before we start.",
    icon: FileText,
  },
  {
    step: "3",
    title: "We Clean, You Thrive",
    description:
      "Our insured, background-checked team arrives on schedule. Not satisfied? Free re-clean within 24 hours.",
    icon: Building2,
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        {/* ── HERO ── */}
        <section className="pt-32 pb-20 bg-white">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">
                <Shield className="h-3 w-3" /> Licensed &amp; Insured
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">
                <Leaf className="h-3 w-3" /> Eco-Friendly
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 border border-gray-200 px-3 py-1.5 rounded-full">
                <CheckCircle className="h-3 w-3" /> 100% Satisfaction
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight font-display">
              Professional Cleaning
              <br />
              <span className="text-brand-600">for Every Space</span>
            </h1>

            <p className="mt-6 text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
              Expert cleaning for homes, offices, retail, medical, and
              industrial spaces across Greater Boston. Background-checked staff
              and a satisfaction guarantee on every job.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-brand-600 text-white font-semibold rounded-xl hover:bg-brand-700 transition-colors"
              >
                Get a Free Quote
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/#services"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                Our Services
              </Link>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-400">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 text-amber-400 fill-amber-400"
                  />
                ))}
              </div>
              <span>
                <strong className="text-gray-700">4.9</strong> from 200+
                businesses served
              </span>
              <span className="hidden sm:flex items-center gap-1.5 text-gray-300">
                <span className="w-px h-4 bg-gray-200" />
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  Same-week availability
                </span>
              </span>
            </div>
          </div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section className="py-10 border-y border-gray-100 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-xs font-semibold text-gray-400 uppercase tracking-wider mb-6">
              Trusted by businesses across Massachusetts
            </p>
            <div className="flex flex-wrap justify-center gap-8">
              {[
                { icon: Home, label: "Homes" },
                { icon: Building2, label: "Apartments" },
                { icon: Briefcase, label: "Corporate Offices" },
                { icon: Store, label: "Retail Stores" },
                { icon: Stethoscope, label: "Medical Clinics" },
                { icon: Warehouse, label: "Warehouses" },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center gap-2 text-gray-400"
                >
                  <item.icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="section-heading">
                How It <span className="text-brand-600">Works</span>
              </h2>
              <p className="section-subheading">
                3 simple steps to a professionally cleaned space. No phone
                calls, no hassle.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 mx-auto rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                    <item.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <div className="text-xs font-bold text-brand-500 mb-1 uppercase tracking-wider">
                    Step {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2 font-display">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SERVICES ── */}
        <section id="services" className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="section-heading">
                Cleaning for{" "}
                <span className="text-brand-600">Every Space</span>
              </h2>
              <p className="section-subheading">
                From homes to offices — eco-friendly, background-checked, no
                hidden fees.
              </p>
            </div>

            {/* Home & Residential */}
            <div className="mb-10">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Home className="h-3.5 w-3.5" /> Home &amp; Residential
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {homeServices.map((service) => (
                  <div
                    key={service.title}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${service.bg} flex items-center justify-center mb-4`}
                    >
                      <service.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 font-display">
                      {service.title}
                    </h4>
                    <p className="text-lg font-bold text-brand-600 mt-1">
                      {service.price}
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex-1 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {service.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs text-gray-500"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/booking"
                      className="mt-5 block text-center py-2.5 rounded-lg bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors"
                    >
                      Book Now
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Business & Commercial */}
            <div id="pricing">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Briefcase className="h-3.5 w-3.5" /> Business &amp; Commercial
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {commercialServices.map((service) => (
                  <div
                    key={service.title}
                    className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow flex flex-col"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl ${service.bg} flex items-center justify-center mb-4`}
                    >
                      <service.icon className="h-5 w-5 text-white" />
                    </div>
                    <h4 className="font-bold text-gray-900 font-display">
                      {service.title}
                    </h4>
                    <p className="text-sm text-gray-400 mt-1 font-medium">
                      Custom quote
                    </p>
                    <p className="text-sm text-gray-500 mt-2 flex-1 leading-relaxed">
                      {service.description}
                    </p>
                    <ul className="mt-4 space-y-1.5">
                      {service.features.map((f) => (
                        <li
                          key={f}
                          className="flex items-start gap-2 text-xs text-gray-500"
                        >
                          <CheckCircle className="h-3.5 w-3.5 text-brand-500 mt-0.5 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/booking"
                      className="mt-5 block text-center py-2.5 rounded-lg border border-brand-200 text-brand-700 text-sm font-semibold hover:bg-brand-50 transition-colors"
                    >
                      Get a Quote
                    </Link>
                  </div>
                ))}
              </div>

              {/* Recurring banner */}
              <div className="mt-8 rounded-2xl bg-brand-600 p-7 flex flex-col md:flex-row items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-white font-display">
                    Save Up to 20% with a Maintenance Contract
                  </h3>
                  <p className="text-brand-100/80 text-sm mt-1">
                    Weekly, bi-weekly, or monthly — no long-term lock-in, cancel
                    anytime.
                  </p>
                </div>
                <Link
                  href="/booking"
                  className="shrink-0 inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-6 py-3 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                >
                  Start a Plan
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="py-20 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-12">
              <h2 className="section-heading">
                Why Businesses{" "}
                <span className="text-brand-600">Choose Us</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  icon: Shield,
                  title: "Fully Licensed & Insured",
                  desc: "Complete liability coverage and workers' compensation. Your business is protected.",
                },
                {
                  icon: Users,
                  title: "Background-Checked Teams",
                  desc: "Every team member is vetted, trained, and supervised.",
                },
                {
                  icon: Leaf,
                  title: "Green-Certified Products",
                  desc: "EPA-approved, non-toxic products safe for employees and the environment.",
                },
                {
                  icon: Clock,
                  title: "After-Hours Service",
                  desc: "Evenings, nights, and weekends available at no extra charge.",
                },
                {
                  icon: Sparkles,
                  title: "100% Satisfaction Guarantee",
                  desc: "Not happy? We'll re-clean the area within 24 hours at no cost.",
                },
                {
                  icon: HardHat,
                  title: "Industry-Specific Protocols",
                  desc: "Specialized procedures for healthcare, food service, retail, and industrial.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-brand-100 hover:bg-brand-50/30 transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <item.icon className="h-5 w-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm font-display">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <TestimonialsSection />

        {/* ── FAQ ── */}
        <FAQSection />

        {/* ── CTA ── */}
        <section className="py-20 bg-gray-900 text-center">
          <div className="max-w-2xl mx-auto px-4">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Ready for a Cleaner Workspace?
            </h2>
            <p className="mt-4 text-gray-400 leading-relaxed">
              Join hundreds of Massachusetts businesses that trust Honor
              Cleaning to keep their facilities spotless.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-500 transition-colors"
              >
                Get Your Free Quote
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="tel:+15083331838"
                className="inline-flex items-center gap-2 px-8 py-4 text-white font-semibold rounded-xl border border-gray-700 hover:bg-gray-800 transition-colors"
              >
                <Phone className="h-5 w-5" />
                (508) 333-1838
              </Link>
            </div>
            <p className="mt-5 text-gray-500 text-sm">
              No credit card required. Free cancellation up to 24 hours before
              service.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

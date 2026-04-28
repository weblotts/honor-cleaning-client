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
  ChevronDown,
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
    popular: true,
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
    bg: "bg-warm-500",
  },
];

const commercialServices = [
  {
    title: "Office Cleaning",
    price: "Custom",
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
    price: "Custom",
    description:
      "Keep your customer-facing spaces spotless and inviting every day.",
    features: [
      "Floor care & polishing",
      "Window & glass cleaning",
      "Display & fixture dusting",
      "Entryway & lobby maintenance",
    ],
    popular: true,
    icon: Store,
    bg: "bg-ocean-600",
  },
  {
    title: "Medical & Clinic",
    price: "Custom",
    description:
      "Healthcare-grade sanitization for clinics, dental offices, and wellness centers.",
    features: [
      "EPA-approved disinfectants",
      "Exam room sanitization",
      "Waiting area deep clean",
      "Biohazard-safe protocols",
    ],
    icon: Stethoscope,
    bg: "bg-warm-500",
  },
  {
    title: "Industrial & Warehouse",
    price: "Custom",
    description:
      "Heavy-duty cleaning for warehouses, factories, and post-construction sites.",
    features: [
      "Industrial floor scrubbing",
      "Dust & debris removal",
      "Loading dock cleaning",
      "Post-construction cleanup",
    ],
    icon: Warehouse,
    bg: "bg-violet-500",
  },
];

const services = commercialServices;

const howItWorks = [
  {
    step: "01",
    title: "Request a Quote",
    description:
      "Tell us about your facility and get a custom cleaning proposal. Takes under 2 minutes.",
    icon: CalendarCheck,
    bg: "bg-brand-600",
  },
  {
    step: "02",
    title: "Custom Proposal",
    description:
      "We assess your space and send a tailored cleaning plan and quote within 24 hours. You approve before we start.",
    icon: FileText,
    bg: "bg-ocean-600",
  },
  {
    step: "03",
    title: "We Clean, You Thrive",
    description:
      "Our insured, background-checked team arrives on schedule. Not satisfied? Free re-clean within 24 hours.",
    icon: Building2,
    bg: "bg-warm-500",
  },
];

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="overflow-hidden">
        {/* ── HERO ── */}
        <section className="relative min-h-screen flex items-center bg-brand-950">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 lg:py-36 w-full">
            <div className="grid lg:grid-cols-12 gap-16 lg:gap-12 items-center">
              {/* Left: Text content */}
              <div className="lg:col-span-7 animate-slide-up">
                {/* Trust badges */}
                <div className="flex flex-wrap items-center gap-3 mb-10">
                  <div className="inline-flex items-center gap-2 bg-white/[0.06] text-brand-200 text-xs font-medium px-4 py-2 rounded-full border border-white/[0.08]">
                    <Shield className="h-3.5 w-3.5 text-brand-400" />
                    Licensed &amp; Insured
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/[0.06] text-brand-200 text-xs font-medium px-4 py-2 rounded-full border border-white/[0.08]">
                    <Leaf className="h-3.5 w-3.5 text-emerald-400" />
                    Eco-Friendly
                  </div>
                  <div className="inline-flex items-center gap-2 bg-white/[0.06] text-brand-200 text-xs font-medium px-4 py-2 rounded-full border border-white/[0.08]">
                    <CheckCircle className="h-3.5 w-3.5 text-warm-400" />
                    100% Satisfaction
                  </div>
                </div>

                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.05] tracking-tight font-display">
                  Commercial Clean,
                  <br />
                  <span className="text-brand-400 mt-2 inline-block">
                    Professional Results
                  </span>
                </h1>

                <p className="mt-8 text-lg sm:text-xl text-brand-100/60 max-w-xl leading-relaxed">
                  Professional cleaning for homes, apartments, offices, retail spaces,
                  and more across Greater Boston.
                  Background-checked staff and a satisfaction guarantee on every job.
                </p>

                {/* CTA buttons */}
                <div className="mt-10 flex flex-wrap gap-4">
                  <Link
                    href="/booking"
                    className="inline-flex items-center gap-2.5 px-9 py-4.5 bg-brand-500 text-white font-bold rounded-2xl text-lg hover:bg-brand-400 transition-colors duration-200"
                  >
                    Get a Free Quote
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    href="/#services"
                    className="inline-flex items-center gap-2 px-9 py-4.5 text-white/90 font-semibold rounded-2xl text-lg border border-white/15 hover:bg-white/[0.08] hover:border-white/25 transition-all duration-200"
                  >
                    Our Services
                  </Link>
                </div>

                {/* Social proof */}
                <div className="mt-14 flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-4">
                    <div className="flex -space-x-2.5">
                      {[
                        { initial: "M", bg: "bg-brand-500" },
                        { initial: "D", bg: "bg-ocean-500" },
                        { initial: "R", bg: "bg-warm-500" },
                        { initial: "K", bg: "bg-violet-500" },
                      ].map((item, i) => (
                        <div
                          key={i}
                          className={`w-10 h-10 rounded-full border-[2.5px] border-brand-950 flex items-center justify-center text-xs font-bold text-white ${item.bg}`}
                        >
                          {item.initial}
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-4 w-4 text-warm-400 fill-warm-400"
                            />
                          ))}
                        </div>
                        <span className="font-bold text-white text-sm ml-0.5">4.9</span>
                      </div>
                      <span className="text-brand-300/50 text-xs mt-0.5">
                        from 200+ businesses served
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-white/10" />
                  <div className="hidden sm:flex items-center gap-2 text-brand-200/50 text-sm">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Same-week availability
                  </div>
                </div>
              </div>

              {/* Right: Visual showcase */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="relative w-full h-[560px]">
                  {/* Main job card */}
                  <div className="absolute top-6 left-0 right-0 bg-white/[0.07] rounded-3xl border border-white/[0.1] overflow-hidden">
                    <div className="h-1 bg-brand-500" />
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-brand-600 flex items-center justify-center">
                            <Building2 className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="text-white font-bold text-sm">
                              Office Deep Clean
                            </h3>
                            <p className="text-brand-300/50 text-xs">
                              Today 6 PM · Financial District
                            </p>
                          </div>
                        </div>
                        <div className="px-2.5 py-1 rounded-full bg-brand-500/20 border border-brand-500/20">
                          <span className="text-brand-300 text-[11px] font-semibold">
                            In Progress
                          </span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        {[
                          { text: "Workstation sanitizing", done: true },
                          { text: "Restroom deep clean", done: true },
                          { text: "Floor scrub & polish", done: false },
                          { text: "Final walkthrough", done: false },
                        ].map((item) => (
                          <div
                            key={item.text}
                            className="flex items-center gap-2.5"
                          >
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center ${item.done ? "bg-brand-500/25" : "bg-white/[0.06]"}`}
                            >
                              <CheckCircle
                                className={`h-3.5 w-3.5 ${item.done ? "text-brand-400" : "text-white/20"}`}
                              />
                            </div>
                            <span
                              className={`text-sm ${item.done ? "text-brand-200/60 line-through" : "text-white/70"}`}
                            >
                              {item.text}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 pt-3 border-t border-white/[0.06]">
                        <div className="flex justify-between text-[11px] text-brand-300/40 mb-1.5">
                          <span>Progress</span>
                          <span className="text-brand-300/60 font-medium">50%</span>
                        </div>
                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                          <div className="h-full w-1/2 bg-brand-500 rounded-full" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review badge */}
                  <div className="absolute bottom-20 -left-4 bg-white rounded-2xl p-4 shadow-xl animate-float-delayed border border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-warm-50 flex items-center justify-center">
                        <Star className="h-5 w-5 text-warm-500 fill-warm-500" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">
                          Outstanding Work!
                        </p>
                        <div className="flex gap-0.5 mt-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className="h-3 w-3 text-warm-400 fill-warm-400"
                            />
                          ))}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">
                          TechFlow Inc. · Cambridge
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Stats badge */}
                  <div className="absolute bottom-6 right-0 bg-brand-600 rounded-2xl p-4 animate-float-delayed">
                    <p className="text-white/60 text-[10px] uppercase tracking-wider font-medium">
                      Businesses Served
                    </p>
                    <p className="text-white text-2xl font-extrabold font-display mt-0.5">
                      200+
                    </p>
                    <p className="text-brand-200/50 text-[10px]">across Greater Boston</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce-gentle">
            <span className="text-brand-400/30 text-[10px] uppercase tracking-widest font-medium">
              Scroll
            </span>
            <ChevronDown className="h-5 w-5 text-brand-400/40" />
          </div>
        </section>

        {/* ── TRUSTED BY ── */}
        <section className="py-12 bg-gray-50 border-y border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-sm text-gray-400 font-medium uppercase tracking-wider mb-8">
              Trusted by businesses across Massachusetts
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 items-center justify-items-center">
              {[
                { icon: Home, label: "Homes" },
                { icon: Building2, label: "Apartments" },
                { icon: Briefcase, label: "Corporate Offices" },
                { icon: Store, label: "Retail Stores" },
                { icon: Stethoscope, label: "Medical Clinics" },
                { icon: Warehouse, label: "Warehouses" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 text-gray-400">
                  <item.icon className="h-6 w-6" />
                  <span className="text-sm font-semibold">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-heading">
                How It <span className="text-brand-600">Works</span>
              </h2>
              <p className="section-subheading">
                Get your facility professionally cleaned in 3 simple steps. No
                phone calls, no hassle.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 lg:gap-14">
              {howItWorks.map((item, idx) => (
                <div key={item.step} className="relative group">
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-14 left-[60%] w-[85%] border-t-2 border-dashed border-gray-200" />
                  )}
                  <div className="relative text-center">
                    <div className="relative inline-block">
                      <div
                        className={`w-20 h-20 mx-auto rounded-3xl ${item.bg} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
                      >
                        <item.icon className="h-9 w-9 text-white" />
                      </div>
                      <span className="absolute -top-2 -right-2 w-8 h-8 bg-gray-900 text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {item.step}
                      </span>
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-gray-900 font-display">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-gray-500 leading-relaxed max-w-xs mx-auto">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── OUR SERVICES ── */}
        <section id="services" className="py-24 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-4">
                <Sparkles className="h-3.5 w-3.5" />
                Our Services
              </div>
              <h2 className="section-heading">
                Cleaning for <span className="text-brand-600">Every Space</span>
              </h2>
              <p className="section-subheading">
                From homes to offices — professional cleaning you can trust.
                Eco-friendly products, background-checked cleaners, no hidden fees.
              </p>
            </div>

            {/* Home & Residential */}
            <div className="mb-14">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Home className="h-3.5 w-3.5" />
                  Home &amp; Residential
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid sm:grid-cols-3 gap-6">
                {homeServices.map((service) => (
                  <div
                    key={service.title}
                    className={`relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                      service.popular
                        ? "bg-teal-600 text-white shadow-xl lg:scale-105"
                        : "bg-white border border-gray-200 hover:shadow-lg"
                    }`}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warm-400 text-warm-900 text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${service.popular ? "bg-white/20" : service.bg}`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold font-display ${service.popular ? "text-white" : "text-gray-900"}`}>
                      {service.title}
                    </h3>
                    <p className={`text-2xl font-bold mt-2 ${service.popular ? "text-white" : "text-gray-900"}`}>
                      {service.price}
                    </p>
                    <p className={`mt-2 text-sm leading-relaxed flex-1 ${service.popular ? "text-teal-100" : "text-gray-500"}`}>
                      {service.description}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${service.popular ? "text-emerald-300" : "text-emerald-500"}`} />
                          <span className={service.popular ? "text-teal-50" : "text-gray-600"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/booking"
                      className={`mt-6 block text-center w-full px-5 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 ${
                        service.popular
                          ? "bg-white text-teal-700 hover:bg-teal-50"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      Book Now
                    </Link>
                  </div>
                ))}
              </div>
            </div>

            {/* Business & Commercial */}
            <div id="pricing">
              <div className="flex items-center gap-3 mb-6">
                <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Briefcase className="h-3.5 w-3.5" />
                  Business &amp; Commercial
                </div>
                <div className="flex-1 h-px bg-gray-200" />
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {services.map((service) => (
                  <div
                    key={service.title}
                    className={`relative rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 flex flex-col ${
                      service.popular
                        ? "bg-ocean-600 text-white shadow-xl lg:scale-105"
                        : "bg-white border border-gray-200 hover:shadow-lg"
                    }`}
                  >
                    {service.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-warm-400 text-warm-900 text-xs font-bold px-4 py-1 rounded-full">
                        Most Popular
                      </div>
                    )}
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${service.popular ? "bg-white/20" : service.bg}`}>
                      <service.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className={`text-lg font-bold ${service.popular ? "text-white" : "text-gray-900"} font-display`}>
                      {service.title}
                    </h3>
                    <p className={`text-2xl font-bold mt-2 ${service.popular ? "text-white" : "text-gray-900"}`}>
                      {service.price}
                      <span className={`text-sm font-normal ${service.popular ? "text-ocean-200" : "text-gray-400"}`}>
                        {" "}quote
                      </span>
                    </p>
                    <p className={`mt-2 text-sm leading-relaxed flex-1 ${service.popular ? "text-ocean-100" : "text-gray-500"}`}>
                      {service.description}
                    </p>
                    <ul className="mt-5 space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <CheckCircle className={`h-4 w-4 mt-0.5 shrink-0 ${service.popular ? "text-brand-300" : "text-brand-500"}`} />
                          <span className={service.popular ? "text-ocean-50" : "text-gray-600"}>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href="/booking"
                      className={`mt-6 block text-center w-full px-5 py-3 rounded-xl font-semibold text-sm transition-colors duration-200 ${
                        service.popular
                          ? "bg-white text-ocean-700 hover:bg-ocean-50"
                          : "bg-brand-600 text-white hover:bg-brand-700"
                      }`}
                    >
                      Get a Quote
                    </Link>
                  </div>
                ))}
              </div>

              {/* Recurring banner */}
              <div className="mt-14 rounded-3xl bg-brand-700 p-8 md:p-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h3 className="text-2xl font-bold text-white font-display">
                      Save Up to 20% with a Maintenance Contract
                    </h3>
                    <p className="mt-2 text-brand-100/80 max-w-lg">
                      Weekly, bi-weekly, or monthly service plans tailored to your
                      facility. No long-term contracts, cancel anytime.
                    </p>
                  </div>
                  <Link
                    href="/booking"
                    className="group shrink-0 inline-flex items-center gap-2 bg-white text-brand-700 font-bold px-7 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors duration-200"
                  >
                    Start a Plan
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── WHY CHOOSE US ── */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="section-heading">
                Why Businesses <span className="text-brand-600">Choose Us</span>
              </h2>
              <p className="section-subheading">
                We understand what commercial spaces demand.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: Shield,
                  title: "Fully Licensed & Insured",
                  desc: "Complete liability coverage and workers' compensation. Your business is protected.",
                },
                {
                  icon: Users,
                  title: "Background-Checked Teams",
                  desc: "Every team member is vetted, trained, and supervised. Security clearance available on request.",
                },
                {
                  icon: Leaf,
                  title: "Green-Certified Products",
                  desc: "EPA-approved, non-toxic cleaning products safe for employees, customers, and the environment.",
                },
                {
                  icon: Clock,
                  title: "After-Hours & Weekend Service",
                  desc: "We work around your schedule. Evenings, nights, and weekends available at no extra charge.",
                },
                {
                  icon: Sparkles,
                  title: "100% Satisfaction Guarantee",
                  desc: "Not happy with any aspect? We'll re-clean the area within 24 hours at no cost.",
                },
                {
                  icon: HardHat,
                  title: "Industry-Specific Protocols",
                  desc: "Specialized cleaning procedures for healthcare, food service, retail, and industrial environments.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="group rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-2xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-100 transition-colors">
                    <item.icon className="h-6 w-6 text-brand-600" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-gray-500 leading-relaxed">
                    {item.desc}
                  </p>
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
        <section className="py-24 bg-gray-900">
          <div className="relative max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-white leading-tight font-display">
              Ready for a Cleaner Workspace?
            </h2>
            <p className="mt-6 text-lg text-gray-400 max-w-xl mx-auto">
              Join hundreds of Massachusetts businesses that trust Honor
              Cleaning to keep their facilities spotless. Get your custom quote
              today.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-10 py-5 bg-brand-600 text-white font-bold rounded-2xl text-lg hover:bg-brand-500 transition-colors duration-200"
              >
                Get Your Free Quote
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="tel:+15083331838"
                className="inline-flex items-center gap-2 px-10 py-5 text-white font-semibold rounded-2xl text-lg border-2 border-white/20 hover:bg-white/10 transition-colors duration-200"
              >
                <Phone className="h-5 w-5" />
                (508) 333-1838
              </Link>
            </div>
            <p className="mt-6 text-gray-500 text-sm">
              No credit card required for quotes. Free cancellation up to 24
              hours before service.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

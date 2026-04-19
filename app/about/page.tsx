import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Sparkles,
  Shield,
  Leaf,
  Heart,
  MapPin,
  Clock,
  CheckCircle,
  ArrowRight,
  Users,
  Target,
  Award,
  Building2,
  Star,
  Phone,
  Zap,

  CalendarCheck,
} from 'lucide-react';

export const metadata = {
  title: 'About Us | Honor Cleaning Co.',
  description:
    'Learn about Honor Cleaning Co. — professional commercial cleaning based in Waltham, MA. Licensed, insured, and committed to eco-friendly practices.',
};

const values = [
  {
    icon: Shield,
    title: 'Reliability',
    description:
      'We show up on time, every time. Our clients trust us with their spaces because we never cut corners.',
    color: 'from-brand-500 to-brand-600',
    bgLight: 'bg-brand-50',
    iconColor: 'text-brand-600',
  },
  {
    icon: Leaf,
    title: 'Eco-Friendly',
    description:
      'We use non-toxic, environmentally responsible products that are safe for your team and the planet.',
    color: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: Heart,
    title: 'Integrity',
    description:
      'Honest pricing, transparent communication, and a genuine commitment to doing right by every client.',
    color: 'from-warm-500 to-warm-600',
    bgLight: 'bg-amber-50',
    iconColor: 'text-amber-600',
  },
  {
    icon: Award,
    title: 'Excellence',
    description:
      'We hold ourselves to the highest standards. If you\'re not 100% satisfied, we\'ll re-clean for free.',
    color: 'from-ocean-500 to-ocean-600',
    bgLight: 'bg-ocean-50',
    iconColor: 'text-ocean-600',
  },
];


const milestones = [
  {
    year: 'Step 1',
    title: 'Founded with Purpose',
    description:
      'Honor Cleaning Co. was born from a simple belief: businesses deserve cleaning services they can actually count on.',
  },
  {
    year: 'Step 2',
    title: 'Built a Trusted Team',
    description:
      'We carefully assembled a team of trained, vetted professionals who share our commitment to excellence.',
  },
  {
    year: 'Step 3',
    title: 'Expanded Across Boston',
    description:
      'Word spread quickly. Today we proudly serve 20+ communities across the Greater Boston area.',
  },
  {
    year: 'Step 4',
    title: 'Still Growing, Still Humble',
    description:
      'Every new client reminds us why we started — to deliver honest, reliable cleaning with real care.',
  },
];

const whyChooseUs = [
  {
    icon: Zap,
    title: 'Fast Response',
    description: 'Get a detailed quote within 24 hours — no waiting around.',
  },
  {
    icon: CalendarCheck,
    title: 'Flexible Scheduling',
    description: 'Days, evenings, or weekends — we work around your schedule.',
  },
  {
    icon: Star,
    title: 'Quality Guaranteed',
    description: 'Not satisfied? We\'ll come back and re-clean at no extra cost.',
  },
  {
    icon: Users,
    title: 'Dedicated Teams',
    description: 'The same trained crew services your facility every time.',
  },
  {
    icon: Leaf,
    title: 'Green Cleaning',
    description: 'EPA-approved, non-toxic products safe for people and planet.',
  },
  {
    icon: Shield,
    title: 'Fully Insured',
    description: 'Licensed and insured in Massachusetts for your peace of mind.',
  },
];

export default function AboutPage() {
  return (
    <>
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden">
        {/* Layered background */}
        <div className="absolute inset-0 bg-brand-950" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(16,185,129,0.12),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_80%_60%,rgba(59,130,246,0.08),transparent)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_10%_80%,rgba(245,158,11,0.05),transparent)]" />

        {/* Animated orbs */}
        <div className="absolute top-[-10%] right-[15%] w-[600px] h-[600px] bg-gradient-to-bl from-brand-500/15 via-ocean-500/8 to-transparent rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-gradient-to-tr from-warm-500/8 via-brand-400/5 to-transparent rounded-full blur-[80px] animate-float-delayed" />

        {/* Noise texture */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Horizontal light streak */}
        <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-brand-400/15 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 w-full">
          {/* Centered text content */}
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 bg-white/[0.06] backdrop-blur-md text-brand-200 text-sm font-medium px-5 py-2.5 rounded-full mb-8 border border-white/[0.08]">
              <Sparkles className="h-4 w-4 text-brand-400" />
              About Honor Cleaning Co.
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white font-display leading-[1.05] tracking-tight mb-6">
              Cleaning with{' '}
              <span className="relative inline-block">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-300 via-emerald-200 to-warm-300">
                  Honor & Care
                </span>
                <svg
                  className="absolute -bottom-2 left-0 w-full h-3"
                  viewBox="0 0 280 12"
                  fill="none"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M2 8C40 3 80 1 140 5C200 9 240 3 278 7"
                    stroke="url(#about-underline)"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <defs>
                    <linearGradient id="about-underline" x1="0" y1="0" x2="280" y2="0">
                      <stop stopColor="#6ee7b7" stopOpacity="0.6" />
                      <stop offset="0.5" stopColor="#34d399" stopOpacity="0.8" />
                      <stop offset="1" stopColor="#fcd34d" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h1>

            <p className="text-lg md:text-xl text-brand-100/60 leading-relaxed max-w-2xl mx-auto mb-10">
              Based in Waltham, MA, we provide professional commercial cleaning services
              built on trust, quality, and a genuine love for what we do.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/booking"
                className="group relative inline-flex items-center gap-2.5 px-9 py-4.5 bg-gradient-to-r from-brand-400 to-brand-500 text-brand-950 font-bold rounded-2xl text-lg shadow-xl shadow-brand-500/25 hover:shadow-2xl hover:shadow-brand-400/40 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2.5">
                  Get a Free Quote
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-brand-300 to-brand-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              <Link
                href="tel:+15083331838"
                className="inline-flex items-center gap-2 px-9 py-4.5 text-white/90 font-semibold rounded-2xl text-lg border border-white/15 hover:bg-white/[0.08] hover:border-white/25 hover:-translate-y-0.5 transition-all duration-300 backdrop-blur-sm"
              >
                <Phone className="h-4 w-4" />
                (508) 333-1838
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
                <Users className="h-4 w-4" />
                Our Story
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display mb-6">
                Built on Hard Work &{' '}
                <span className="bg-gradient-to-r from-brand-600 to-ocean-600 bg-clip-text text-transparent">
                  Honest Service
                </span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Honor Cleaning Co. was founded with a simple mission: deliver commercial
                  cleaning that businesses can truly rely on. We saw too many cleaning companies
                  that overpromised and underdelivered, and we knew there had to be a better way.
                </p>
                <p>
                  From day one, we&apos;ve focused on building real relationships with our
                  clients. We take the time to understand each facility&apos;s unique needs,
                  create customized cleaning plans, and follow through with consistent,
                  high-quality results.
                </p>
                <p>
                  Today, we proudly serve businesses across the Greater Boston area from our
                  home base in Waltham, MA. Every member of our team is trained, vetted, and
                  shares our commitment to excellence.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-brand-50 to-ocean-50 rounded-3xl p-10 relative">
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-brand-500/10 rounded-full blur-2xl" />
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-ocean-500/10 rounded-full blur-2xl" />
                <div className="relative space-y-6">
                  {[
                    { icon: Target, text: 'Customized cleaning plans for every facility' },
                    { icon: Shield, text: 'Fully licensed and insured in Massachusetts' },
                    { icon: Leaf, text: 'Eco-friendly, non-toxic cleaning products' },
                    { icon: Clock, text: 'Flexible scheduling — days, evenings, weekends' },
                    { icon: CheckCircle, text: '100% satisfaction guarantee on every job' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-4 group">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:scale-105 transition-all duration-300">
                        <item.icon className="h-5 w-5 text-brand-600" />
                      </div>
                      <p className="text-gray-700 font-medium pt-2">{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Journey / Milestones */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Target className="h-4 w-4" />
              Our Journey
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display mb-4">
              How We Got Here
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              From a simple idea to a trusted name across Greater Boston — here&apos;s our story in four steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {milestones.map((milestone, index) => (
              <div key={milestone.title} className="relative group">
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center mb-5 shadow-lg shadow-brand-500/20 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-white font-extrabold text-sm font-display">{milestone.year}</span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-2">{milestone.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{milestone.description}</p>
                </div>
                {/* Connector line (hidden on last item and mobile) */}
                {index < milestones.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-full w-6 h-0.5 bg-gradient-to-r from-brand-200 to-brand-100 z-10 -translate-x-3" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Heart className="h-4 w-4" />
              Our Values
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display mb-4">
              What We Stand For
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              These aren&apos;t just words on a wall — they guide every decision we make
              and every space we clean.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value) => (
              <div
                key={value.title}
                className="group bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
              >
                {/* Hover gradient background */}
                <div className={`absolute inset-0 ${value.bgLight} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 font-display mb-2">{value.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-ocean-50 text-ocean-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
              <Star className="h-4 w-4" />
              Why Choose Us
            </div>
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 font-display mb-4">
              The Honor Cleaning Difference
            </h2>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
              We go beyond basic cleaning to deliver an experience that makes your business shine.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item) => (
              <div key={item.title} className="flex items-start gap-4 group">
                <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center shrink-0 group-hover:shadow-md group-hover:border-brand-200 transition-all duration-300">
                  <item.icon className="h-6 w-6 text-brand-600" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 font-display mb-1">{item.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Area */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.1),transparent_60%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.08),transparent_60%)]" />

            <div className="relative grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium px-4 py-2 rounded-full mb-6">
                  <MapPin className="h-4 w-4" />
                  Service Area
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white font-display mb-6">
                  Proudly Serving the{' '}
                  <span className="bg-gradient-to-r from-brand-400 to-ocean-400 bg-clip-text text-transparent">
                    Greater Boston Area
                  </span>
                </h2>
                <p className="text-gray-400 leading-relaxed mb-8">
                  Our home base is located at <strong className="text-white">738 Main St, Waltham, MA 02451</strong>.
                  From here, we serve businesses throughout the Greater Boston area including Waltham,
                  Newton, Watertown, Brookline, Cambridge, Somerville, and surrounding communities.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700/50 flex items-center justify-center shrink-0">
                      <MapPin className="h-5 w-5 text-brand-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">738 Main St, Waltham, MA 02451, USA</p>
                      <p className="text-xs text-gray-500">Our home base</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 border border-gray-700/50 flex items-center justify-center shrink-0">
                      <Building2 className="h-5 w-5 text-ocean-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Greater Boston & Surrounding Towns</p>
                      <p className="text-xs text-gray-500">20+ communities served</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  'Waltham', 'Newton', 'Watertown', 'Brookline',
                  'Cambridge', 'Somerville', 'Brighton', 'Allston',
                  'Belmont', 'Arlington', 'Lexington', 'Needham',
                ].map((town) => (
                  <div
                    key={town}
                    className="flex items-center gap-2 bg-gray-800/50 rounded-xl px-4 py-3 border border-gray-700/50 hover:border-brand-500/30 hover:bg-gray-800/80 transition-all duration-300"
                  >
                    <CheckCircle className="h-4 w-4 text-brand-400 shrink-0" />
                    <span className="text-sm text-gray-300 font-medium">{town}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-br from-brand-600 via-brand-700 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-ocean-500/10 rounded-full blur-3xl" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white text-sm font-medium px-4 py-2 rounded-full mb-6">
            <Sparkles className="h-4 w-4" />
            Let&apos;s Get Started
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-white font-display mb-4">
            Ready for a Cleaner Space?
          </h2>
          <p className="text-brand-100 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            Get a free, no-obligation quote for your business. We&apos;ll create a custom
            cleaning plan that fits your needs and budget.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/booking"
              className="group inline-flex items-center gap-2 bg-white text-brand-700 font-semibold px-8 py-4 rounded-xl text-base hover:bg-gray-50 shadow-lg shadow-brand-900/20 transition-all duration-300 hover:-translate-y-0.5"
            >
              Get a Free Quote
              <ArrowRight className="h-5 w-5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <Link
              href="tel:+15083331838"
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold px-8 py-4 rounded-xl text-base hover:bg-white/20 transition-all duration-300"
            >
              <Phone className="h-4 w-4" />
              Call (508) 333-1838
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

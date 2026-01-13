'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Check,
  ChevronRight,
  ShoppingCart,
  Package,
  Users,
  BarChart3,
  Zap,
  Menu,
  X,
  Store,
  CheckCircle2,
  TrendingUp,
  Smartphone,
  Lock,
  Wifi,
  Play,
  Sparkles,
  CreditCard,
  Clock,
  SmartphoneIcon,
  BarChart,
  ShieldCheck,
  HelpCircle,
  ArrowRight,
  Layers,
  Globe,
  Headphones
} from 'lucide-react';

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const features = [
    {
      icon: ShoppingCart,
      title: 'Smart POS',
      description: 'Lightning-fast checkout with integrated payments, customer profiles, and receipt printing.',
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      stat: '30-second checkout'
    },
    {
      icon: Package,
      title: 'Inventory Management',
      description: 'Real-time stock tracking, low-stock alerts, multi-location transfers, and barcode scanning.',
      color: 'text-purple-600',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      stat: '99% accuracy'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Real-time dashboards, profit margins, sales trends, and employee performance metrics.',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      stat: 'Live insights'
    },
    {
      icon: Users,
      title: 'Multi-Location Ready',
      description: 'Centralized management for multiple branches with real-time sync across all locations.',
      color: 'text-orange-600',
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      stat: 'Unlimited branches'
    },
    {
      icon: Wifi,
      title: 'Works Offline',
      description: 'Continue selling even without internet. Auto-syncs when connection is restored.',
      color: 'text-cyan-600',
      bg: 'bg-cyan-50 dark:bg-cyan-900/20',
      stat: 'Zero downtime'
    },
    {
      icon: Lock,
      title: 'Secure & Compliant',
      description: 'Bank-level encryption, role-based access, and complete audit trails for compliance.',
      color: 'text-red-600',
      bg: 'bg-red-50 dark:bg-red-900/20',
      stat: 'Military-grade security'
    }
  ];

  const pricingPlans = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for testing or tiny kiosks',
      features: [
        '1 POS Terminal',
        'Up to 50 Products',
        '1 Additional User Account',
        'Basic Sales Reports',
        'Community Support',
        'PaeasyShop Branding'
      ],
      popular: false,
      isFree: true,
      cta: 'Get Started Free',
      highlight: 'No credit card required'
    },
    {
      name: 'Starter',
      price: '25,000',
      description: 'Growing beyond the basics',
      features: [
        '3 POS Terminals',
        'Up to 500 Products',
        '5 User Accounts',
        'Advanced Reports',
        'Email Support',
        'Mobile App Access',
        'Multi-location Support'
      ],
      popular: true,
      cta: 'Start Free Trial',
      highlight: 'Most popular choice'
    },
    {
      name: 'Pro',
      price: '60,000',
      description: 'For serious retail operations',
      features: [
        'Unlimited POS Terminals',
        'Unlimited Products',
        'Unlimited Users',
        'Real-time Analytics',
        'Multi-Branch Sync',
        'Priority Support',
        'API Access',
        'Custom Integrations'
      ],
      popular: false,
      cta: 'Start Free Trial',
      highlight: 'Best value'
    },
    {
      name: 'Custom',
      price: 'Custom',
      description: 'Enterprise & franchises',
      features: [
        'Everything in Pro',
        'White Label Branding',
        'Dedicated Account Manager',
        'On-site Training',
        'SLA Guarantee',
        'Custom Development',
        'Priority Feature Requests'
      ],
      popular: false,
      cta: 'Contact Sales',
      highlight: 'Tailored for you'
    }
  ];

  const faqs = [
    {
      question: 'Do I need internet to use PaeasyShop?',
      answer: 'No! PaeasyShop works completely offline. Sales, inventory, and all core features work without internet. Data syncs automatically when you reconnect.'
    },
    {
      question: 'Can I try before I buy?',
      answer: 'Absolutely! Start with our Free plan (no credit card required) or get a 14-day free trial of any paid plan. Cancel anytime, no questions asked.'
    },
    {
      question: 'What about the MWK 20,000 setup fee?',
      answer: 'This one-time fee covers complete system setup, staff training, data migration from your old system, and ongoing support during your first month.'
    },
    {
      question: 'Can I upgrade or downgrade my plan?',
      answer: 'Yes! Change plans anytime. Upgrades are instant. Downgrades take effect at the end of your billing period. No penalties.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept Mobile Money (Airtel Money, TNM Mpamba), bank transfers, and cash deposits. International cards coming soon!'
    },
    {
      question: 'Is my data safe?',
      answer: 'Your data is encrypted, backed up daily, and stored securely. We use bank-level security and never share your information with third parties.'
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Store className="h-5 w-5 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
            </div>
            <div>
              <h1 className="text-xl font-black tracking-tight text-gray-900 dark:text-white">
                Paeasy<span className="text-blue-600">Shop</span>
              </h1>
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-semibold -mt-0.5 block">
                By Octet Systems
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-8">
            <nav className="flex gap-6 text-sm font-medium">
              <a href="#features" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Features</a>
              <a href="#pricing" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">Pricing</a>
              <a href="#faq" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors">FAQ</a>
            </nav>
            <div className="h-6 w-px bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center gap-4">
              <Link href="/login">
                <Button variant="ghost" className="font-medium">Sign In</Button>
              </Link>
              <Link href="/signup">
                <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg">
                  Get Started Free
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

          <button
            className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="px-6 py-8 space-y-4">
              <nav className="space-y-2">
                <a href="#features" className="block py-3 text-gray-700 dark:text-gray-300">Features</a>
                <a href="#pricing" className="block py-3 text-gray-700 dark:text-gray-300">Pricing</a>
                <a href="#faq" className="block py-3 text-gray-700 dark:text-gray-300">FAQ</a>
              </nav>
              <div className="pt-4 space-y-3">
                <Link href="/login">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 lg:pt-48 lg:pb-36 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20 max-w-4xl mx-auto">
            <Badge className="mb-6 py-2 px-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 rounded-full">
              <Sparkles className="h-3 w-3 mr-2" />
              Trusted by 500+ Malawian retailers
            </Badge>

            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight mb-8 leading-none">
              <span className="bg-gradient-to-b from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Retail.
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Reimagined.
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-12 leading-relaxed">
              The all-in-one POS platform built for Malawi. Sell faster, manage smarter, grow bigger.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-10 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-xl">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Free Today
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="h-14 px-10 text-lg border-2">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo (2 min)
              </Button>
            </div>

            <p className="text-sm text-gray-500 mt-6 flex items-center justify-center gap-2 flex-wrap">
              <Check className="h-4 w-4 text-green-500" />
              No credit card required
              <span>•</span>
              14-day free trial
              <span>•</span>
              Cancel anytime
            </p>
          </div>

          {/* Product Showcase */}
          <div className="relative mx-auto max-w-6xl">
            <div className="relative rounded-3xl border border-gray-200 dark:border-gray-800 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-black p-2 shadow-2xl">
              <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
                <div className="aspect-[16/9] bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Today Sales', value: 'MWK 450K', icon: TrendingUp, color: 'text-emerald-600' },
                      { label: 'Low Stock', value: '12 items', icon: Package, color: 'text-amber-600' },
                      { label: 'Active Users', value: '8 online', icon: Users, color: 'text-blue-600' },
                      { label: 'Transactions', value: '124', icon: CreditCard, color: 'text-purple-600' }
                    ].map((stat, i) => (
                      <div key={i} className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">{stat.label}</p>
                            <p className="text-lg font-bold mt-1">{stat.value}</p>
                          </div>
                          <div className={`p-2 rounded-lg bg-gray-50 dark:bg-gray-800 ${stat.color}`}>
                            <stat.icon className="h-5 w-5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Everything you need.
              </span>
              <br />
              <span className="text-gray-400 dark:text-gray-500 text-3xl">Nothing you don't.</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Built specifically for Malawian retail businesses.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="group bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-8 rounded-3xl border border-gray-100 dark:border-gray-800 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-2xl">
                <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">{feature.description}</p>
                <Badge variant="secondary" className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-700 dark:text-blue-300">
                  {feature.stat}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-black">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <Badge className="mb-4 py-2 px-4 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 text-emerald-700 dark:text-emerald-300">
              <CreditCard className="h-3 w-3 mr-2" />
              Transparent Pricing
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Simple, honest pricing</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start free. Scale as you grow. No hidden fees.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingPlans.map((plan, i) => (
              <Card key={i} className={`relative flex flex-col border-2 transition-all hover:shadow-2xl ${plan.popular
                  ? 'border-blue-500 shadow-2xl shadow-blue-500/20 scale-105 z-10'
                  : plan.isFree
                    ? 'border-emerald-500 shadow-lg shadow-emerald-500/10'
                    : 'border-gray-200 dark:border-gray-800'
                }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase shadow-lg">
                    Most Popular
                  </div>
                )}
                {plan.isFree && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-2 rounded-full text-sm font-bold uppercase shadow-lg">
                    Start Free
                  </div>
                )}

                <CardHeader className="pt-12">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">{plan.description}</p>
                </CardHeader>

                <CardContent className="flex-1">
                  <div className="mb-8">
                    <div className="text-5xl font-black mb-2">
                      {plan.isFree ? 'MWK 0' : plan.name === 'Custom' ? 'Custom' : `MWK ${plan.price}`}
                    </div>
                    {!plan.isFree && plan.name !== 'Custom' && (
                      <span className="text-gray-500 text-sm">per month</span>
                    )}
                    {plan.highlight && (
                      <p className="text-sm text-gray-500 mt-2 flex items-center gap-1">
                        <Check className="h-4 w-4 text-green-500" />
                        {plan.highlight}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-4 mb-10">
                    {plan.features.map((feat, j) => (
                      <li key={j} className="flex items-start gap-3 text-gray-700 dark:text-gray-300">
                        <CheckCircle2 className={`h-5 w-5 shrink-0 ${plan.popular ? 'text-blue-500' :
                            plan.isFree ? 'text-emerald-500' :
                              'text-gray-400'
                          }`} />
                        <span className="text-sm">{feat}</span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.name === 'Custom' ? '/contact' : '/signup'}>
                    <Button className={`w-full h-14 text-lg font-medium ${plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg'
                        : plan.isFree
                          ? 'bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700'
                          : 'bg-gray-900 hover:bg-gray-800 dark:bg-gray-800'
                      }`}>
                      {plan.cta}
                      <ChevronRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Additional Info */}
          <div className="mt-16 max-w-3xl mx-auto text-center">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-bold mb-2">30-Day Guarantee</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Full refund if not satisfied</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <SmartphoneIcon className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-bold mb-2">Mobile App Included</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">iOS & Android at no extra cost</p>
              </div>
              <div className="p-6 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Headphones className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-bold mb-2">Local Support</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">Malawian team, Malawian hours</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about PaeasyShop
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 p-8 rounded-2xl border border-gray-100 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-4 flex items-start gap-3">
                  <HelpCircle className="h-6 w-6 text-blue-600 shrink-0 mt-0.5" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed pl-9">
                  {faq.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-8">
            Ready to transform your retail business?
          </h2>
          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
            Join hundreds of Malawian retailers who trust PaeasyShop.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="h-16 px-12 text-lg bg-white text-gray-900 hover:bg-gray-100">
                <Zap className="mr-2 h-5 w-5" />
                Start Free Today
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="h-16 px-12 text-lg border-2 border-white/30 text-white hover:bg-white/10">
              <Headphones className="mr-2 h-5 w-5" />
              Talk to Sales
            </Button>
          </div>

          <p className="text-sm text-gray-400 mt-8 flex items-center justify-center gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-400" />
              No credit card needed
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-400" />
              14-day free trial
            </span>
            <span className="flex items-center gap-1">
              <Check className="h-4 w-4 text-green-400" />
              Cancel anytime
            </span>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-20 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Store className="h-6 w-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">PaeasyShop</h2>
              </div>
              <p className="text-gray-400 max-w-md mb-8">
                Empowering Malawian businesses with world-class retail technology.
                A product of Octet Systems Ltd.
              </p>
            </div>

            {[
              {
                title: 'Product',
                links: ['Features', 'Pricing', 'Mobile App', 'Integrations']
              },
              {
                title: 'Resources',
                links: ['Help Center', 'Documentation', 'Tutorials', 'Blog']
              },
              {
                title: 'Company',
                links: ['About Us', 'Contact', 'Careers', 'Legal']
              }
            ].map((column, i) => (
              <div key={i}>
                <h4 className="text-white font-bold mb-6 text-lg">{column.title}</h4>
                <ul className="space-y-3">
                  {column.links.map((link, j) => (
                    <li key={j}>
                      <a href="#" className="hover:text-white transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>
              © {new Date().getFullYear()} Octet Systems Ltd. All rights reserved.
              <br className="sm:hidden" />
              <span className="hidden sm:inline"> • </span>
              Lilongwe, Malawi • +265 123 456 789
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
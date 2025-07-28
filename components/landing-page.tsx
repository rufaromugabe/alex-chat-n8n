"use client"

import { useState } from "react"
import { ArrowRight, Globe, MessageCircle, Sparkles, Users, Zap, CheckCircle, Star, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { africanLanguages } from "@/lib/languages"
import Image from "next/image"

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)

  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "23+ African Languages",
      description: "Communicate naturally in Shona, Swahili, Yoruba, Igbo, Zulu, and many more African languages with native-level fluency",
      color: "purple"
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Task Automation",
      description: "Handle customer inquiries, process orders, schedule appointments, and complete complex tasks automatically",
      color: "violet"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "Track conversation quality, response times, customer satisfaction, and language performance metrics",
      color: "purple"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Multi-Channel Support",
      description: "Engage customers across WhatsApp, SMS, email, web chat, and social media platforms seamlessly",
      color: "violet"
    }
  ]

  const languages = africanLanguages.slice(0, 12) // Show first 12 languages

  const testimonials = [
    {
      name: "Amara Okafor",
      location: "Lagos, Nigeria",
      text: "Finally, an AI that understands my language and culture. Mutumwa speaks Igbo like a native!",
      rating: 5
    },
    {
      name: "Tendai Mukamuri",
      location: "Harare, Zimbabwe",
      text: "The Shona translations are incredibly accurate. This is exactly what Africa needed.",
      rating: 5
    },
    {
      name: "Fatou Diallo",
      location: "Dakar, Senegal",
      text: "Speaking Wolof with Mutumwa feels natural and authentic. Truly impressive technology.",
      rating: 5
    }
  ];
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950/95 via-slate-900/90 to-purple-950/95 relative overflow-x-hidden overflow-y-auto scroll-smooth" data-landing-page>
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-purple-800/20 blur-3xl float-animation"></div>
        <div className="absolute right-0 top-1/4 h-60 w-60 rounded-full bg-violet-700/20 blur-3xl float-animation" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-purple-800/20 blur-3xl float-animation" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 right-1/4 h-40 w-40 rounded-full bg-violet-600/15 blur-2xl float-animation" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-1/3 left-1/4 h-32 w-32 rounded-full bg-purple-600/10 blur-xl float-animation" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Header */}
      <header className="relative z-50 bg-gray-900 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-40 w-40 -my-6">
              <Image 
                src="/mutumwa-nobg-high-res.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Home</a>
            <div className="flex items-center space-x-1">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Product</a>
              <ChevronDown className="h-4 w-4 text-white" />
            </div>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Customers</a>
            <div className="flex items-center space-x-1">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">Resources</a>
              <ChevronDown className="h-4 w-4 text-white" />
            </div>
            <a href="#" className="text-white hover:text-gray-300 transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center space-x-6">
            <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm">Contact sales</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm">Sign in</a>
            <a href="#" className="text-white hover:text-gray-300 transition-colors text-sm">View demo</a>
            <Button 
              onClick={onGetStarted}
              className="bg-black text-white hover:bg-gray-800 px-4 py-2 rounded transition-colors"
            >
              Start free trial
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Milky Way Background */}
      <section className="relative min-h-screen flex items-center justify-center">
        {/* Milky Way Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/image-from-rawpixel-id-5924106-original.jpg"
            alt="Milky Way Galaxy Background"
            fill
            className="object-cover"
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/40"></div>
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 z-10" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)
            `,
            backgroundSize: '100px 100px'
          }}></div>
          </div>

        {/* Hero Content */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Main Headlines */}
            <div className="text-white">
              <h1 className="text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight mb-6">
                AI customer service in your native languages
          </h1>
              <div className="inline-flex items-center px-3 py-1 bg-white/10 rounded-full text-sm font-medium text-white/80 backdrop-blur-sm">
                AGENT + HELPDESK
              </div>
            </div>

            {/* Right Column - Description and CTA */}
            <div className="text-white">
              <p className="text-lg lg:text-xl text-white/90 mb-8 leading-relaxed">
                The Mutumwa Customer Service Suite combines the #1 AI Agent for customer service with a next-gen Helpdesk—built on a single platform that maximizes team efficiency and delivers superior service across African languages and cultures.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white hover:text-black px-6 py-3 rounded transition-colors"
                >
                  View demo
                </Button>
            <Button 
              onClick={onGetStarted}
              size="lg"
                  className="bg-white text-black hover:bg-gray-100 px-6 py-3 rounded transition-colors"
            >
                  Start free trial
            </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Transforming Industries Across Africa
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              See how Mutumwa is revolutionizing customer service in different sectors
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative">
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full hover:bg-purple-800/30 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-105">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-600/20 text-purple-400">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Banking & Finance</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Handle account inquiries, loan applications, and financial advice in local languages. Reduce fraud with culturally-aware verification.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full hover:bg-purple-800/30 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-105">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-violet-600/20 text-violet-400">
                  <MessageCircle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Healthcare</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Provide medical information, appointment scheduling, and health advice in native languages. Bridge communication gaps in rural areas.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full hover:bg-purple-800/30 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-105">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-purple-600/20 text-purple-400">
                  <Globe className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">E-commerce</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Process orders, handle returns, and provide product recommendations in local languages. Increase sales with cultural understanding.
                </p>
              </div>
            </div>

            <div className="group relative">
              <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full hover:bg-purple-800/30 hover:border-purple-400/50 hover:shadow-[0_0_20px_rgba(147,51,234,0.3)] hover:scale-105">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-violet-600/20 text-violet-400">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Telecommunications</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Resolve network issues, process payments, and provide technical support in native languages. Improve customer retention.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why Choose Mutumwa?
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto">
              Built specifically for African languages with deep cultural understanding
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative"
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className={`p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-sm transition-all duration-300 h-full ${
                  hoveredFeature === index ? 'bg-purple-800/30 border-purple-400/50 shadow-[0_0_20px_rgba(147,51,234,0.3)] transform scale-105' : ''
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    feature.color === 'purple' ? 'bg-purple-600/20 text-purple-400' :
                    'bg-violet-600/20 text-violet-400'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-purple-600/20 to-violet-600/20 border border-purple-400/30 backdrop-blur-sm purple-glow">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Ready to Start Conversing?
            </h2>
            <p className="text-xl text-purple-200 mb-8 max-w-2xl mx-auto">
              Join thousands of users experiencing AI that truly understands African languages and cultures.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={onGetStarted}
                size="lg"
                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-4 text-lg font-semibold shadow-[0_0_25px_rgba(147,51,234,0.8)] border border-purple-400/50 group transition-all duration-300 hover:shadow-[0_0_30px_rgba(147,51,234,1)] purple-glow"
              >
                <Zap className="mr-2 h-5 w-5" />
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            <div className="flex items-center justify-center mt-6 text-sm text-purple-300">
              <CheckCircle className="mr-2 h-4 w-4" />
              No account required • Start chatting immediately
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 border-t border-slate-700/50">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-10 w-10 mr-3">
              <Image 
                src="/mutumwa-nobg-high-res.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-bold text-white">Mutumwa AI</span>
          </div>
          <p className="text-slate-400 text-sm">
            © 2025 Mutumwa AI. Empowering African voices through technology.
          </p>
        </div>
      </footer>
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    </div>
  )
}
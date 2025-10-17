"use client"

import { useState, useEffect } from "react"
import { ArrowRight, Globe, MessageCircle, Sparkles, Users, Send, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { africanLanguages } from "@/lib/languages"
import Image from "next/image"
import ThemeToggle from "@/components/theme-toggle"

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [chatInput, setChatInput] = useState("")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [placeholderText, setPlaceholderText] = useState("")
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  const placeholderMessages = [
    "Mhoro, ungandibatsira sei? (Shona)",
    "Habari, unaweza kunisaidia? (Swahili)",
    "Lotjhani, ungangisiza? (Ndebele)",
    "Kedu, ị nwere ike inyere m aka? (Igbo)",
    "Sawubona, ungangisiza? (Zulu)",
    "Ask me anything in African languages..."
  ]

  useEffect(() => {
    let currentText = ""
    let currentIndex = 0
    let isDeleting = false
    let timeout: NodeJS.Timeout

    const type = () => {
      const fullText = placeholderMessages[placeholderIndex]
      
      if (!isDeleting) {
        currentText = fullText.substring(0, currentIndex + 1)
        currentIndex++
        
        if (currentIndex === fullText.length) {
          isDeleting = true
          timeout = setTimeout(type, 2000)
          setPlaceholderText(currentText)
          return
        }
      } else {
        currentText = fullText.substring(0, currentIndex - 1)
        currentIndex--
        
        if (currentIndex === 0) {
          isDeleting = false
          setPlaceholderIndex((prev) => (prev + 1) % placeholderMessages.length)
          timeout = setTimeout(type, 500)
          setPlaceholderText(currentText)
          return
        }
      }
      
      setPlaceholderText(currentText)
      timeout = setTimeout(type, isDeleting ? 50 : 100)
    }

    timeout = setTimeout(type, 500)

    return () => clearTimeout(timeout)
  }, [placeholderIndex])



  const features = [
    {
      icon: <Globe className="h-6 w-6" />,
      title: "23+ African Languages",
      description: "Communicate in Shona, Swahili, Yoruba, Igbo, Zulu, and many more African languages",
      color: "blue"
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: "Natural Conversations",
      description: "Engage in fluid, contextual conversations that understand cultural nuances",
      color: "indigo"
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: "AI-Powered",
      description: "Advanced AI technology trained specifically for African languages and contexts",
      color: "purple"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Cultural Context",
      description: "Responses that understand and respect African cultural values and traditions",
      color: "blue"
    }
  ]

  const languages = africanLanguages.slice(0, 12) // Show first 12 languages


  return (
    <div className="min-h-screen bg-bg-primary relative overflow-x-hidden overflow-y-auto scroll-smooth" data-landing-page>


      {/* Floating Header */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 py-3 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-accent-primary/10 backdrop-blur-xl border border-accent-primary/30 rounded-2xl shadow-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative h-14 w-22 overflow-hidden">
                <Image 
                  src="/logo.png"
                  alt="Mutumwa AI Logo"
                  fill
                />
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <nav className="hidden md:flex items-center gap-6">
                <a href="#features" className="text-foreground hover:text-accent-primary transition-colors font-medium">Features</a>
                <a href="#languages" className="text-foreground hover:text-accent-primary transition-colors font-medium">Languages</a>
                <a href="#about" className="text-foreground hover:text-accent-primary transition-colors font-medium">About</a>
              </nav>
              
              <div className="scale-125">
                <ThemeToggle />
              </div>
              
              <Button 
                onClick={onGetStarted}
                className="hidden sm:flex bg-accent-primary hover:bg-accent-primary-hover text-text-inverse border border-accent-primary/50 shadow-glow-md text-lg px-6 py-6"
              >
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              
              <Button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden bg-transparent hover:bg-accent-primary/20 text-foreground border-0 p-2"
                size="icon"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-2 bg-accent-primary/10 backdrop-blur-xl border border-accent-primary/30 rounded-2xl shadow-lg p-4">
              <nav className="flex flex-col gap-4">
                <a 
                  href="#features" 
                  className="text-foreground hover:text-accent-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a 
                  href="#languages" 
                  className="text-foreground hover:text-accent-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Languages
                </a>
                <a 
                  href="#about" 
                  className="text-foreground hover:text-accent-primary transition-colors font-medium py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </a>
                <Button 
                  onClick={() => {
                    setMobileMenuOpen(false)
                    onGetStarted()
                  }}
                  className="sm:hidden bg-accent-primary hover:bg-accent-primary-hover text-text-inverse border border-accent-primary/50 shadow-glow-md text-lg px-6 py-6 w-full"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your AI Assistant for{" "}
           <span className="block text-accent-primary">
            African Languages
           </span>
          </h1>


          {/* Hero Description */}
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            Communicate naturally in over 23 African languages with cultural context.
          </p>



          {/* Interactive Chat Input Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="relative bg-bg-secondary/80 backdrop-blur-xl border border-accent-primary/40 rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 md:p-4 lg:p-5">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={placeholderText}
                    className="flex-1 px-4 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10 lg:py-12 bg-bg-primary/80 border border-border-primary rounded-2xl text-base sm:text-lg md:text-xl text-foreground placeholder:text-accent-primary/70 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 focus:border-accent-primary/50 transition-all"
                    onClick={onGetStarted}
                    readOnly
                  />
                  <Button
                    onClick={onGetStarted}
                    size="icon"
                    className="rounded-full bg-accent-primary hover:bg-accent-primary-hover h-10 w-10 sm:h-12 sm:w-12 md:h-14 md:w-14 shadow-glow-md border border-accent-primary/50 transition-all duration-200 hover:shadow-glow-lg flex-shrink-0"
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Language Showcase */}
          <div className="mt-16">
            <p className="text-sm text-text-tertiary mb-6">Supporting African Languages:</p>
            <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
              {languages.map((language, index) => (
                <div
                  key={language.value}
                  className="px-3 py-2 bg-bg-secondary/40 border border-border-primary rounded-lg text-sm text-text-secondary backdrop-blur-sm hover:bg-bg-tertiary/50 transition-colors"
                >
                  {language.label.split(' ')[0]}
                </div>
              ))}
              <div className="px-3 py-2 bg-accent-primary/20 border border-accent-primary/30 rounded-lg text-sm text-accent-secondary backdrop-blur-sm">
                +{africanLanguages.length - languages.length} more
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Mutumwa?
            </h2>
            <p className="text-xl text-text-secondary max-w-2xl mx-auto">
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
                <div className={`p-6 rounded-2xl bg-bg-secondary/40 border border-border-primary backdrop-blur-sm transition-all duration-300 h-full ${
                  hoveredFeature === index ? 'bg-bg-tertiary/60 border-accent-primary/50 shadow-glow-lg' : ''
                }`}>
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${
                    feature.color === 'blue' ? 'bg-accent-primary/20 text-accent-primary' :
                    feature.color === 'indigo' ? 'bg-[hsl(var(--blur-indigo))]/20 text-[hsl(var(--blur-indigo))]' :
                    'bg-[hsl(var(--blur-purple))]/20 text-[hsl(var(--blur-purple))]'
                  }`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 sm:px-6 lg:px-8 border-t border-border-primary">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center mb-4">
            <div className="relative h-40 w-40">
              <Image 
                src="/logo.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <p className="text-text-tertiary text-sm">
            © 2025 Mutumwa AI. Empowering African voices through technology.
          </p>
        </div>
      </footer>
      <script src="https://unpkg.com/@tailwindcss/browser@4"></script>
    </div>
  )
}

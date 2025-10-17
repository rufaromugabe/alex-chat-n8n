"use client"

import { useState } from "react"
import { ArrowRight, Globe, MessageCircle, Sparkles, Users, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { africanLanguages } from "@/lib/languages"
import Image from "next/image"

interface LandingPageProps {
  onGetStarted: () => void
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [chatInput, setChatInput] = useState("")



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


      {/* Header */}
      <header className="relative z-10 px-4 py-6 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative h-40 w-40">
              <Image 
                src="/logo.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
            <div className="flex items-center gap-4">
            <Button 
              onClick={onGetStarted}
              className="bg-accent-primary/80 hover:bg-accent-primary-hover text-text-inverse border border-accent-primary/50 shadow-glow-md backdrop-blur-sm"
            >
              Launch App
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            
            
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          {/* Hero Badge */}
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-primary/20 border border-accent-primary/30 text-accent-secondary text-sm font-medium mb-8 backdrop-blur-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            Powered by Advanced AI Technology
          </div>

          {/* Hero Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight">
            Your AI Assistant for{" "}
           <span className="block text-accent-primary">
            African Languages
           </span>
          </h1>


          {/* Hero Description */}
          <p className="text-xl text-text-secondary max-w-3xl mx-auto mb-10 leading-relaxed">
            Experience the power of AI that truly understands African cultures and languages. 
            Communicate naturally in over 23 African languages with cultural context and authenticity.
          </p>



          {/* Interactive Chat Input Preview */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="relative group">
              <div className="relative bg-bg-secondary/60 backdrop-blur-xl border border-border-primary rounded-2xl shadow-2xl">
                <div className="flex items-center gap-2 p-2 md:p-3 lg:p-4">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask me anything in African languages..."
                    className="flex-1 px-4 py-6 md:px-6 md:py-8 bg-bg-primary/50 border-0 rounded-2xl text-lg text-foreground placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all"
                    onClick={onGetStarted}
                    readOnly
                  />
                  <Button
                    onClick={onGetStarted}
                    size="icon"
                    className="rounded-full bg-accent-primary hover:bg-accent-primary-hover h-9 w-9 md:h-10 md:w-10 shadow-glow-md border border-accent-primary/50 transition-all duration-200 hover:shadow-glow-lg flex-shrink-0"
                  >
                    <Send className="h-4 w-4" />
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

"use client"

import { LanguageProvider } from "./contexts/LanguageContext"
import { DomainProvider } from "./contexts/DomainContext"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { SidebarProvider } from "./contexts/SidebarContext"
import { AppProvider, useApp } from "./contexts/AppContext"
import dynamic from "next/dynamic"
import LanguagePicker from "@/components/language-picker"
import DomainPicker from "@/components/domain-picker"
import ProfileModal from "@/components/profile-modal"
import LoginPage from "@/components/login-page"
import { Button } from "@/components/ui/button"
import { africanLanguages } from "@/lib/languages"
import { domains } from "./contexts/DomainContext"
import Image from "next/image"
import { useLanguage } from "./contexts/LanguageContext"
import { useDomain } from "./contexts/DomainContext"
import { useSidebar } from "./contexts/SidebarContext"
import { ReactNode, useState } from "react"
import { Inter } from "next/font/google"
import { Menu, LogOut, User } from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })
const Sidebar = dynamic(() => import("@/components/sidebar"), { ssr: false })

function Header() {
  const { selectedLanguage, setSelectedLanguage } = useLanguage()
  const { selectedDomain, setSelectedDomain } = useDomain()
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const { logout } = useAuth()
  const { refreshSessionsForDomain, startNewChat } = useApp()
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)

  const handleLogout = () => {
    logout()
  }

  const handleDomainChange = (domain: typeof selectedDomain) => {
    setSelectedDomain(domain)
    refreshSessionsForDomain(domain.value)
    
    // Start a new chat when domain changes (like clicking "New Chat")
    startNewChat()
    
    // Navigate to new chat smoothly
    router.push('/chat/new')
  }

  return (
    <div className="flex items-center justify-between border-b border-white/10 px-2 sm:px-4 py-2 sm:py-3">
      <div className="flex items-center space-x-2">
        {/* Mobile menu button - shown only if sidebar is closed */}
        {!isSidebarOpen && (
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="md:hidden "
          >
            <Menu className="h-8 w-8 text-white" />
          </button>
        )}
        <div className="relative h-20 w-20 sm:h-16 sm:w-16 ml-2 ">
          <Image 
            src="/logo.png"
            alt="Mutumwa AI Logo"
            fill
            sizes="(max-width: 640px) 80px, 64px"
            className="object-contain"
          />
        </div>
      </div>      <div className="flex items-center gap-2 flex-shrink-0 ml-2 sm:ml-4">

        <DomainPicker
          selectedDomain={selectedDomain}
          setSelectedDomain={handleDomainChange}
          domains={domains}
        />
        <LanguagePicker
          selectedLanguage={selectedLanguage}
          setSelectedLanguage={setSelectedLanguage}
          languages={africanLanguages}
        />
        <Button
          onClick={() => setIsProfileOpen(true)}
          variant="outline"
          size="sm"
          className="border-slate-700/50 bg-slate-800/70 hover:bg-slate-700/70 text-white hover:text-white"
          title="View Profile"
        >
          <User className="h-4 w-4" />
        </Button>
        <Button
          onClick={handleLogout}
          variant="outline"
          size="sm"
          className="border-slate-700/50 bg-slate-800/70 hover:bg-slate-700/70 text-white hover:text-white"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)}
        domain={selectedDomain.value}
      />
    </div>
  )
}

function AuthenticatedApp({ children }: { children: ReactNode }) {
  const { 
    isAuthenticated, 
    login, 
    isLoading, 
    attemptCount, 
    isLockedOut, 
    lockoutEndTime, 
    maxAttempts 
  } = useAuth()
  
  const pathname = usePathname()
  
  // Check if current route requires authentication (only /chat routes)
  const requiresAuth = pathname.startsWith('/chat')

  // Show loading spinner while checking authentication (only for protected routes)
  if (requiresAuth && isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-950/95">
        <div className="text-center">
          <div className="relative h-16 w-16 mx-auto mb-4">
            <Image 
              src="/logo.png"
              alt="Mutumwa AI Logo"
              fill
              className="object-contain animate-pulse"
            />
          </div>
          <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
          <p className="text-white/60 text-sm mt-2">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated and route requires auth
  if (requiresAuth && !isAuthenticated) {
    return (
      <LoginPage 
        onLogin={login}
        attemptCount={attemptCount}
        isLockedOut={isLockedOut}
        lockoutEndTime={lockoutEndTime}
        maxAttempts={maxAttempts}
      />
    )
  }

  // Show the main app (either authenticated or home page)
  return <AppLayout>{children}</AppLayout>
}

function AppLayout({ children }: { children: ReactNode }) {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar()
  const { sessions, currentSessionId, loadSession, deleteSession, isLoadingSessions } = useApp()
  const { isAuthenticated } = useAuth()
  const pathname = usePathname()

  // Check if we're on a chat route
  const isChatRoute = pathname.startsWith('/chat')
  
  // Show header only if authenticated or on chat routes
  const showHeader = isAuthenticated || isChatRoute

  const handleNewChat = () => {
    // This will be handled by the sidebar's router navigation
  }

  const handleLoadSession = async (sessionId: string) => {
    await loadSession(sessionId)
  }

  const handleDeleteSession = (sessionId: string) => {
    deleteSession(sessionId)
  }

  // If not on a chat route, render children directly (landing page without header)
  if (!isChatRoute) {
    return <>{children}</>
  }
  return (
    <div className="relative flex h-screen w-screen overflow-hidden bg-gradient-to-br from-indigo-950/95 via-slate-900/90 to-slate-950/95" data-chat-layout>
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-80 w-80 rounded-full bg-blue-800/15 blur-3xl"></div>
        <div className="absolute right-0 top-1/4 h-60 w-60 rounded-full bg-indigo-700/15 blur-3xl"></div>
        <div className="absolute bottom-0 left-1/3 h-60 w-60 rounded-full bg-purple-800/15 blur-3xl"></div>
      </div>
      
      <Sidebar 
        onNewChat={handleNewChat} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onLoadSession={handleLoadSession}
        onDeleteSession={handleDeleteSession}
        isLoading={isLoadingSessions}
      />

      <div
        className={`flex flex-1 flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? "md:pl-64" : "pl-0"} w-full`}
      >
        <div className="flex h-full w-full flex-col p-0 md:p-2 md:px-10 md:py-2">
          {/* Chat container - full screen on mobile */}
          <div className="relative flex h-[100dvh] md:h-[calc(100vh-20px)] w-full flex-col overflow-hidden md:rounded-xl md:border md:border-white/10 bg-white/5 backdrop-blur-lg md:shadow-xl">
            {showHeader && <Header />}
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <AppProvider>
            <SidebarProvider>
              <LanguageProvider>
                <DomainProvider>
                  <AuthenticatedApp>{children}</AuthenticatedApp>
                </DomainProvider>
              </LanguageProvider>
            </SidebarProvider>
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  )
}


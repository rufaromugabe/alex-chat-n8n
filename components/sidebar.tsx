"use client"

import { X, Plus, Globe, MessageSquare, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ChatSession } from "@/lib/session-manager"
import { formatDistanceToNow } from "date-fns"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface SidebarProps {
  onNewChat: () => void
  isOpen: boolean
  setIsOpen: (isOpen: boolean) => void
  sessions: ChatSession[]
  currentSessionId: string
  onLoadSession: (sessionId: string) => void
  onDeleteSession: (sessionId: string) => void
}

export default function Sidebar({ 
  onNewChat, 
  isOpen, 
  setIsOpen, 
  sessions, 
  currentSessionId, 
  onLoadSession, 
  onDeleteSession 
}: SidebarProps) {
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onDeleteSession(sessionId)
    setDeletingSessionId(null)
  }
  const handleNewChat = () => {
    router.push("/chat/new")
    // Only close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }

  const handleLoadSession = (sessionId: string) => {
    router.push(`/chat/${sessionId}`)
    // Only close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      setIsOpen(false)
    }
  }
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && <div className="md:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-indigo-950/90 to-slate-900/90 backdrop-blur-lg border-r border-white/10 flex flex-col transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between p-2 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-28">
              <Image 
                src="/logo.png"
                alt="Mutumwa AI Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-slate-400 hover:text-white"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>        <div className="p-3">
          <Button onClick={handleNewChat} className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700 mb-3">
            <Plus className="h-4 w-4" />
            <span>New Chat</span>
          </Button>
          
          
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto px-3">
          <div className="text-xs text-slate-400 mb-2 px-2">Recent Chats</div>
          <div className="space-y-1">
            {sessions.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-4 px-2">
                No previous chats
              </div>
            ) : (
              sessions.map((session) => (
                <div
                  key={session.id}                  className={`group relative p-2 rounded-lg cursor-pointer transition-colors ${
                    session.id === currentSessionId
                      ? "bg-blue-600/20 border border-blue-400/30"
                      : "hover:bg-slate-800/50"
                  }`}
                  onClick={() => handleLoadSession(session.id)}
                >
                  <div className="flex items-start gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm text-white truncate mb-1">
                        {session.title}
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {session.lastMessage}
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {formatDistanceToNow(session.timestamp, { addSuffix: true })}
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                      title="Delete chat"
                    >
                      <Trash2 className="h-3 w-3 text-red-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="p-3 border-t border-white/10 mt-auto">
          <div className="mt-4 text-xs text-slate-400 text-center">
            <p>© 2025 Mutumwa</p>
            <p>Your African Language Assistant</p>
          </div>
        </div>
      </aside>
    </>
  )
}


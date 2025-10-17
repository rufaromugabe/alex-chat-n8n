"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserManager } from "@/lib/user-manager"
import { Loader2 } from "lucide-react"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
  domain: string
}

interface UserMemory {
  user_id: string
  working_memory: any
  created_at: string
  updated_at: string
}

export default function ProfileModal({ isOpen, onClose, domain }: ProfileModalProps) {
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const userId = UserManager.getUserId()

  useEffect(() => {
    if (isOpen) {
      fetchUserMemory()
    }
  }, [isOpen, domain])

  const fetchUserMemory = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/user-memory?userId=${userId}&domain=${domain}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user memory')
      }

      const data = await response.json()
      setUserMemory(data.userMemory)
    } catch (err) {
      console.error('Error fetching user memory:', err)
      setError('Failed to load user information')
    } finally {
      setIsLoading(false)
    }
  }

  const renderWorkingMemory = (memory: any) => {
    if (!memory || Object.keys(memory).length === 0) {
      return <p className="text-slate-400 text-sm">No information available</p>
    }

    return (
      <div className="space-y-3">
        {Object.entries(memory).map(([key, value]) => (
          <div key={key} className="border-b border-slate-700/50 pb-2">
            <h4 className="text-sm font-semibold text-slate-300 capitalize mb-1">
              {key.replace(/_/g, ' ')}
            </h4>
            <div className="text-sm text-slate-400">
              {renderValue(value)}
            </div>
          </div>
        ))}
      </div>
    )
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-slate-500 italic">Not set</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-500 italic">None</span>
      }
      return (
        <ul className="list-disc list-inside space-y-1">
          {value.map((item, index) => (
            <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : String(item)}</li>
          ))}
        </ul>
      )
    }

    if (typeof value === 'object') {
      return (
        <pre className="bg-slate-800/50 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )
    }

    if (typeof value === 'boolean') {
      return <span>{value ? 'Yes' : 'No'}</span>
    }

    if (value === '') {
      return <span className="text-slate-500 italic">Not set</span>
    }

    return <span>{String(value)}</span>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* User ID Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-2">User ID</h3>
            <p className="text-sm text-slate-400 font-mono break-all">{userId}</p>
          </div>

          {/* Working Memory Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <h3 className="text-sm font-semibold text-slate-300 mb-3">User Information</h3>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            {!isLoading && !error && userMemory && (
              <div>
                {renderWorkingMemory(userMemory.working_memory)}
                
                <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500">
                  <p>Last updated: {new Date(userMemory.updated_at).toLocaleString()}</p>
                </div>
              </div>
            )}

            {!isLoading && !error && !userMemory && (
              <p className="text-slate-400 text-sm">No user information found for this domain</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

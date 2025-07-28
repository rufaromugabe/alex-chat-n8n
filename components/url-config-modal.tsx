"use client"

import { useState } from "react"
import { X, Save, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"

interface UrlConfigModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function UrlConfigModal({ isOpen, onClose }: UrlConfigModalProps) {
  const [organizationUrl, setOrganizationUrl] = useState("https://example.com")
  const [isEditing, setIsEditing] = useState(false)
  const [tempUrl, setTempUrl] = useState(organizationUrl)

  const handleSave = () => {
    setOrganizationUrl(tempUrl)
    setIsEditing(false)
    // Here you would typically save to backend/localStorage
    console.log("Saving organization URL:", tempUrl)
  }

  const handleCancel = () => {
    setTempUrl(organizationUrl)
    setIsEditing(false)
  }

  const handleEdit = () => {
    setTempUrl(organizationUrl)
    setIsEditing(true)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-slate-800/90 backdrop-blur-lg border border-slate-700/50 rounded-xl p-6 w-full max-w-md mx-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-lg">
              <Globe className="h-5 w-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Configure Website URL</h2>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Organization Website URL
            </label>
            
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="url"
                  value={tempUrl}
                  onChange={(e) => setTempUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50"
                  placeholder="Enter your organization URL"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-700"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="px-3 py-2 bg-slate-700/30 border border-slate-600/30 rounded-lg text-white">
                  {organizationUrl}
                </div>
                <Button
                  onClick={handleEdit}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-white"
                >
                  Edit URL
                </Button>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-700/50">
            <p className="text-sm text-slate-400">
              This URL will be used for organization-specific configurations and integrations.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
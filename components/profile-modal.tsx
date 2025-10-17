"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserManager } from "@/lib/user-manager"
import { Loader2, Edit2, Save, X, Plus, Trash2, GripVertical, LogOut } from "lucide-react"
import DomainPicker from "@/components/domain-picker"
import { domains } from "@/app/contexts/DomainContext"
import { useAuth } from "@/app/contexts/AuthContext"

interface ProfileModalProps {
  isOpen: boolean
  onClose: () => void
}

interface UserMemory {
  user_id: string
  working_memory: any
  created_at: string
  updated_at: string
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const [userMemory, setUserMemory] = useState<UserMemory | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMemory, setEditedMemory] = useState<any>({})
  const [fieldOrder, setFieldOrder] = useState<string[]>([])
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [selectedDomain, setSelectedDomain] = useState(domains[0])
  const { logout } = useAuth()
  const userId = UserManager.getUserId()

  const handleLogout = () => {
    logout()
    onClose()
  }

  useEffect(() => {
    if (isOpen) {
      fetchUserMemory()
      setIsEditing(false)
    }
  }, [isOpen, selectedDomain.value])

  const fetchUserMemory = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`/api/user-memory?userId=${userId}&domain=${selectedDomain.value}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch user memory')
      }

      const data = await response.json()
      setUserMemory(data.userMemory)
      const memory = data.userMemory?.working_memory || {}
      
      // Use the order of keys as they come from the database
      setEditedMemory(memory)
      setFieldOrder(Object.keys(memory))
    } catch (err) {
      console.error('Error fetching user memory:', err)
      setError('Failed to load user information')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    
    try {
      // Reconstruct object with keys in the exact order from fieldOrder
      const orderedMemory: any = {}
      fieldOrder.forEach(key => {
        if (editedMemory.hasOwnProperty(key)) {
          orderedMemory[key] = editedMemory[key]
        }
      })

      const response = await fetch('/api/user-memory', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          domain: selectedDomain.value,
          workingMemory: orderedMemory
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save user memory')
      }

      await fetchUserMemory()
      setIsEditing(false)
    } catch (err) {
      console.error('Error saving user memory:', err)
      setError('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    const memory = userMemory?.working_memory || {}
    setEditedMemory(memory)
    setFieldOrder(Object.keys(memory))
    setIsEditing(false)
    setNewFieldKey("")
    setNewFieldValue("")
  }

  const handleFieldChange = (key: string, value: any) => {
    setEditedMemory((prev: any) => ({
      ...prev,
      [key]: value
    }))
  }

  const handleArrayItemAdd = (key: string) => {
    const currentArray = editedMemory[key] || []
    setEditedMemory((prev: any) => ({
      ...prev,
      [key]: [...currentArray, ""]
    }))
  }

  const handleArrayItemChange = (key: string, index: number, value: string) => {
    const newArray = [...(editedMemory[key] || [])]
    newArray[index] = value
    setEditedMemory((prev: any) => ({
      ...prev,
      [key]: newArray
    }))
  }

  const handleArrayItemDelete = (key: string, index: number) => {
    const newArray = [...(editedMemory[key] || [])]
    newArray.splice(index, 1)
    setEditedMemory((prev: any) => ({
      ...prev,
      [key]: newArray
    }))
  }

  const handleDeleteField = (key: string) => {
    const newMemory = { ...editedMemory }
    delete newMemory[key]
    setEditedMemory(newMemory)
    setFieldOrder(fieldOrder.filter(k => k !== key))
  }

  const handleAddNewField = () => {
    if (newFieldKey.trim()) {
      setEditedMemory((prev: any) => ({
        ...prev,
        [newFieldKey]: newFieldValue || ""
      }))
      setFieldOrder([...fieldOrder, newFieldKey])
      setNewFieldKey("")
      setNewFieldValue("")
    }
  }

  const handleDragStart = (key: string) => {
    setDraggedItem(key)
  }

  const handleDragOver = (e: React.DragEvent, key: string) => {
    e.preventDefault()
    if (draggedItem && draggedItem !== key) {
      const newOrder = [...fieldOrder]
      const draggedIndex = newOrder.indexOf(draggedItem)
      const targetIndex = newOrder.indexOf(key)
      
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedItem)
      
      setFieldOrder(newOrder)
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const renderWorkingMemory = (memory: any) => {
    if (!memory || Object.keys(memory).length === 0) {
      return <p className="text-text-tertiary text-sm">No information available</p>
    }

    // Use fieldOrder to maintain the order
    const orderedKeys = fieldOrder
    
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {orderedKeys.map((key) => {
          const value = memory[key]
          if (value === undefined) return null
          
          return (
            <div 
              key={key} 
              draggable={isEditing}
              onDragStart={() => handleDragStart(key)}
              onDragOver={(e) => handleDragOver(e, key)}
              onDragEnd={handleDragEnd}
              className={`border border-border-primary rounded-lg p-3 bg-bg-tertiary/30 transition-all ${
                isEditing ? 'cursor-move hover:border-border-focus' : ''
              } ${draggedItem === key ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <GripVertical className="h-4 w-4 text-text-tertiary" />
                  )}
                  <h4 className="text-sm font-semibold text-text-secondary capitalize">
                    {key.replace(/_/g, ' ')}
                  </h4>
                </div>
                {isEditing && (
                  <button
                    onClick={() => handleDeleteField(key)}
                    className="text-red-400 hover:text-red-300 p-1"
                    title="Delete field"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </div>
              <div className="text-sm text-text-tertiary">
                {isEditing ? renderEditableValue(key, value) : renderValue(value)}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  const renderEditableValue = (key: string, value: any): React.ReactNode => {
    if (Array.isArray(value)) {
      return (
        <div className="space-y-2">
          {value.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                value={typeof item === 'object' ? JSON.stringify(item) : String(item)}
                onChange={(e) => handleArrayItemChange(key, index, e.target.value)}
                className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
              />
              <button
                onClick={() => handleArrayItemDelete(key, index)}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            onClick={() => handleArrayItemAdd(key)}
            className="flex items-center gap-1 text-accent-primary hover:text-accent-primary-hover text-xs"
          >
            <Plus className="h-3 w-3" />
            Add item
          </button>
        </div>
      )
    }

    if (typeof value === 'object' && value !== null) {
      return (
        <textarea
          value={JSON.stringify(value, null, 2)}
          onChange={(e) => {
            try {
              const parsed = JSON.parse(e.target.value)
              handleFieldChange(key, parsed)
            } catch {
              // Invalid JSON, keep as string
            }
          }}
          className="w-full bg-bg-input border border-border rounded px-2 py-1 text-xs text-foreground font-mono"
          rows={4}
        />
      )
    }

    if (typeof value === 'boolean') {
      return (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
          className="bg-bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
        >
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
      )
    }

    return (
      <input
        type="text"
        value={String(value)}
        onChange={(e) => handleFieldChange(key, e.target.value)}
        className="w-full bg-bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
      />
    )
  }

  const renderValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return <span className="text-text-tertiary italic">Not set</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-text-tertiary italic">None</span>
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
        <pre className="bg-bg-tertiary/50 p-2 rounded text-xs overflow-x-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      )
    }

    if (typeof value === 'boolean') {
      return <span>{value ? 'Yes' : 'No'}</span>
    }

    if (value === '') {
      return <span className="text-text-tertiary italic">Not set</span>
    }

    return <span>{String(value)}</span>
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center justify-between gap-2 pr-8">
            <span>User Profile</span>
            <div className="flex items-center gap-2">
              <DomainPicker
                selectedDomain={selectedDomain}
                setSelectedDomain={setSelectedDomain}
                domains={domains}
              />
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="border-red-600/50 bg-red-900/20 hover:bg-red-900/40 text-red-400 hover:text-red-300"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Working Memory Section */}
          <div className="bg-bg-secondary/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-text-secondary">Memories</h3>
              {!isLoading && userMemory && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-border bg-bg-tertiary hover:bg-bg-secondary text-foreground"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-accent-primary" />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            {!isLoading && !error && userMemory && (
              <div>
                {/* User ID at top */}
                <div className="mb-4 pb-3 border-b border-border-primary">
                  <h4 className="text-xs font-semibold text-text-tertiary mb-1">User ID</h4>
                  <p className="text-sm text-text-secondary font-mono break-all">{userId}</p>
                </div>

                {/* Working Memory Grid */}
                {renderWorkingMemory(isEditing ? editedMemory : userMemory.working_memory)}
                
                {/* Add New Field */}
                {isEditing && (
                  <div className="mt-4 pt-3 border-t border-border-primary">
                    <h4 className="text-sm font-semibold text-text-secondary mb-2">Add New Field</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Field name"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="flex-1 bg-bg-input border border-border rounded px-2 py-1 text-sm text-foreground"
                      />
                      <Button
                        onClick={handleAddNewField}
                        size="sm"
                        className="bg-accent-primary hover:bg-accent-primary-hover"
                        disabled={!newFieldKey.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {!isEditing && (
                  <div className="mt-4 pt-3 border-t border-border-primary text-xs text-text-tertiary flex justify-between items-center">
                    <p>Last updated: {new Date(userMemory.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !error && !userMemory && (
              <p className="text-text-tertiary text-sm">No user information found for this domain</p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-border bg-bg-tertiary hover:bg-bg-secondary text-foreground"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-accent-primary hover:bg-accent-primary-hover"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-1" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

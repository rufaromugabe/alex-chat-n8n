"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UserManager } from "@/lib/user-manager"
import { Loader2, Edit2, Save, X, Plus, Trash2, GripVertical } from "lucide-react"

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
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedMemory, setEditedMemory] = useState<any>({})
  const [fieldOrder, setFieldOrder] = useState<string[]>([])
  const [newFieldKey, setNewFieldKey] = useState("")
  const [newFieldValue, setNewFieldValue] = useState("")
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const userId = UserManager.getUserId()

  useEffect(() => {
    if (isOpen) {
      fetchUserMemory()
      setIsEditing(false)
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
          domain,
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
      return <p className="text-slate-400 text-sm">No information available</p>
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
              className={`border border-slate-700/50 rounded-lg p-3 bg-slate-800/30 transition-all ${
                isEditing ? 'cursor-move hover:border-slate-600' : ''
              } ${draggedItem === key ? 'opacity-50' : ''}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <GripVertical className="h-4 w-4 text-slate-500" />
                  )}
                  <h4 className="text-sm font-semibold text-slate-300 capitalize">
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
              <div className="text-sm text-slate-400">
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
                className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
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
            className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs"
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
          className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-xs text-white font-mono"
          rows={4}
        />
      )
    }

    if (typeof value === 'boolean') {
      return (
        <select
          value={value ? 'true' : 'false'}
          onChange={(e) => handleFieldChange(key, e.target.value === 'true')}
          className="bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
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
        className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
      />
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
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">User Profile</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Working Memory Section */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-300">User Information</h3>
              {!isLoading && userMemory && !isEditing && (
                <Button
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                  className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            
            {isLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
              </div>
            )}

            {error && (
              <p className="text-red-400 text-sm mb-2">{error}</p>
            )}

            {!isLoading && !error && userMemory && (
              <div>
                {/* User ID at top */}
                <div className="mb-4 pb-3 border-b border-slate-700/50">
                  <h4 className="text-xs font-semibold text-slate-400 mb-1">User ID</h4>
                  <p className="text-sm text-slate-300 font-mono break-all">{userId}</p>
                </div>

                {/* Working Memory Grid */}
                {renderWorkingMemory(isEditing ? editedMemory : userMemory.working_memory)}
                
                {/* Add New Field */}
                {isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50">
                    <h4 className="text-sm font-semibold text-slate-300 mb-2">Add New Field</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Field name"
                        value={newFieldKey}
                        onChange={(e) => setNewFieldKey(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        value={newFieldValue}
                        onChange={(e) => setNewFieldValue(e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-white"
                      />
                      <Button
                        onClick={handleAddNewField}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        disabled={!newFieldKey.trim()}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
                
                {!isEditing && (
                  <div className="mt-4 pt-3 border-t border-slate-700/50 text-xs text-slate-500 flex justify-between items-center">
                    <p>Last updated: {new Date(userMemory.updated_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            )}

            {!isLoading && !error && !userMemory && (
              <p className="text-slate-400 text-sm">No user information found for this domain</p>
            )}
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleCancel}
                variant="outline"
                className="border-slate-600 bg-slate-800 hover:bg-slate-700 text-white"
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-blue-600 hover:bg-blue-700"
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

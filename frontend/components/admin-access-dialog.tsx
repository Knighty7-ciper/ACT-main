'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Shield, Coffee } from 'lucide-react'

interface AdminAccessDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export function AdminAccessDialog({ isOpen, onClose, onSuccess }: AdminAccessDialogProps) {
  const [clickCount, setClickCount] = useState(0)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [isValidating, setIsValidating] = useState(false)

  const handleFooterClick = () => {
    if (clickCount < 3) {
      setClickCount(prev => prev + 1)
      return
    }

    // 4th click - show question
    fetchAdminQuestion()
    setClickCount(0)
  }

  const fetchAdminQuestion = async () => {
    try {
      const response = await fetch('/api/admin/admin-access/question')
      if (response.ok) {
        const data = await response.json()
        setQuestion(data.question)
      }
    } catch (error) {
      toast.error('Failed to load admin access question')
    }
  }

  const handleValidateAnswer = async () => {
    if (!answer.trim()) {
      toast.error('Please enter an answer')
      return
    }

    setIsValidating(true)
    try {
      const response = await fetch('/api/admin/admin-access/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answer: answer.trim() })
      })

      const result = await response.json()
      
      if (result.valid) {
        toast.success('Admin access granted!')
        setAnswer('')
        setQuestion('')
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || 'Incorrect answer')
        setAnswer('')
      }
    } catch (error) {
      toast.error('Failed to validate answer')
    } finally {
      setIsValidating(false)
    }
  }

  const handleClose = () => {
    setClickCount(0)
    setQuestion('')
    setAnswer('')
    onClose()
  }

  return (
    <>
      {/* Hidden clickable area for 4-click detection */}
      <div 
        onClick={handleFooterClick}
        className="fixed bottom-4 left-4 z-50 w-8 h-8 cursor-pointer opacity-0 hover:opacity-10"
        style={{ 
          background: 'linear-gradient(45deg, #FFD700, #FFA500)',
          borderRadius: '50%'
        }}
        title="Secret area"
      >
        <Coffee className="w-4 h-4 m-2 text-black" />
      </div>

      {/* Admin Access Dialog */}
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-yellow-500" />
              Admin Access Required
            </DialogTitle>
            <DialogDescription>
              Click the secret coffee icon 4 times in the footer to access this
            </DialogDescription>
          </DialogHeader>
          
          {question && (
            <div className="space-y-4">
              <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-lg font-medium text-yellow-800">
                  {question}
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Answer:</label>
                <Input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="Enter your answer..."
                  className="uppercase"
                  onKeyDown={(e) => e.key === 'Enter' && handleValidateAnswer()}
                />
              </div>
              
              <div className="flex gap-2">
                <Button 
                  onClick={handleValidateAnswer}
                  disabled={isValidating || !answer.trim()}
                  className="flex-1"
                >
                  {isValidating ? 'Validating...' : 'Access Admin Panel'}
                </Button>
                <Button variant="outline" onClick={handleClose}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
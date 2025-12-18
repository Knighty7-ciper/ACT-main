"use client"

import type React from "react"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings } from "lucide-react"

interface UserSettingsProps {
  onSave: (settings: any) => Promise<void>
}

export function UserSettings({ onSave }: UserSettingsProps) {
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [twoFactorAuth, setTwoFactorAuth] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave({
      emailNotifications,
      smsNotifications,
      twoFactorAuth,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Account Settings
        </CardTitle>
        <CardDescription>Manage your account preferences and security</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-sm font-medium">Notifications</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <Switch id="email-notifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
              <Switch id="sms-notifications" checked={smsNotifications} onCheckedChange={setSmsNotifications} />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium">Security</h4>
            <div className="flex items-center justify-between">
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <Switch id="2fa" checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
            </div>
          </div>

          <Button type="submit" className="w-full">
            Save Settings
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

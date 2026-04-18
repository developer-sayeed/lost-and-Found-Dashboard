'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldGroup, Field, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { useAuth } from '@/components/auth/auth-provider'
import type { HotelSettings } from '@/lib/types'
import { Building, Mail, Phone, Globe, Link as LinkIcon, Plus, Trash2, Upload, Save, Check } from 'lucide-react'

export default function SettingsPage() {
  const { user, permissions } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  
  const [formData, setFormData] = useState<HotelSettings>({
    hotelName: '',
    hotelAddress: '',
    hotelPhone: '',
    hotelEmail: '',
    hotelWebsite: '',
    logo: '',
    otherLinks: [],
  })

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/settings')
      const data = await res.json()
      if (data) {
        setFormData({
          hotelName: data.hotelName || '',
          hotelAddress: data.hotelAddress || '',
          hotelPhone: data.hotelPhone || '',
          hotelEmail: data.hotelEmail || '',
          hotelWebsite: data.hotelWebsite || '',
          logo: data.logo || data.logoUrl || '',
          otherLinks: Array.isArray(data.otherLinks) ? data.otherLinks : [],
        })
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setFormData({ ...formData, logo: reader.result as string })
    }
    reader.readAsDataURL(file)
  }

  const addLink = () => {
    setFormData({
      ...formData,
      otherLinks: [...formData.otherLinks, { label: '', url: '' }],
    })
  }

  const updateLink = (index: number, field: 'label' | 'url', value: string) => {
    const newLinks = [...formData.otherLinks]
    newLinks[index] = { ...newLinks[index], [field]: value }
    setFormData({ ...formData, otherLinks: newLinks })
  }

  const removeLink = (index: number) => {
    const newLinks = formData.otherLinks.filter((_, i) => i !== index)
    setFormData({ ...formData, otherLinks: newLinks })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveSuccess(false)

    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  if (user?.role !== 'super_admin') {
    return (
      <AppShell title="Settings">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Only Super Admin can access this page.</p>
        </div>
      </AppShell>
    )
  }

  if (isLoading) {
    return (
      <AppShell title="Settings">
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell title="Settings">
      <form onSubmit={handleSubmit}>
        <div className="max-w-3xl space-y-6">
          {/* Hotel Logo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Hotel Logo
              </CardTitle>
              <CardDescription>
                Upload your hotel logo. This will appear on PDFs and throughout the system.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div className="h-24 w-48 bg-muted rounded-lg flex items-center justify-center overflow-hidden border">
                  {formData.logo ? (
                    <Image
                      src={formData.logo}
                      alt="Hotel Logo"
                      width={192}
                      height={96}
                      className="h-full w-full object-contain p-2"
                    />
                  ) : (
                    <span className="text-muted-foreground text-sm">No logo</span>
                  )}
                </div>
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    Recommended: PNG or JPG, max 2MB
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hotel Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Hotel Information
              </CardTitle>
              <CardDescription>
                Basic information about your hotel. This will be used in PDF reports.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="hotelName">Hotel Name</FieldLabel>
                  <Input
                    id="hotelName"
                    placeholder="Enter hotel name"
                    value={formData.hotelName}
                    onChange={(e) => setFormData({ ...formData, hotelName: e.target.value })}
                  />
                </Field>

                <Field>
                  <FieldLabel htmlFor="hotelAddress">Address</FieldLabel>
                  <Input
                    id="hotelAddress"
                    placeholder="Enter full address"
                    value={formData.hotelAddress}
                    onChange={(e) => setFormData({ ...formData, hotelAddress: e.target.value })}
                  />
                </Field>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field>
                    <FieldLabel htmlFor="hotelPhone">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        Phone Number
                      </span>
                    </FieldLabel>
                    <Input
                      id="hotelPhone"
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.hotelPhone}
                      onChange={(e) => setFormData({ ...formData, hotelPhone: e.target.value })}
                    />
                  </Field>

                  <Field>
                    <FieldLabel htmlFor="hotelEmail">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email Address
                      </span>
                    </FieldLabel>
                    <Input
                      id="hotelEmail"
                      type="email"
                      placeholder="info@hotel.com"
                      value={formData.hotelEmail}
                      onChange={(e) => setFormData({ ...formData, hotelEmail: e.target.value })}
                    />
                  </Field>
                </div>

                <Field>
                  <FieldLabel htmlFor="hotelWebsite">
                    <span className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      Website
                    </span>
                  </FieldLabel>
                  <Input
                    id="hotelWebsite"
                    placeholder="www.hotel.com"
                    value={formData.hotelWebsite}
                    onChange={(e) => setFormData({ ...formData, hotelWebsite: e.target.value })}
                  />
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>

          {/* Additional Links */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5" />
                    Additional Links
                  </CardTitle>
                  <CardDescription>
                    Add additional links to display on reports (optional)
                  </CardDescription>
                </div>
                <Button type="button" variant="outline" size="sm" onClick={addLink}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add Link
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {formData.otherLinks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No additional links added. Click &quot;Add Link&quot; to add one.
                </p>
              ) : (
                <div className="space-y-3">
                  {formData.otherLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Input
                        placeholder="Label (e.g., Instagram)"
                        value={link.label}
                        onChange={(e) => updateLink(index, 'label', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL (e.g., https://instagram.com/hotel)"
                        value={link.url}
                        onChange={(e) => updateLink(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeLink(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex items-center justify-end gap-4">
            {saveSuccess && (
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" />
                Settings saved successfully
              </span>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <Spinner className="h-4 w-4 mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Settings
            </Button>
          </div>
        </div>
      </form>
    </AppShell>
  )
}

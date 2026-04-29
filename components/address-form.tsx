"use client"

import { useState, useEffect } from "react"
import { SavedAddress, AddressFormData } from "@/lib/types"
import { AddressAutocomplete, AddressComponents } from "./address-autocomplete"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Home, Briefcase, MapPin, Loader2, ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { OTPVerificationDialog } from "./otp-verification-dialog"

interface AddressFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (address: AddressFormData) => void
  editingAddress?: SavedAddress | null
}

const addressTypes = [
  { value: "home", label: "Home", icon: Home },
  { value: "work", label: "Work", icon: Briefcase },
  { value: "other", label: "Other", icon: MapPin },
] as const

export function AddressForm({
  open,
  onOpenChange,
  onSave,
  editingAddress,
}: AddressFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPDialog, setShowOTPDialog] = useState(false)
  const [pendingFormData, setPendingFormData] = useState<AddressFormData | null>(null)
  const [postalCodeError, setPostalCodeError] = useState("")
  const [formData, setFormData] = useState<AddressFormData>({
    label: "",
    type: "home",
    buildingFloor: "",
    streetAddress: "",
    city: "",
    state: "",
    country: "",
    postalCode: "",
    formattedAddress: "",
    placeId: "",
    latitude: 0,
    longitude: 0,
    isDefault: false,
    phone: "",
    recipientName: "",
  })

  useEffect(() => {
    if (editingAddress) {
      setFormData({
        label: editingAddress.label,
        type: editingAddress.type,
        buildingFloor: editingAddress.buildingFloor || "",
        streetAddress: editingAddress.streetAddress || "",
        city: editingAddress.city,
        state: editingAddress.state,
        country: editingAddress.country,
        postalCode: editingAddress.postalCode,
        formattedAddress: editingAddress.formattedAddress,
        placeId: editingAddress.placeId,
        latitude: editingAddress.latitude,
        longitude: editingAddress.longitude,
        isDefault: editingAddress.isDefault,
        phone: editingAddress.phone || "",
        recipientName: editingAddress.recipientName || "",
      })
    } else {
      setFormData({
        label: "",
        type: "home",
        buildingFloor: "",
        streetAddress: "",
        city: "",
        state: "",
        country: "",
        postalCode: "",
        formattedAddress: "",
        placeId: "",
        latitude: 0,
        longitude: 0,
        isDefault: false,
        phone: "",
        recipientName: "",
      })
    }
  }, [editingAddress, open])

  // Validate postal code - must be exactly 6 digits
  const validatePostalCode = (value: string): boolean => {
    const postalCodeRegex = /^\d{6}$/
    return postalCodeRegex.test(value)
  }

  const handlePostalCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6) // Only allow digits, max 6
    setFormData((prev) => ({ ...prev, postalCode: value }))
    
    if (value.length === 0) {
      setPostalCodeError("")
    } else if (value.length < 6) {
      setPostalCodeError("Postal code must be 6 digits")
    } else if (!validatePostalCode(value)) {
      setPostalCodeError("Invalid postal code format")
    } else {
      setPostalCodeError("")
    }
  }

  const handleAddressSelect = (address: AddressComponents) => {
    setFormData((prev) => ({
      ...prev,
      streetAddress: address.streetAddress,
      city: address.city,
      state: address.state,
      country: address.country,
      postalCode: address.postalCode,
      formattedAddress: address.formattedAddress,
      placeId: address.placeId,
      latitude: address.latitude,
      longitude: address.longitude,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Build formatted address from components if manually edited
    const updatedFormData = {
      ...formData,
      formattedAddress: formData.formattedAddress || 
        [formData.streetAddress, formData.city, formData.state, formData.postalCode, formData.country]
          .filter(Boolean)
          .join(", "),
    }

    // Store pending data and show OTP dialog
    setPendingFormData(updatedFormData)
    setShowOTPDialog(true)
  }

  // Called after successful OTP verification
  const handleOTPVerifySuccess = async () => {
    if (!pendingFormData) return

    setIsLoading(true)

    // Simulate API delay for saving
    await new Promise((resolve) => setTimeout(resolve, 500))

    onSave(pendingFormData)
    setPendingFormData(null)
    setIsLoading(false)
    onOpenChange(false)
  }

  // Simulate sending OTP to phone
  const handleResendOTP = async () => {
    // In production, call your SMS API here
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  const isPostalCodeValid = validatePostalCode(formData.postalCode)
  
  const isValid =
    formData.streetAddress && 
    formData.city && 
    formData.state && 
    formData.postalCode && 
    isPostalCodeValid &&
    formData.recipientName && 
    formData.phone

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[540px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {editingAddress ? "Edit Address" : "Add New Address"}
          </DialogTitle>
          <DialogDescription>
            Search for your address or enter the details manually.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 py-2">
          {/* Address Type */}
          <FieldGroup>
            <FieldLabel>Address Type</FieldLabel>
            <RadioGroup
              value={formData.type}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  type: value as "home" | "work" | "other",
                }))
              }
              className="flex gap-3"
            >
              {addressTypes.map(({ value, label, icon: Icon }) => (
                <Label
                  key={value}
                  htmlFor={value}
                  className={cn(
                    "flex-1 flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition-all",
                    formData.type === value
                      ? "border-primary bg-primary/5"
                      : "border-muted hover:border-muted-foreground/30"
                  )}
                >
                  <RadioGroupItem value={value} id={value} className="sr-only" />
                  <Icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{label}</span>
                </Label>
              ))}
            </RadioGroup>
          </FieldGroup>

          {/* Search Address */}
          <Field>
            <FieldLabel>Search Address</FieldLabel>
            <AddressAutocomplete
              onAddressSelect={handleAddressSelect}
              placeholder="Type to search for your address..."
              defaultValue={formData.formattedAddress}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Start typing to search. Fields below will auto-fill.
            </p>
          </Field>

          {/* Building / Floor */}
          <Field>
            <FieldLabel>Building / Floor</FieldLabel>
            <Input
              value={formData.buildingFloor}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  buildingFloor: e.target.value,
                }))
              }
              placeholder="e.g., Tower A, 5th Floor, Flat 502"
            />
          </Field>

          {/* Street Address */}
          <Field>
            <FieldLabel>Street Address *</FieldLabel>
            <Input
              value={formData.streetAddress}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  streetAddress: e.target.value,
                }))
              }
              placeholder="Street name, Area, Landmark"
            />
          </Field>

          {/* City and State/Province Row */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>City / Town *</FieldLabel>
              <Input
                value={formData.city}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    city: e.target.value,
                  }))
                }
                placeholder="City or Town"
              />
            </Field>
            <Field>
              <FieldLabel>State / Province *</FieldLabel>
              <Input
                value={formData.state}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    state: e.target.value,
                  }))
                }
                placeholder="State, Province, or Region"
              />
            </Field>
          </div>

          {/* Postal Code and Country Row */}
          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Postal Code *</FieldLabel>
              <Input
                value={formData.postalCode}
                onChange={handlePostalCodeChange}
                placeholder="6-digit postal code"
                maxLength={6}
                inputMode="numeric"
                pattern="[0-9]*"
                className={cn(
                  postalCodeError && "border-destructive focus-visible:ring-destructive"
                )}
              />
              {postalCodeError && (
                <p className="text-xs text-destructive mt-1">{postalCodeError}</p>
              )}
            </Field>
            <Field>
              <FieldLabel>Country</FieldLabel>
              <Input
                value={formData.country}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    country: e.target.value,
                  }))
                }
                placeholder="Country"
              />
            </Field>
          </div>

          {/* Divider */}
          <div className="border-t pt-4">
            <p className="text-sm font-medium text-muted-foreground mb-4">Contact Details</p>
          </div>

          {/* Recipient Name */}
          <Field>
            <FieldLabel>Recipient Name *</FieldLabel>
            <Input
              value={formData.recipientName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  recipientName: e.target.value,
                }))
              }
              placeholder="Full name"
            />
          </Field>

          {/* Phone Number */}
          <Field>
            <FieldLabel>Phone Number *</FieldLabel>
            <Input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, phone: e.target.value }))
              }
              placeholder="Enter phone number with country code"
            />
          </Field>

          {/* Label (Optional) */}
          <Field>
            <FieldLabel>Label (Optional)</FieldLabel>
            <Input
              value={formData.label}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, label: e.target.value }))
              }
              placeholder="e.g., Mom's House, Office Building A"
            />
          </Field>

          {/* Set as Default */}
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div className="space-y-0.5">
              <Label
                htmlFor="default-address"
                className="text-sm font-medium cursor-pointer"
              >
                Set as default address
              </Label>
              <p className="text-xs text-muted-foreground">
                This will be your primary delivery address
              </p>
            </div>
            <Switch
              id="default-address"
              checked={formData.isDefault}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, isDefault: checked }))
              }
            />
          </div>

          {/* OTP Verification Notice */}
          <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
            <ShieldCheck className="h-4 w-4 text-primary flex-shrink-0" />
            <p className="text-xs text-muted-foreground">
              OTP verification will be sent to your phone number for security
            </p>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!isValid || isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingAddress ? "Verify & Save" : "Verify & Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>

      {/* OTP Verification Dialog */}
      <OTPVerificationDialog
        open={showOTPDialog}
        onOpenChange={setShowOTPDialog}
        phoneNumber={formData.phone}
        onVerifySuccess={handleOTPVerifySuccess}
        onResendOTP={handleResendOTP}
      />
    </Dialog>
  )
}

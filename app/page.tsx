"use client"

import { useState, useEffect } from "react"
import { SavedAddress } from "@/lib/types"
import { AddressList } from "@/components/address-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MapPin, Star, CheckCircle } from "lucide-react"

// Local storage key for persisting addresses
const STORAGE_KEY = "addressfinder_addresses"

export default function AddressFinderPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([])
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(
    null
  )
  const [mounted, setMounted] = useState(false)

  // Load addresses from localStorage on mount
  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        // Convert date strings back to Date objects
        const addressesWithDates = parsed.map((addr: SavedAddress) => ({
          ...addr,
          createdAt: new Date(addr.createdAt),
        }))
        setAddresses(addressesWithDates)
        // Auto-select default address
        const defaultAddr = addressesWithDates.find(
          (addr: SavedAddress) => addr.isDefault
        )
        if (defaultAddr) {
          setSelectedAddress(defaultAddr)
        }
      } catch {
        // Invalid stored data
        localStorage.removeItem(STORAGE_KEY)
      }
    }
  }, [])

  // Save addresses to localStorage whenever they change
  useEffect(() => {
    if (mounted && addresses.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses))
    } else if (mounted && addresses.length === 0) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [addresses, mounted])

  const handleAddressChange = (newAddresses: SavedAddress[]) => {
    setAddresses(newAddresses)
    // Update selected address if it was modified or deleted
    if (selectedAddress) {
      const updated = newAddresses.find((addr) => addr.id === selectedAddress.id)
      if (updated) {
        setSelectedAddress(updated)
      } else {
        // Selected address was deleted, select default or first
        const defaultAddr = newAddresses.find((addr) => addr.isDefault)
        setSelectedAddress(defaultAddr || newAddresses[0] || null)
      }
    }
  }

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddress(address)
  }

  const defaultAddress = addresses.find((addr) => addr.isDefault)

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">AddressFinder</h1>
              <p className="text-sm text-muted-foreground">
                Manage your delivery addresses
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Address List - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <AddressList
              addresses={addresses}
              onAddressChange={handleAddressChange}
              selectedAddressId={selectedAddress?.id}
              onSelectAddress={handleSelectAddress}
            />
          </div>

          {/* Sidebar - Selected Address Info */}
          <div className="space-y-4">
            {/* Default Address Quick View */}
            {defaultAddress && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 fill-primary text-primary" />
                    <CardTitle className="text-sm font-medium">
                      Default Address
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm font-medium text-foreground">
                    {defaultAddress.label ||
                      defaultAddress.type.charAt(0).toUpperCase() +
                        defaultAddress.type.slice(1)}
                  </p>
                  {defaultAddress.buildingFloor && (
                    <p className="mt-1 text-sm text-foreground font-medium">
                      {defaultAddress.buildingFloor}
                    </p>
                  )}
                  <p className="text-sm text-foreground">
                    {defaultAddress.streetAddress}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {[defaultAddress.city, defaultAddress.state, defaultAddress.postalCode].filter(Boolean).join(", ")}
                  </p>
                  {defaultAddress.recipientName && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      {defaultAddress.recipientName} | {defaultAddress.phone}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Selected Address Details */}
            {selectedAddress && (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <CardTitle className="text-sm font-medium">
                        Selected for Delivery
                      </CardTitle>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedAddress.type}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 space-y-3">
                  <div>
                    <p className="font-semibold text-foreground">
                      {selectedAddress.label ||
                        selectedAddress.type.charAt(0).toUpperCase() +
                          selectedAddress.type.slice(1)}
                    </p>
                    {selectedAddress.buildingFloor && (
                      <p className="mt-1 text-sm text-foreground font-medium">
                        {selectedAddress.buildingFloor}
                      </p>
                    )}
                    <p className="text-sm text-foreground">
                      {selectedAddress.streetAddress}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {[selectedAddress.city, selectedAddress.state, selectedAddress.postalCode].filter(Boolean).join(", ")}
                    </p>
                  </div>

                  <div className="border-t pt-3 space-y-2">
                    {selectedAddress.recipientName && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Recipient</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.recipientName}
                        </span>
                      </div>
                    )}
                    {selectedAddress.phone && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Phone</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.phone}
                        </span>
                      </div>
                    )}
                    {selectedAddress.city && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">City</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.city}
                        </span>
                      </div>
                    )}
                    {selectedAddress.state && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">State</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.state}
                        </span>
                      </div>
                    )}
                    {selectedAddress.postalCode && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Postal Code</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.postalCode}
                        </span>
                      </div>
                    )}
                    {selectedAddress.country && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Country</span>
                        <span className="font-medium text-foreground">
                          {selectedAddress.country}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Tips Card */}
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <h3 className="font-medium text-foreground text-sm mb-2">
                  Quick Tips
                </h3>
                <ul className="text-xs text-muted-foreground space-y-1.5">
                  <li>Click on an address card to select it for delivery</li>
                  <li>Use the menu (three dots) to edit, delete, or set as default</li>
                  <li>Your default address is marked with a star</li>
                  <li>Addresses are saved locally in your browser</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

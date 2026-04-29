"use client"

import { useState } from "react"
import { SavedAddress, AddressFormData } from "@/lib/types"
import { AddressCard } from "./address-card"
import { AddressForm } from "./address-form"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty"
import { Plus, MapPin } from "lucide-react"

interface AddressListProps {
  addresses: SavedAddress[]
  onAddressChange: (addresses: SavedAddress[]) => void
  selectedAddressId?: string
  onSelectAddress?: (address: SavedAddress) => void
  showAddButton?: boolean
}

export function AddressList({
  addresses,
  onAddressChange,
  selectedAddressId,
  onSelectAddress,
  showAddButton = true,
}: AddressListProps) {
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<SavedAddress | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  const handleAddNew = () => {
    setEditingAddress(null)
    setIsFormOpen(true)
  }

  const handleEdit = (address: SavedAddress) => {
    setEditingAddress(address)
    setIsFormOpen(true)
  }

  const handleSave = (formData: AddressFormData) => {
    if (editingAddress) {
      // Update existing address
      const updated = addresses.map((addr) => {
        if (addr.id === editingAddress.id) {
          return {
            ...addr,
            ...formData,
          }
        }
        // If new address is default, remove default from others
        if (formData.isDefault && addr.isDefault) {
          return { ...addr, isDefault: false }
        }
        return addr
      })
      onAddressChange(updated)
    } else {
      // Add new address
      const newAddress: SavedAddress = {
        ...formData,
        id: crypto.randomUUID(),
        createdAt: new Date(),
      }

      // If new address is default, remove default from others
      let updated = addresses
      if (formData.isDefault) {
        updated = addresses.map((addr) => ({ ...addr, isDefault: false }))
      }

      // If this is the first address, make it default
      if (addresses.length === 0) {
        newAddress.isDefault = true
      }

      onAddressChange([...updated, newAddress])
    }
  }

  const handleDelete = (id: string) => {
    const addressToDelete = addresses.find((addr) => addr.id === id)
    const updated = addresses.filter((addr) => addr.id !== id)

    // If deleted address was default, make the first remaining address default
    if (addressToDelete?.isDefault && updated.length > 0) {
      updated[0].isDefault = true
    }

    onAddressChange(updated)
    setDeleteConfirmId(null)
  }

  const handleSetDefault = (id: string) => {
    const updated = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === id,
    }))
    onAddressChange(updated)
  }

  const sortedAddresses = [...addresses].sort((a, b) => {
    if (a.isDefault && !b.isDefault) return -1
    if (!a.isDefault && b.isDefault) return 1
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      {showAddButton && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Saved Addresses
            </h2>
            <p className="text-sm text-muted-foreground">
              {addresses.length} address{addresses.length !== 1 ? "es" : ""} saved
            </p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Add New
          </Button>
        </div>
      )}

      {/* Address Cards */}
      {sortedAddresses.length > 0 ? (
        <div className="grid gap-3">
          {sortedAddresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={handleEdit}
              onDelete={(id) => setDeleteConfirmId(id)}
              onSetDefault={handleSetDefault}
              isSelected={selectedAddressId === address.id}
              onSelect={onSelectAddress}
            />
          ))}
        </div>
      ) : (
        <Empty className="py-12">
          <MapPin className="h-10 w-10 text-muted-foreground" />
          <EmptyTitle>No addresses saved</EmptyTitle>
          <EmptyDescription>
            Add your first address to get started with deliveries
          </EmptyDescription>
          <Button onClick={handleAddNew} className="mt-4 gap-2">
            <Plus className="h-4 w-4" />
            Add Address
          </Button>
        </Empty>
      )}

      {/* Add/Edit Form Dialog */}
      <AddressForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onSave={handleSave}
        editingAddress={editingAddress}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!deleteConfirmId}
        onOpenChange={() => setDeleteConfirmId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Address</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this address? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

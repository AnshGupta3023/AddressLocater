export interface SavedAddress {
  id: string
  label: string
  type: "home" | "work" | "other"
  buildingFloor: string
  streetAddress: string
  city: string
  state: string
  country: string
  postalCode: string
  formattedAddress: string
  placeId: string
  latitude: number
  longitude: number
  isDefault: boolean
  phone?: string
  recipientName?: string
  createdAt: Date
}

export type AddressFormData = Omit<SavedAddress, "id" | "createdAt">

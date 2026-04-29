"use client"

import { SavedAddress } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Home,
  Briefcase,
  MapPin,
  MoreVertical,
  Pencil,
  Trash2,
  Star,
  Phone,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface AddressCardProps {
  address: SavedAddress
  onEdit: (address: SavedAddress) => void
  onDelete: (id: string) => void
  onSetDefault: (id: string) => void
  isSelected?: boolean
  onSelect?: (address: SavedAddress) => void
}

const typeIcons = {
  home: Home,
  work: Briefcase,
  other: MapPin,
}

const typeLabels = {
  home: "Home",
  work: "Work",
  other: "Other",
}

export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault,
  isSelected,
  onSelect,
}: AddressCardProps) {
  const Icon = typeIcons[address.type]

  return (
    <Card
      className={cn(
        "relative transition-all cursor-pointer hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20",
        address.isDefault && "border-primary/30"
      )}
      onClick={() => onSelect?.(address)}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
                address.type === "home" && "bg-blue-100 text-blue-600",
                address.type === "work" && "bg-amber-100 text-amber-600",
                address.type === "other" && "bg-gray-100 text-gray-600"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-foreground">
                  {address.label || typeLabels[address.type]}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {typeLabels[address.type]}
                </Badge>
                {address.isDefault && (
                  <Badge className="bg-primary text-primary-foreground text-xs">
                    <Star className="h-3 w-3 mr-1 fill-current" />
                    Default
                  </Badge>
                )}
              </div>

              {address.recipientName && (
                <div className="flex items-center gap-1.5 mt-1.5 text-sm text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{address.recipientName}</span>
                </div>
              )}

              {address.buildingFloor && (
                <p className="mt-1.5 text-sm text-foreground font-medium">
                  {address.buildingFloor}
                </p>
              )}
              <p className={cn("text-sm text-foreground leading-relaxed", !address.buildingFloor && "mt-1.5")}>
                {address.streetAddress}
              </p>
              <p className="text-sm text-muted-foreground">
                {[address.city, address.state, address.postalCode].filter(Boolean).join(", ")}
              </p>
              {address.country && (
                <p className="text-sm text-muted-foreground">
                  {address.country}
                </p>
              )}

              {address.phone && (
                <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                  <Phone className="h-3.5 w-3.5" />
                  <span>{address.phone}</span>
                </div>
              )}
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(address)
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              {!address.isDefault && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation()
                    onSetDefault(address.id)
                  }}
                >
                  <Star className="h-4 w-4 mr-2" />
                  Set as default
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(address.id)
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

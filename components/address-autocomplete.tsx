"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { Input } from "@/components/ui/input"
import { MapPin, Loader2, Search } from "lucide-react"
import { cn } from "@/lib/utils"

export interface AddressComponents {
  streetAddress: string
  city: string
  state: string
  country: string
  postalCode: string
  formattedAddress: string
  placeId: string
  latitude: number
  longitude: number
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: AddressComponents) => void
  placeholder?: string
  className?: string
  defaultValue?: string
}

interface Prediction {
  placePrediction: {
    placeId: string
    text: {
      text: string
    }
    structuredFormat?: {
      mainText: { text: string }
      secondaryText: { text: string }
    }
  }
}

declare global {
  interface Window {
    google: typeof google
  }
}

export function AddressAutocomplete({
  onAddressSelect,
  placeholder = "Search for an address...",
  className,
  defaultValue = "",
}: AddressAutocompleteProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState(defaultValue)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true)
        setIsLoading(false)
        return
      }

      const existingScript = document.querySelector(
        'script[src*="maps.googleapis.com"]'
      )
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsLoaded(true)
          setIsLoading(false)
        })
        return
      }

      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!apiKey) {
        console.error("Google Maps API key is not configured")
        setIsLoading(false)
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&loading=async`
      script.async = true
      script.defer = true
      script.onload = () => {
        setIsLoaded(true)
        setIsLoading(false)
      }
      script.onerror = () => {
        console.error("Failed to load Google Maps script")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [])

  // Create session token when loaded
  useEffect(() => {
    if (isLoaded && window.google?.maps?.places) {
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    }
  }, [isLoaded])

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch predictions using AutocompleteSuggestion
  const fetchPredictions = useCallback(async (query: string) => {
    if (!isLoaded || !query.trim() || query.length < 3) {
      setPredictions([])
      return
    }

    setIsSearching(true)

    try {
      const { AutocompleteSuggestion } = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary
      
      const request = {
        input: query,
        sessionToken: sessionTokenRef.current,
      }

      const { suggestions } = await AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
      
      setPredictions(suggestions as unknown as Prediction[])
      setShowDropdown(true)
    } catch (error) {
      console.error("Error fetching predictions:", error)
      setPredictions([])
    } finally {
      setIsSearching(false)
    }
  }, [isLoaded])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(value)
    }, 300)
  }

  // Extract address components from place details - supports international formats
  const extractAddressComponents = useCallback((place: google.maps.places.Place): AddressComponents => {
    const components: AddressComponents = {
      streetAddress: "",
      city: "",
      state: "",
      country: "",
      postalCode: "",
      formattedAddress: place.formattedAddress || "",
      placeId: place.id || "",
      latitude: place.location?.lat() || 0,
      longitude: place.location?.lng() || 0,
    }

    const addressComponents = place.addressComponents || []
    
    // Street-level components
    let streetNumber = ""
    let route = ""
    let premise = ""
    let subpremise = ""
    let neighborhood = ""
    let sublocalityLevel3 = ""
    let sublocalityLevel2 = ""
    let sublocalityLevel1 = ""
    
    // City-level components (varies by country)
    let locality = ""
    let postalTown = "" // UK
    let adminAreaLevel2 = "" // County/District in some countries
    let adminAreaLevel3 = "" // Municipality in some countries
    
    // State/Province level
    let adminAreaLevel1 = ""

    addressComponents.forEach((component) => {
      const types = component.types
      const value = component.longText || component.shortText || ""

      // Street-level
      if (types.includes("street_number")) streetNumber = value
      if (types.includes("route")) route = value
      if (types.includes("premise")) premise = value
      if (types.includes("subpremise")) subpremise = value
      if (types.includes("neighborhood")) neighborhood = value
      if (types.includes("sublocality_level_3")) sublocalityLevel3 = value
      if (types.includes("sublocality_level_2")) sublocalityLevel2 = value
      if (types.includes("sublocality_level_1") || types.includes("sublocality")) sublocalityLevel1 = value
      
      // City-level (different countries use different types)
      if (types.includes("locality")) locality = value
      if (types.includes("postal_town")) postalTown = value
      if (types.includes("administrative_area_level_3")) adminAreaLevel3 = value
      if (types.includes("administrative_area_level_2")) adminAreaLevel2 = value
      
      // State/Province/Region
      if (types.includes("administrative_area_level_1")) adminAreaLevel1 = value
      
      // Country and Postal Code
      if (types.includes("country")) components.country = value
      if (types.includes("postal_code")) components.postalCode = value
    })

    // Determine city - priority varies by country format
    // locality > postal_town (UK) > admin_area_level_3 > admin_area_level_2 > sublocality_level_1
    components.city = locality || postalTown || adminAreaLevel3 || adminAreaLevel2 || sublocalityLevel1 || ""
    
    // State/Province/Region
    components.state = adminAreaLevel1 || ""

    // Build comprehensive street address from all available parts
    const streetParts: string[] = []
    
    // Add building/premise info
    if (premise) streetParts.push(premise)
    if (subpremise) streetParts.push(subpremise)
    
    // Add street number and route
    if (streetNumber && route) {
      streetParts.push(`${streetNumber} ${route}`)
    } else if (route) {
      streetParts.push(route)
    } else if (streetNumber) {
      streetParts.push(streetNumber)
    }
    
    // Add neighborhood/area info
    if (neighborhood) streetParts.push(neighborhood)
    if (sublocalityLevel3) streetParts.push(sublocalityLevel3)
    if (sublocalityLevel2) streetParts.push(sublocalityLevel2)
    
    // Only add sublocalityLevel1 to street if it's not being used as city
    if (sublocalityLevel1 && sublocalityLevel1 !== components.city) {
      streetParts.push(sublocalityLevel1)
    }

    // If we have address parts, join them; otherwise extract from formatted address
    if (streetParts.length > 0) {
      components.streetAddress = streetParts.join(", ")
    } else {
      // Fallback: use formatted address minus city, state, postal code, country
      const formatted = place.formattedAddress || ""
      const partsToRemove = [components.city, components.state, components.postalCode, components.country].filter(Boolean)
      let streetAddr = formatted
      partsToRemove.forEach((part) => {
        if (part) {
          streetAddr = streetAddr.replace(new RegExp(`,?\\s*${part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`, "gi"), "")
        }
      })
      components.streetAddress = streetAddr.replace(/,\s*$/, "").replace(/^\s*,/, "").trim() || formatted.split(",")[0] || ""
    }

    return components
  }, [])

  // Handle place selection
  const handleSelectPlace = async (prediction: Prediction) => {
    const placeId = prediction.placePrediction.placeId
    setInputValue(prediction.placePrediction.text.text)
    setShowDropdown(false)
    setIsSearching(true)

    try {
      const { Place } = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary

      const place = new Place({
        id: placeId,
      })

      await place.fetchFields({
        fields: ["formattedAddress", "addressComponents", "location", "id"],
      })

      const addressData = extractAddressComponents(place)
      onAddressSelect(addressData)

      // Create new session token after place selection
      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    } catch (error) {
      console.error("Error fetching place details:", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => predictions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder}
          className="pl-10 pr-10"
          disabled={isLoading}
        />
        {(isLoading || isSearching) && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Predictions Dropdown */}
      {showDropdown && predictions.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg">
          <ul className="max-h-60 overflow-auto py-1">
            {predictions.map((prediction, index) => (
              <li
                key={prediction.placePrediction.placeId || index}
                className="flex cursor-pointer items-start gap-3 px-3 py-2.5 hover:bg-accent transition-colors"
                onClick={() => handleSelectPlace(prediction)}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  {prediction.placePrediction.structuredFormat ? (
                    <>
                      <p className="text-sm font-medium truncate">
                        {prediction.placePrediction.structuredFormat.mainText.text}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {prediction.placePrediction.structuredFormat.secondaryText.text}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm truncate">
                      {prediction.placePrediction.text.text}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && !isLoading && (
        <p className="mt-2 text-sm text-destructive">
          Google Maps API key is not configured. Please add
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
        </p>
      )}
    </div>
  )
}

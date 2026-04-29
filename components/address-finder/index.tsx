/**
 * AddressFinder - A reusable Google Places Address Autocomplete Component
 * 
 * This is a platform-independent React component that can be used in any React.js project.
 * It uses Google Places API (New) for address autocomplete functionality.
 * 
 * Required: Google Maps API Key with Places API enabled
 * 
 * Usage:
 * ```tsx
 * import { AddressFinder, AddressData } from './components/address-finder'
 * 
 * function MyComponent() {
 *   const handleAddressSelect = (address: AddressData) => {
 *     console.log(address)
 *   }
 * 
 *   return (
 *     <AddressFinder
 *       apiKey="YOUR_GOOGLE_MAPS_API_KEY"
 *       onAddressSelect={handleAddressSelect}
 *     />
 *   )
 * }
 * ```
 */

import React, { useEffect, useRef, useState, useCallback } from "react"

// ============================================================================
// TYPES
// ============================================================================

export interface AddressData {
  /** Full street address (e.g., "123 Main Street, Apt 4B, Downtown") */
  streetAddress: string
  /** City or town name */
  city: string
  /** State, province, or region */
  state: string
  /** Country name */
  country: string
  /** Postal or ZIP code */
  postalCode: string
  /** Complete formatted address from Google */
  formattedAddress: string
  /** Google Place ID for the selected address */
  placeId: string
  /** Latitude coordinate */
  latitude: number
  /** Longitude coordinate */
  longitude: number
}

export interface AddressFinderProps {
  /** Your Google Maps API Key (required) */
  apiKey: string
  /** Callback when an address is selected */
  onAddressSelect: (address: AddressData) => void
  /** Input placeholder text */
  placeholder?: string
  /** Default value for the input */
  defaultValue?: string
  /** Debounce delay in milliseconds (default: 300) */
  debounceMs?: number
  /** Minimum characters before searching (default: 3) */
  minChars?: number
  /** Custom class name for the container */
  className?: string
  /** Custom class name for the input */
  inputClassName?: string
  /** Custom class name for the dropdown */
  dropdownClassName?: string
  /** Custom class name for dropdown items */
  itemClassName?: string
  /** Disable the input */
  disabled?: boolean
  /** Custom styles for the container */
  style?: React.CSSProperties
  /** Custom loading indicator */
  loadingIndicator?: React.ReactNode
  /** Custom search icon */
  searchIcon?: React.ReactNode
  /** Custom location icon for dropdown items */
  locationIcon?: React.ReactNode
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

// ============================================================================
// DEFAULT STYLES (can be overridden with className props)
// ============================================================================

const defaultStyles = {
  container: {
    position: "relative" as const,
    width: "100%",
  },
  inputWrapper: {
    position: "relative" as const,
    display: "flex",
    alignItems: "center",
  },
  input: {
    width: "100%",
    padding: "10px 40px",
    fontSize: "14px",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  },
  inputFocused: {
    borderColor: "#3b82f6",
    boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
  },
  iconLeft: {
    position: "absolute" as const,
    left: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
    pointerEvents: "none" as const,
  },
  iconRight: {
    position: "absolute" as const,
    right: "12px",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9ca3af",
  },
  dropdown: {
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 50,
    maxHeight: "240px",
    overflowY: "auto" as const,
  },
  dropdownItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: "12px",
    padding: "12px",
    cursor: "pointer",
    transition: "background-color 0.15s",
  },
  dropdownItemHover: {
    backgroundColor: "#f3f4f6",
  },
  itemIcon: {
    marginTop: "2px",
    color: "#9ca3af",
    flexShrink: 0,
  },
  itemContent: {
    flex: 1,
    minWidth: 0,
  },
  itemMain: {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  itemSecondary: {
    fontSize: "12px",
    color: "#6b7280",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap" as const,
  },
  errorText: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#ef4444",
  },
}

// ============================================================================
// DEFAULT ICONS (SVG)
// ============================================================================

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
)

const LocationIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
)

const LoadingSpinner = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: "spin 1s linear infinite" }}>
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
  </svg>
)

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function AddressFinder({
  apiKey,
  onAddressSelect,
  placeholder = "Search for an address...",
  defaultValue = "",
  debounceMs = 300,
  minChars = 3,
  className,
  inputClassName,
  dropdownClassName,
  itemClassName,
  disabled = false,
  style,
  loadingIndicator,
  searchIcon,
  locationIcon,
}: AddressFinderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [inputValue, setInputValue] = useState(defaultValue)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [hoveredIndex, setHoveredIndex] = useState(-1)
  
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Load Google Maps script
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      if (window.google?.maps?.places) {
        setIsLoaded(true)
        setIsLoading(false)
        return
      }

      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]')
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          setIsLoaded(true)
          setIsLoading(false)
        })
        return
      }

      if (!apiKey) {
        console.error("[AddressFinder] Google Maps API key is required")
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
        console.error("[AddressFinder] Failed to load Google Maps script")
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    loadGoogleMapsScript()
  }, [apiKey])

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

  // Extract address components - supports international formats
  const extractAddressComponents = useCallback((place: google.maps.places.Place): AddressData => {
    const components: AddressData = {
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
    let postalTown = ""
    let adminAreaLevel2 = ""
    let adminAreaLevel3 = ""
    
    // State/Province level
    let adminAreaLevel1 = ""

    addressComponents.forEach((component) => {
      const types = component.types
      const value = component.longText || component.shortText || ""

      if (types.includes("street_number")) streetNumber = value
      if (types.includes("route")) route = value
      if (types.includes("premise")) premise = value
      if (types.includes("subpremise")) subpremise = value
      if (types.includes("neighborhood")) neighborhood = value
      if (types.includes("sublocality_level_3")) sublocalityLevel3 = value
      if (types.includes("sublocality_level_2")) sublocalityLevel2 = value
      if (types.includes("sublocality_level_1") || types.includes("sublocality")) sublocalityLevel1 = value
      if (types.includes("locality")) locality = value
      if (types.includes("postal_town")) postalTown = value
      if (types.includes("administrative_area_level_3")) adminAreaLevel3 = value
      if (types.includes("administrative_area_level_2")) adminAreaLevel2 = value
      if (types.includes("administrative_area_level_1")) adminAreaLevel1 = value
      if (types.includes("country")) components.country = value
      if (types.includes("postal_code")) components.postalCode = value
    })

    // Determine city
    components.city = locality || postalTown || adminAreaLevel3 || adminAreaLevel2 || sublocalityLevel1 || ""
    components.state = adminAreaLevel1 || ""

    // Build street address
    const streetParts: string[] = []
    if (premise) streetParts.push(premise)
    if (subpremise) streetParts.push(subpremise)
    if (streetNumber && route) {
      streetParts.push(`${streetNumber} ${route}`)
    } else if (route) {
      streetParts.push(route)
    } else if (streetNumber) {
      streetParts.push(streetNumber)
    }
    if (neighborhood) streetParts.push(neighborhood)
    if (sublocalityLevel3) streetParts.push(sublocalityLevel3)
    if (sublocalityLevel2) streetParts.push(sublocalityLevel2)
    if (sublocalityLevel1 && sublocalityLevel1 !== components.city) {
      streetParts.push(sublocalityLevel1)
    }

    if (streetParts.length > 0) {
      components.streetAddress = streetParts.join(", ")
    } else {
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

  // Fetch predictions
  const fetchPredictions = useCallback(async (query: string) => {
    if (!isLoaded || !query.trim() || query.length < minChars) {
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
      console.error("[AddressFinder] Error fetching predictions:", error)
      setPredictions([])
    } finally {
      setIsSearching(false)
    }
  }, [isLoaded, minChars])

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      fetchPredictions(value)
    }, debounceMs)
  }

  // Handle place selection
  const handleSelectPlace = async (prediction: Prediction) => {
    const placeId = prediction.placePrediction.placeId
    setInputValue(prediction.placePrediction.text.text)
    setShowDropdown(false)
    setIsSearching(true)

    try {
      const { Place } = await window.google.maps.importLibrary("places") as google.maps.PlacesLibrary

      const place = new Place({ id: placeId })

      await place.fetchFields({
        fields: ["formattedAddress", "addressComponents", "location", "id"],
      })

      const addressData = extractAddressComponents(place)
      onAddressSelect(addressData)

      sessionTokenRef.current = new window.google.maps.places.AutocompleteSessionToken()
    } catch (error) {
      console.error("[AddressFinder] Error fetching place details:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || predictions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setHoveredIndex((prev) => (prev < predictions.length - 1 ? prev + 1 : 0))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setHoveredIndex((prev) => (prev > 0 ? prev - 1 : predictions.length - 1))
    } else if (e.key === "Enter" && hoveredIndex >= 0) {
      e.preventDefault()
      handleSelectPlace(predictions[hoveredIndex])
    } else if (e.key === "Escape") {
      setShowDropdown(false)
    }
  }

  const inputStyles = {
    ...defaultStyles.input,
    ...(isFocused ? defaultStyles.inputFocused : {}),
  }

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ ...defaultStyles.container, ...style }}
    >
      <div style={defaultStyles.inputWrapper}>
        <span style={defaultStyles.iconLeft}>
          {searchIcon || <SearchIcon />}
        </span>
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onFocus={() => {
            setIsFocused(true)
            if (predictions.length > 0) setShowDropdown(true)
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isLoading}
          className={inputClassName}
          style={inputClassName ? undefined : inputStyles}
        />
        {(isLoading || isSearching) && (
          <span style={defaultStyles.iconRight}>
            {loadingIndicator || <LoadingSpinner />}
          </span>
        )}
      </div>

      {showDropdown && predictions.length > 0 && (
        <div className={dropdownClassName} style={dropdownClassName ? undefined : defaultStyles.dropdown}>
          {predictions.map((prediction, index) => (
            <div
              key={prediction.placePrediction.placeId || index}
              className={itemClassName}
              style={
                itemClassName
                  ? undefined
                  : {
                      ...defaultStyles.dropdownItem,
                      ...(hoveredIndex === index ? defaultStyles.dropdownItemHover : {}),
                    }
              }
              onClick={() => handleSelectPlace(prediction)}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(-1)}
            >
              <span style={defaultStyles.itemIcon}>
                {locationIcon || <LocationIcon />}
              </span>
              <div style={defaultStyles.itemContent}>
                {prediction.placePrediction.structuredFormat ? (
                  <>
                    <div style={defaultStyles.itemMain}>
                      {prediction.placePrediction.structuredFormat.mainText.text}
                    </div>
                    <div style={defaultStyles.itemSecondary}>
                      {prediction.placePrediction.structuredFormat.secondaryText.text}
                    </div>
                  </>
                ) : (
                  <div style={defaultStyles.itemMain}>
                    {prediction.placePrediction.text.text}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {!apiKey && !isLoading && (
        <p style={defaultStyles.errorText}>
          Google Maps API key is required. Please provide the apiKey prop.
        </p>
      )}
    </div>
  )
}

// ============================================================================
// EXPORTS
// ============================================================================

export default AddressFinder

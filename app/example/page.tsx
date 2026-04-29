"use client"

import { useState } from "react"
import { AddressFinder, AddressData } from "@/components/address-finder"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

/**
 * Example page demonstrating the AddressFinder component usage
 * 
 * This shows how to implement the component in any React.js project
 */
export default function ExamplePage() {
  const [selectedAddress, setSelectedAddress] = useState<AddressData | null>(null)

  const handleAddressSelect = (address: AddressData) => {
    setSelectedAddress(address)
    console.log("Selected Address:", address)
  }

  // Get API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">AddressFinder Component</h1>
          <p className="text-muted-foreground mt-2">
            A reusable, platform-independent Google Places autocomplete component
          </p>
        </div>

        {/* Basic Usage */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Usage</CardTitle>
            <CardDescription>
              Simple implementation with just apiKey and onAddressSelect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <AddressFinder
              apiKey={apiKey}
              onAddressSelect={handleAddressSelect}
            />

            {selectedAddress && (
              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold mb-2">Selected Address Data:</h4>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(selectedAddress, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>

        {/* With Custom Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>Custom Placeholder</CardTitle>
            <CardDescription>
              With custom placeholder text
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressFinder
              apiKey={apiKey}
              onAddressSelect={handleAddressSelect}
              placeholder="Enter your delivery address..."
            />
          </CardContent>
        </Card>

        {/* With Default Value */}
        <Card>
          <CardHeader>
            <CardTitle>With Default Value</CardTitle>
            <CardDescription>
              Pre-filled with a default address value
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressFinder
              apiKey={apiKey}
              onAddressSelect={handleAddressSelect}
              defaultValue="1600 Amphitheatre Parkway"
            />
          </CardContent>
        </Card>

        {/* Code Example */}
        <Card>
          <CardHeader>
            <CardTitle>Implementation Code</CardTitle>
            <CardDescription>
              Copy this code to use in your React project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{`import { AddressFinder, AddressData } from './components/address-finder'

function MyComponent() {
  const handleAddressSelect = (address: AddressData) => {
    console.log('Street:', address.streetAddress)
    console.log('City:', address.city)
    console.log('State:', address.state)
    console.log('Postal Code:', address.postalCode)
    console.log('Country:', address.country)
    console.log('Lat/Lng:', address.latitude, address.longitude)
  }

  return (
    <AddressFinder
      apiKey="YOUR_GOOGLE_MAPS_API_KEY"
      onAddressSelect={handleAddressSelect}
      placeholder="Search for an address..."
      debounceMs={300}
      minChars={3}
    />
  )
}`}
            </pre>
          </CardContent>
        </Card>

        {/* Props Reference */}
        <Card>
          <CardHeader>
            <CardTitle>Props Reference</CardTitle>
            <CardDescription>
              All available props for the AddressFinder component
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4">Prop</th>
                    <th className="text-left py-2 pr-4">Type</th>
                    <th className="text-left py-2 pr-4">Default</th>
                    <th className="text-left py-2">Description</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">apiKey*</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Google Maps API Key (required)</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">onAddressSelect*</td>
                    <td className="py-2 pr-4">{`(address: AddressData) => void`}</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Callback when address is selected</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">placeholder</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">{`"Search for an address..."`}</td>
                    <td className="py-2">Input placeholder text</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">defaultValue</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">{`""`}</td>
                    <td className="py-2">Default input value</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">debounceMs</td>
                    <td className="py-2 pr-4">number</td>
                    <td className="py-2 pr-4">300</td>
                    <td className="py-2">Debounce delay in ms</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">minChars</td>
                    <td className="py-2 pr-4">number</td>
                    <td className="py-2 pr-4">3</td>
                    <td className="py-2">Min chars before search</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">disabled</td>
                    <td className="py-2 pr-4">boolean</td>
                    <td className="py-2 pr-4">false</td>
                    <td className="py-2">Disable the input</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">className</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Container class name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">inputClassName</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Input class name</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 pr-4 font-mono text-xs">dropdownClassName</td>
                    <td className="py-2 pr-4">string</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Dropdown class name</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4 font-mono text-xs">searchIcon</td>
                    <td className="py-2 pr-4">ReactNode</td>
                    <td className="py-2 pr-4">-</td>
                    <td className="py-2">Custom search icon</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* AddressData Type */}
        <Card>
          <CardHeader>
            <CardTitle>AddressData Type</CardTitle>
            <CardDescription>
              The shape of the address object returned by onAddressSelect
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="p-4 bg-muted rounded-lg text-xs overflow-auto">
{`interface AddressData {
  streetAddress: string    // Full street address
  city: string             // City or town
  state: string            // State, province, or region
  country: string          // Country name
  postalCode: string       // Postal or ZIP code
  formattedAddress: string // Complete Google formatted address
  placeId: string          // Google Place ID
  latitude: number         // Latitude coordinate
  longitude: number        // Longitude coordinate
}`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

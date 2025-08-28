"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Star, MapPin, Clock, Filter, Search } from "lucide-react"
import Link from "next/link"

const mockServices = [
  {
    id: 1,
    title: "Professional Web Development",
    provider: "TechPro Solutions",
    description: "Custom website development with modern design and responsive layout",
    category: "Tech Services",
    rating: 4.8,
    reviews: 127,
    location: "Kathmandu",
    price: "Rs. 25,000",
    duration: "2-3 weeks",
    image: "/logo.png"
  },
  {
    id: 2,
    title: "Home Cleaning Service",
    provider: "CleanHome Pro",
    description: "Professional home cleaning service with eco-friendly products",
    category: "Home Services",
    rating: 4.9,
    reviews: 89,
    location: "Lalitpur",
    price: "Rs. 2,500",
    duration: "3-4 hours",
    image: "/logo.png"
  },
  {
    id: 3,
    title: "Professional Photography",
    provider: "Capture Moments",
    description: "Event photography, portraits, and commercial photography services",
    category: "Creative Services",
    rating: 4.7,
    reviews: 156,
    location: "Bhaktapur",
    price: "Rs. 15,000",
    duration: "1 day",
    image: "/logo.png"
  },
  {
    id: 4,
    title: "Car Maintenance & Repair",
    provider: "AutoCare Plus",
    description: "Complete automotive service including oil change, brake repair, and diagnostics",
    category: "Automotive",
    rating: 4.6,
    reviews: 203,
    location: "Kathmandu",
    price: "Rs. 5,000",
    duration: "2-4 hours",
    image: "/logo.png"
  },
  {
    id: 5,
    title: "Hair Styling & Makeup",
    provider: "Beauty Studio",
    description: "Professional hair styling, makeup, and beauty services for all occasions",
    category: "Beauty & Wellness",
    rating: 4.9,
    reviews: 98,
    location: "Lalitpur",
    price: "Rs. 3,500",
    duration: "2-3 hours",
    image: "/logo.png"
  },
  {
    id: 6,
    title: "Legal Consultation",
    provider: "Legal Experts Nepal",
    description: "Professional legal advice and consultation for various legal matters",
    category: "Professional Services",
    rating: 4.8,
    reviews: 67,
    location: "Kathmandu",
    price: "Rs. 8,000",
    duration: "1-2 hours",
    image: "/logo.png"
  }
]

const categories = [
  "All",
  "Tech Services",
  "Home Services", 
  "Creative Services",
  "Automotive",
  "Beauty & Wellness",
  "Professional Services"
]

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("rating")

  const filteredServices = mockServices.filter(service => {
    const matchesSearch = service.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.provider.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "All" || service.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedServices = [...filteredServices].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating
      case "price-low":
        return parseInt(a.price.replace(/\D/g, "")) - parseInt(b.price.replace(/\D/g, ""))
      case "price-high":
        return parseInt(b.price.replace(/\D/g, "")) - parseInt(a.price.replace(/\D/g, ""))
      case "reviews":
        return b.reviews - a.reviews
      default:
        return 0
    }
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Services</h1>
          <p className="text-lg text-gray-600">
            Find the perfect service for your needs from our verified professionals
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search services, providers, or categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white  border-gray-300"
              />
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            >
              <option value="rating" >Sort by Rating</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="reviews">Most Reviews</option>
            </select>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedServices.map((service) => (
            <Card key={service.id} className="hover:shadow-lg transition-all duration-300">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-blue-600 font-medium">{service.category}</span>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{service.rating}</span>
                    <span className="text-sm text-gray-500">({service.reviews})</span>
                  </div>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <CardDescription className="text-sm text-gray-600">
                  by {service.provider}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{service.description}</p>
                
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {service.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {service.duration}
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button asChild className="flex-1">
                    <Link href={`/services/${service.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {sortedServices.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No services found matching your criteria.</p>
            <p className="text-gray-400">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>
    </div>
  )
}

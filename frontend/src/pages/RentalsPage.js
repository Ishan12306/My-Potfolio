import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import PropertyCard from "@/components/PropertyCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Search, 
  SlidersHorizontal, 
  MapPin, 
  Grid3X3, 
  LayoutList,
  Key
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RentalsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("grid");
  const [filterOpen, setFilterOpen] = useState(false);

  // Filter states
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [propertyType, setPropertyType] = useState(searchParams.get("property_type") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [bedrooms, setBedrooms] = useState(searchParams.get("bedrooms") || "");
  const [furnishing, setFurnishing] = useState(searchParams.get("furnishing") || "");
  const [sortBy, setSortBy] = useState("newest");
  const [listingType, setListingType] = useState("rent"); // rent or pg

  useEffect(() => {
    fetchProperties();
  }, [searchParams, listingType]);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("listing_type", listingType);
      
      if (location) params.set("location", location);
      if (propertyType && propertyType !== "all") params.set("property_type", propertyType);
      if (minPrice) params.set("min_price", minPrice);
      if (maxPrice) params.set("max_price", maxPrice);
      if (bedrooms) params.set("bedrooms", bedrooms.replace("+", ""));
      if (furnishing && furnishing !== "all") params.set("furnishing", furnishing);
      params.set("sort_by", sortBy);

      const response = await axios.get(`${API}/properties?${params.toString()}`);
      setProperties(response.data);
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType && propertyType !== "all") params.set("property_type", propertyType);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);
    if (furnishing && furnishing !== "all") params.set("furnishing", furnishing);
    
    setSearchParams(params);
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setLocation("");
    setPropertyType("");
    setMinPrice("");
    setMaxPrice("");
    setBedrooms("");
    setFurnishing("");
    setSearchParams({});
  };

  const propertyTypes = [
    { value: "flat", label: "Flat/Apartment" },
    { value: "house", label: "House/Villa" },
    { value: "pg", label: "PG/Hostel" },
    { value: "shop", label: "Shop" },
    { value: "office", label: "Office" },
  ];

  const furnishingOptions = [
    { value: "unfurnished", label: "Unfurnished" },
    { value: "semi-furnished", label: "Semi-Furnished" },
    { value: "fully-furnished", label: "Fully-Furnished" },
  ];

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Location</Label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search sector, area..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="pl-10"
            data-testid="filter-location"
          />
        </div>
      </div>

      {/* Property Type */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Property Type</Label>
        <Select value={propertyType || undefined} onValueChange={setPropertyType}>
          <SelectTrigger data-testid="filter-property-type">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {propertyTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Budget */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Rent Budget (₹/month)</Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            placeholder="Min Rent"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            data-testid="filter-min-price"
          />
          <Input
            type="number"
            placeholder="Max Rent"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            data-testid="filter-max-price"
          />
        </div>
      </div>

      {/* BHK */}
      <div>
        <Label className="text-sm font-medium mb-2 block">BHK</Label>
        <div className="flex flex-wrap gap-2">
          {["1", "2", "3", "4+"].map((bhk) => (
            <Button
              key={bhk}
              variant={bedrooms === bhk ? "default" : "outline"}
              size="sm"
              onClick={() => setBedrooms(bedrooms === bhk ? "" : bhk)}
              className="rounded-full"
              data-testid={`filter-bhk-${bhk}`}
            >
              {bhk} BHK
            </Button>
          ))}
        </div>
      </div>

      {/* Furnishing */}
      <div>
        <Label className="text-sm font-medium mb-2 block">Furnishing</Label>
        <Select value={furnishing || undefined} onValueChange={setFurnishing}>
          <SelectTrigger data-testid="filter-furnishing">
            <SelectValue placeholder="Any" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            {furnishingOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 pt-4">
        <Button onClick={applyFilters} className="flex-1 rounded-full" data-testid="apply-filters">
          Apply Filters
        </Button>
        <Button onClick={clearFilters} variant="outline" className="rounded-full" data-testid="clear-filters">
          Clear
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      {/* Header */}
      <div className="bg-muted border-b">
        <div className="container-main py-6">
          <div className="flex items-center gap-3 mb-2">
            <Key className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Rentals</h1>
          </div>
          <p className="text-muted-foreground">
            Find rental properties & PG accommodations in Airoli & Navi Mumbai
          </p>

          {/* Listing Type Toggle */}
          <div className="flex gap-2 mt-4">
            <Button
              variant={listingType === "rent" ? "default" : "outline"}
              onClick={() => setListingType("rent")}
              className="rounded-full"
              data-testid="toggle-rent"
            >
              Rentals
            </Button>
            <Button
              variant={listingType === "pg" ? "default" : "outline"}
              onClick={() => setListingType("pg")}
              className="rounded-full"
              data-testid="toggle-pg"
            >
              PG / Hostels
            </Button>
          </div>
        </div>
      </div>

      <div className="container-main py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Filters */}
          <aside className="hidden lg:block w-72 flex-shrink-0">
            <div className="sticky top-24 bg-card rounded-xl border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5" />
                Filters
              </h3>
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="text-sm text-muted-foreground">
                {loading ? "Loading..." : `${properties.length} properties found`}
              </div>

              <div className="flex items-center gap-3">
                {/* Mobile Filter Button */}
                <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" className="lg:hidden rounded-full" data-testid="mobile-filter-btn">
                      <SlidersHorizontal className="w-4 h-4 mr-2" />
                      Filters
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>Filters</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterContent />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(val) => { setSortBy(val); fetchProperties(); }}>
                  <SelectTrigger className="w-[150px] rounded-full" data-testid="sort-select">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="price_low">Rent: Low to High</SelectItem>
                    <SelectItem value="price_high">Rent: High to Low</SelectItem>
                    <SelectItem value="relevance">Relevance</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="hidden md:flex border rounded-full p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="icon"
                    className="rounded-full h-8 w-8"
                    onClick={() => setViewMode("list")}
                  >
                    <LayoutList className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Property Grid */}
            {loading ? (
              <div className={viewMode === "grid" ? "property-grid" : "space-y-4"}>
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className={`${viewMode === "grid" ? "aspect-[4/3]" : "h-48"} rounded-2xl shimmer`} />
                ))}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-12">
                <Key className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No rentals found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button onClick={clearFilters} variant="outline" className="rounded-full">
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className={viewMode === "grid" ? "property-grid" : "space-y-4"}>
                {properties.map((property) => (
                  <PropertyCard key={property.id} property={property} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, MapPin } from "lucide-react";

export default function SearchBar({ 
  variant = "hero", 
  initialValues = {},
  onSearch 
}) {
  const navigate = useNavigate();
  const [location, setLocation] = useState(initialValues.location || "");
  const [propertyType, setPropertyType] = useState(initialValues.propertyType || "");
  const [listingType, setListingType] = useState(initialValues.listingType || "buy");
  const [minPrice, setMinPrice] = useState(initialValues.minPrice || "");
  const [maxPrice, setMaxPrice] = useState(initialValues.maxPrice || "");
  const [bedrooms, setBedrooms] = useState(initialValues.bedrooms || "");

  const propertyTypes = [
    { value: "flat", label: "Flat/Apartment" },
    { value: "house", label: "House/Villa" },
    { value: "plot", label: "Plot/Land" },
    { value: "shop", label: "Shop" },
    { value: "office", label: "Office" },
    { value: "pg", label: "PG" },
  ];

  const budgetRanges = listingType === "rent" 
    ? [
        { value: "0-10000", label: "Under ₹10K" },
        { value: "10000-20000", label: "₹10K - ₹20K" },
        { value: "20000-35000", label: "₹20K - ₹35K" },
        { value: "35000-50000", label: "₹35K - ₹50K" },
        { value: "50000-100000", label: "₹50K - ₹1L" },
        { value: "100000-999999999", label: "Above ₹1L" },
      ]
    : [
        { value: "0-5000000", label: "Under ₹50L" },
        { value: "5000000-10000000", label: "₹50L - ₹1Cr" },
        { value: "10000000-20000000", label: "₹1Cr - ₹2Cr" },
        { value: "20000000-50000000", label: "₹2Cr - ₹5Cr" },
        { value: "50000000-999999999", label: "Above ₹5Cr" },
      ];

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (location) params.set("location", location);
    if (propertyType) params.set("property_type", propertyType);
    if (minPrice) params.set("min_price", minPrice);
    if (maxPrice) params.set("max_price", maxPrice);
    if (bedrooms) params.set("bedrooms", bedrooms);

    const targetPage = listingType === "rent" ? "/rentals" : "/buy";
    navigate(`${targetPage}?${params.toString()}`);
    
    onSearch?.({
      location,
      propertyType,
      listingType,
      minPrice,
      maxPrice,
      bedrooms,
    });
  };

  const handleBudgetChange = (value) => {
    const [min, max] = value.split("-");
    setMinPrice(min);
    setMaxPrice(max);
  };

  if (variant === "hero") {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-4 md:p-6 w-full max-w-4xl mx-auto">
        {/* Listing Type Tabs */}
        <div className="flex gap-2 mb-4">
          <Button
            variant={listingType === "buy" ? "default" : "outline"}
            onClick={() => setListingType("buy")}
            className="rounded-full"
            data-testid="search-buy-tab"
          >
            Buy
          </Button>
          <Button
            variant={listingType === "rent" ? "default" : "outline"}
            onClick={() => setListingType("rent")}
            className="rounded-full"
            data-testid="search-rent-tab"
          >
            Rent
          </Button>
          <Button
            variant={listingType === "pg" ? "default" : "outline"}
            onClick={() => setListingType("pg")}
            className="rounded-full"
            data-testid="search-pg-tab"
          >
            PG
          </Button>
        </div>

        {/* Search Fields */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Location */}
          <div className="md:col-span-1">
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Location / Sector"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 h-12 rounded-xl"
                data-testid="search-location"
              />
            </div>
          </div>

          {/* Property Type */}
          <div>
            <Select value={propertyType} onValueChange={setPropertyType}>
              <SelectTrigger className="h-12 rounded-xl" data-testid="search-property-type">
                <SelectValue placeholder="Property Type" />
              </SelectTrigger>
              <SelectContent>
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
            <Select onValueChange={handleBudgetChange}>
              <SelectTrigger className="h-12 rounded-xl" data-testid="search-budget">
                <SelectValue placeholder="Budget" />
              </SelectTrigger>
              <SelectContent>
                {budgetRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Button */}
          <div>
            <Button 
              onClick={handleSearch} 
              className="w-full h-12 rounded-xl btn-cta"
              data-testid="search-submit"
            >
              <Search className="w-5 h-5 mr-2" />
              Search
            </Button>
          </div>
        </div>

        {/* BHK Filter */}
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="text-sm text-muted-foreground mr-2 self-center">BHK:</span>
          {["1", "2", "3", "4+"].map((bhk) => (
            <Button
              key={bhk}
              variant={bedrooms === bhk ? "default" : "outline"}
              size="sm"
              onClick={() => setBedrooms(bedrooms === bhk ? "" : bhk)}
              className="rounded-full"
              data-testid={`search-bhk-${bhk}`}
            >
              {bhk} BHK
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // Compact variant for listing pages
  return (
    <div className="flex flex-wrap gap-3">
      <div className="relative flex-1 min-w-[200px]">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search location..."
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="pl-10 h-10 rounded-lg"
        />
      </div>
      <Select value={propertyType} onValueChange={setPropertyType}>
        <SelectTrigger className="w-[150px] h-10 rounded-lg">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          {propertyTypes.map((type) => (
            <SelectItem key={type.value} value={type.value}>
              {type.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleSearch} className="rounded-lg h-10">
        <Search className="w-4 h-4" />
      </Button>
    </div>
  );
}

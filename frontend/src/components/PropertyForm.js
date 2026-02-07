import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
import {
  Upload,
  X,
  Image as ImageIcon,
  Plus,
  Loader2,
  Link as LinkIcon,
  GripVertical
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const defaultFormData = {
  title: "",
  property_type: "",
  listing_type: "buy",
  price: "",
  deposit: "",
  area_sqft: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "unfurnished",
  parking: "",
  floor: "",
  total_floors: "",
  facing: "",
  property_age: "",
  availability: "",
  description: "",
  amenities: [],
  images: [],
  location: "",
  sector: "",
  city: "Navi Mumbai",
  is_featured: false,
  is_published: true,
};

const propertyTypes = [
  { value: "flat", label: "Flat/Apartment" },
  { value: "house", label: "House/Villa" },
  { value: "plot", label: "Plot/Land" },
  { value: "shop", label: "Shop" },
  { value: "office", label: "Office Space" },
  { value: "pg", label: "PG/Hostel" },
  { value: "warehouse", label: "Warehouse" },
];

const listingTypes = [
  { value: "buy", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "pg", label: "PG" },
];

const furnishingOptions = [
  { value: "unfurnished", label: "Unfurnished" },
  { value: "semi-furnished", label: "Semi-Furnished" },
  { value: "fully-furnished", label: "Fully-Furnished" },
];

const facingOptions = ["North", "South", "East", "West", "North-East", "North-West", "South-East", "South-West"];

const propertyAgeOptions = ["New", "Under Construction", "Less than 1 year", "1-2 years", "2-5 years", "5-10 years", "10+ years"];

const availabilityOptions = ["Immediate", "Within 15 days", "Within 30 days", "Within 3 months", "After 3 months"];

const amenitiesList = [
  "Lift", "Power Backup", "Security", "Gym", "Swimming Pool", "Club House",
  "Children Play Area", "Parking", "Garden", "Terrace", "Modular Kitchen",
  "AC", "WiFi", "Water Supply 24x7", "CCTV", "Intercom", "Fire Safety",
  "Jogging Track", "Tennis Court", "Basketball Court", "Indoor Games"
];

const sectors = [
  "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
  "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10",
  "Sector 11", "Sector 12", "Sector 13", "Sector 14", "Sector 15",
  "Sector 16", "Sector 17", "Sector 18", "Sector 19", "Sector 20",
  "Ghansoli", "Vashi", "Kopar Khairane", "Turbhe", "Sanpada",
  "Nerul", "Seawoods", "Kharghar", "Panvel", "Thane"
];

export default function PropertyForm({ open, onOpenChange, property, token, onSuccess }) {
  const [formData, setFormData] = useState(property ? { ...defaultFormData, ...property } : defaultFormData);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!property?.id;

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) {
      toast.error("Please enter an image URL");
      return;
    }
    if (!imageUrl.startsWith("http")) {
      toast.error("Please enter a valid URL starting with http:// or https://");
      return;
    }
    updateField("images", [...formData.images, imageUrl.trim()]);
    setImageUrl("");
    toast.success("Image added");
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImage(true);
    
    // For demo, we'll convert to base64 data URLs
    // In production, you'd upload to Cloudinary/S3
    try {
      const newImages = await Promise.all(
        files.map(file => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
        })
      );
      
      updateField("images", [...formData.images, ...newImages]);
      toast.success(`${files.length} image(s) added`);
    } catch (error) {
      toast.error("Failed to process images");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index) => {
    const newImages = [...formData.images];
    newImages.splice(index, 1);
    updateField("images", newImages);
  };

  const toggleAmenity = (amenity) => {
    const current = formData.amenities || [];
    if (current.includes(amenity)) {
      updateField("amenities", current.filter(a => a !== amenity));
    } else {
      updateField("amenities", [...current, amenity]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title?.trim()) {
      toast.error("Please enter a property title");
      return;
    }
    if (!formData.property_type) {
      toast.error("Please select a property type");
      return;
    }
    if (!formData.price || formData.price <= 0) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!formData.sector) {
      toast.error("Please select a sector/area");
      return;
    }
    if (!formData.description?.trim()) {
      toast.error("Please enter a description");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price) || 0,
        deposit: formData.deposit ? parseInt(formData.deposit) : null,
        area_sqft: formData.area_sqft ? parseInt(formData.area_sqft) : null,
        bedrooms: formData.bedrooms ? parseInt(formData.bedrooms) : null,
        bathrooms: formData.bathrooms ? parseInt(formData.bathrooms) : null,
        total_floors: formData.total_floors ? parseInt(formData.total_floors) : null,
      };

      const headers = { Authorization: `Bearer ${token}` };
      
      if (isEditing) {
        await axios.put(`${API}/admin/properties/${property.id}`, payload, { headers });
        toast.success("Property updated successfully");
      } else {
        await axios.post(`${API}/admin/properties`, payload, { headers });
        toast.success("Property created successfully");
      }
      
      onSuccess?.();
      onOpenChange(false);
      setFormData(defaultFormData);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.response?.data?.detail || "Failed to save property");
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(property ? { ...defaultFormData, ...property } : defaultFormData);
    setImageUrl("");
  };

  return (
    <Dialog open={open} onOpenChange={(val) => { onOpenChange(val); if (!val) resetForm(); }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? "Edit Property" : "Add New Property"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
            
            <div>
              <Label htmlFor="title">Property Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => updateField("title", e.target.value)}
                placeholder="e.g., Spacious 2 BHK Flat in Airoli Sector 8"
                className="mt-1"
                data-testid="property-title"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label>Property Type *</Label>
                <Select
                  value={formData.property_type}
                  onValueChange={(val) => updateField("property_type", val)}
                >
                  <SelectTrigger className="mt-1" data-testid="property-type-select">
                    <SelectValue placeholder="Select type" />
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

              <div>
                <Label>Listing Type *</Label>
                <Select
                  value={formData.listing_type}
                  onValueChange={(val) => updateField("listing_type", val)}
                >
                  <SelectTrigger className="mt-1" data-testid="listing-type-select">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {listingTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>City/Area</Label>
                <Select
                  value={formData.city}
                  onValueChange={(val) => updateField("city", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select city/area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Airoli">Airoli</SelectItem>
                    <SelectItem value="Kopar Khairane">Kopar Khairane</SelectItem>
                    <SelectItem value="Vashi">Vashi</SelectItem>
                    <SelectItem value="Ghansoli">Ghansoli</SelectItem>
                    <SelectItem value="Rabale">Rabale</SelectItem>
                    <SelectItem value="Digha">Digha</SelectItem>
                    <SelectItem value="Vitawa">Vitawa</SelectItem>
                    <SelectItem value="Mulund">Mulund</SelectItem>
                    <SelectItem value="Nerul">Nerul</SelectItem>
                    <SelectItem value="CBD Belapur">CBD Belapur</SelectItem>
                    <SelectItem value="Sea Woods">Sea Woods</SelectItem>
                    <SelectItem value="Navi Mumbai">Navi Mumbai</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Thane">Thane</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Sector/Area *</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(val) => updateField("sector", val)}
                >
                  <SelectTrigger className="mt-1" data-testid="sector-select">
                    <SelectValue placeholder="Select sector" />
                  </SelectTrigger>
                  <SelectContent>
                    {sectors.map((sector) => (
                      <SelectItem key={sector} value={sector}>
                        {sector}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location Details</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g., Near Yash Paradise, Main Road"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Pricing</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">
                  {formData.listing_type === "buy" ? "Price (₹) *" : "Rent/Month (₹) *"}
                </Label>
                <Input
                  id="price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => updateField("price", e.target.value)}
                  placeholder={formData.listing_type === "buy" ? "e.g., 8500000" : "e.g., 25000"}
                  className="mt-1"
                  data-testid="property-price"
                />
              </div>

              {formData.listing_type !== "buy" && (
                <div>
                  <Label htmlFor="deposit">Security Deposit (₹)</Label>
                  <Input
                    id="deposit"
                    type="number"
                    value={formData.deposit || ""}
                    onChange={(e) => updateField("deposit", e.target.value)}
                    placeholder="e.g., 100000"
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Property Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Property Details</h3>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="area_sqft">Area (sqft)</Label>
                <Input
                  id="area_sqft"
                  type="number"
                  value={formData.area_sqft || ""}
                  onChange={(e) => updateField("area_sqft", e.target.value)}
                  placeholder="e.g., 950"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="bedrooms">Bedrooms (BHK)</Label>
                <Select
                  value={formData.bedrooms?.toString() || ""}
                  onValueChange={(val) => updateField("bedrooms", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "5", "6+"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Select
                  value={formData.bathrooms?.toString() || ""}
                  onValueChange={(val) => updateField("bathrooms", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {["1", "2", "3", "4", "5+"].map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Furnishing</Label>
                <Select
                  value={formData.furnishing}
                  onValueChange={(val) => updateField("furnishing", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {furnishingOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="floor">Floor</Label>
                <Input
                  id="floor"
                  value={formData.floor || ""}
                  onChange={(e) => updateField("floor", e.target.value)}
                  placeholder="e.g., 5th"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="total_floors">Total Floors</Label>
                <Input
                  id="total_floors"
                  type="number"
                  value={formData.total_floors || ""}
                  onChange={(e) => updateField("total_floors", e.target.value)}
                  placeholder="e.g., 12"
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Facing</Label>
                <Select
                  value={formData.facing || ""}
                  onValueChange={(val) => updateField("facing", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {facingOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="parking">Parking</Label>
                <Input
                  id="parking"
                  value={formData.parking || ""}
                  onChange={(e) => updateField("parking", e.target.value)}
                  placeholder="e.g., 1 Covered"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Property Age</Label>
                <Select
                  value={formData.property_age || ""}
                  onValueChange={(val) => updateField("property_age", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyAgeOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Availability</Label>
                <Select
                  value={formData.availability || ""}
                  onValueChange={(val) => updateField("availability", val)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {availabilityOptions.map((opt) => (
                      <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Description</h3>
            <Textarea
              value={formData.description}
              onChange={(e) => updateField("description", e.target.value)}
              placeholder="Enter a detailed description of the property..."
              rows={4}
              data-testid="property-description"
            />
          </div>

          {/* Images */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">
              Property Images ({formData.images?.length || 0})
            </h3>
            
            {/* Add Image Options */}
            <div className="flex flex-wrap gap-4">
              {/* File Upload */}
              <div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleFileUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  data-testid="upload-images-btn"
                >
                  {uploadingImage ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4 mr-2" />
                  )}
                  Upload Photos
                </Button>
              </div>

              {/* URL Input */}
              <div className="flex gap-2 flex-1 min-w-[300px]">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="Or paste image URL (https://...)"
                    className="pl-10"
                    data-testid="image-url-input"
                  />
                </div>
                <Button type="button" onClick={handleAddImageUrl} variant="outline">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Image Preview Grid */}
            {formData.images?.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
                    <img
                      src={img}
                      alt={`Property ${idx + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = "https://via.placeholder.com/150?text=Error";
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    {idx === 0 && (
                      <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-primary text-primary-foreground text-xs rounded">
                        Cover
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {formData.images?.length === 0 && (
              <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No images added yet</p>
                <p className="text-sm">Upload photos or paste image URLs</p>
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {amenitiesList.map((amenity) => (
                <Button
                  key={amenity}
                  type="button"
                  variant={formData.amenities?.includes(amenity) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleAmenity(amenity)}
                  className="rounded-full"
                >
                  {amenity}
                </Button>
              ))}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg border-b pb-2">Publishing Options</h3>
            <div className="flex flex-wrap gap-6">
              <div className="flex items-center gap-3">
                <Switch
                  id="is_published"
                  checked={formData.is_published}
                  onCheckedChange={(val) => updateField("is_published", val)}
                />
                <Label htmlFor="is_published">Publish immediately</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(val) => updateField("is_featured", val)}
                />
                <Label htmlFor="is_featured">Mark as Featured</Label>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={saving} data-testid="save-property-btn">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                isEditing ? "Update Property" : "Create Property"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

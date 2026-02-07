import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import PropertyForm from "@/components/PropertyForm";
import {
  LayoutDashboard,
  Building2,
  FileText,
  MessageSquare,
  Users,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Star,
  RefreshCw,
  Loader2
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function AdminDashboard() {
  const { isAdmin, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState(null);
  const [properties, setProperties] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [listingRequests, setListingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Property form state
  const [editingProperty, setEditingProperty] = useState(null);
  const [propertyDialogOpen, setPropertyDialogOpen] = useState(false);
  const [savingProperty, setSavingProperty] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required");
      navigate("/login");
    }
  }, [isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchData();
    }
  }, [isAdmin, activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      
      const [statsRes, propertiesRes, enquiriesRes, requestsRes] = await Promise.all([
        axios.get(`${API}/admin/stats`, { headers }),
        axios.get(`${API}/admin/properties`, { headers }),
        axios.get(`${API}/admin/enquiries`, { headers }),
        axios.get(`${API}/admin/listing-requests`, { headers }),
      ]);
      
      setStats(statsRes.data);
      setProperties(propertiesRes.data);
      setEnquiries(enquiriesRes.data);
      setListingRequests(requestsRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublish = async (propertyId, currentStatus) => {
    try {
      await axios.patch(
        `${API}/admin/properties/${propertyId}/publish?is_published=${!currentStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(currentStatus ? "Property unpublished" : "Property published");
      fetchData();
    } catch (error) {
      toast.error("Failed to update property");
    }
  };

  const handleToggleFeatured = async (propertyId, currentStatus) => {
    try {
      await axios.patch(
        `${API}/admin/properties/${propertyId}/feature?is_featured=${!currentStatus}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(currentStatus ? "Property unfeatured" : "Property featured");
      fetchData();
    } catch (error) {
      toast.error("Failed to update property");
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm("Are you sure you want to delete this property?")) return;
    
    try {
      await axios.delete(`${API}/admin/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Property deleted");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete property");
    }
  };

  const handleUpdateEnquiryStatus = async (enquiryId, status) => {
    try {
      await axios.patch(
        `${API}/admin/enquiries/${enquiryId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Enquiry status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update enquiry");
    }
  };

  const handleUpdateRequestStatus = async (requestId, status) => {
    try {
      await axios.patch(
        `${API}/admin/listing-requests/${requestId}/status?status=${status}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Request status updated");
      fetchData();
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const formatPrice = (price) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(2)} L`;
    return `₹${price?.toLocaleString("en-IN") || 0}`;
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <div className="bg-card border-b">
        <div className="container-main py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LayoutDashboard className="w-8 h-8 text-primary" />
              <div>
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">TM Real Estate Management</p>
              </div>
            </div>
            <Button onClick={fetchData} variant="outline" className="rounded-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container-main py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
            <TabsTrigger value="properties" data-testid="tab-properties">Properties</TabsTrigger>
            <TabsTrigger value="enquiries" data-testid="tab-enquiries">Enquiries</TabsTrigger>
            <TabsTrigger value="requests" data-testid="tab-requests">Listing Requests</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className="h-32 shimmer rounded-xl" />
                ))}
              </div>
            ) : stats && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                          <Building2 className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.properties.total}</div>
                          <div className="text-sm text-muted-foreground">Total Properties</div>
                        </div>
                      </div>
                      <div className="mt-4 flex gap-4 text-sm">
                        <span className="text-green-600">{stats.properties.published} published</span>
                        <span className="text-yellow-600">{stats.properties.featured} featured</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center">
                          <MessageSquare className="w-6 h-6 text-blue-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.enquiries.total}</div>
                          <div className="text-sm text-muted-foreground">Total Enquiries</div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <span className="text-orange-600">{stats.enquiries.new} new</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center">
                          <FileText className="w-6 h-6 text-orange-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.listing_requests.total}</div>
                          <div className="text-sm text-muted-foreground">Listing Requests</div>
                        </div>
                      </div>
                      <div className="mt-4 text-sm">
                        <span className="text-orange-600">{stats.listing_requests.pending} pending</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-green-500" />
                        </div>
                        <div>
                          <div className="text-2xl font-bold">{stats.users.total}</div>
                          <div className="text-sm text-muted-foreground">Registered Users</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-wrap gap-3">
                    <Button onClick={() => { setEditingProperty(null); setPropertyDialogOpen(true); }} className="rounded-full" data-testid="add-property-btn">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Property
                    </Button>
                    <Button onClick={() => setActiveTab("enquiries")} variant="outline" className="rounded-full">
                      View New Enquiries ({stats.enquiries.new})
                    </Button>
                    <Button onClick={() => setActiveTab("requests")} variant="outline" className="rounded-full">
                      Pending Requests ({stats.listing_requests.pending})
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Properties ({properties.length})</CardTitle>
                <Button onClick={() => { setEditingProperty(null); setPropertyDialogOpen(true); }} className="rounded-full" data-testid="add-property-btn-2">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Property
                </Button>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded" />)}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Property</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {properties.map((property) => (
                          <TableRow key={property.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <img
                                  src={property.images?.[0] || "https://via.placeholder.com/50"}
                                  alt=""
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                                <div>
                                  <div className="font-medium line-clamp-1">{property.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {property.bedrooms && `${property.bedrooms} BHK`} · {property.area_sqft} sqft
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">
                                {property.listing_type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium">
                              {formatPrice(property.price)}
                            </TableCell>
                            <TableCell>{property.sector}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {property.is_published ? (
                                  <Badge className="bg-green-500">Published</Badge>
                                ) : (
                                  <Badge variant="secondary">Draft</Badge>
                                )}
                                {property.is_featured && (
                                  <Badge className="bg-yellow-500">Featured</Badge>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => { setEditingProperty(property); setPropertyDialogOpen(true); }}
                                  title="Edit"
                                  data-testid={`edit-property-${property.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleTogglePublish(property.id, property.is_published)}
                                  title={property.is_published ? "Unpublish" : "Publish"}
                                >
                                  {property.is_published ? (
                                    <EyeOff className="w-4 h-4" />
                                  ) : (
                                    <Eye className="w-4 h-4" />
                                  )}
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleToggleFeatured(property.id, property.is_featured)}
                                  title={property.is_featured ? "Unfeature" : "Feature"}
                                >
                                  <Star className={`w-4 h-4 ${property.is_featured ? "fill-yellow-500 text-yellow-500" : ""}`} />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteProperty(property.id)}
                                  className="text-destructive"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enquiries Tab */}
          <TabsContent value="enquiries">
            <Card>
              <CardHeader>
                <CardTitle>Enquiries ({enquiries.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded" />)}
                  </div>
                ) : enquiries.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No enquiries yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Phone</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead>Source</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {enquiries.map((enquiry) => (
                          <TableRow key={enquiry.id}>
                            <TableCell className="font-medium">{enquiry.name}</TableCell>
                            <TableCell>
                              <a href={`tel:${enquiry.phone}`} className="text-primary hover:underline">
                                {enquiry.phone}
                              </a>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">{enquiry.message}</TableCell>
                            <TableCell>
                              <Badge variant="outline">{enquiry.source}</Badge>
                            </TableCell>
                            <TableCell>{formatDate(enquiry.created_at)}</TableCell>
                            <TableCell>
                              <Badge className={
                                enquiry.status === "new" ? "bg-orange-500" :
                                enquiry.status === "contacted" ? "bg-blue-500" :
                                "bg-green-500"
                              }>
                                {enquiry.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={enquiry.status}
                                onValueChange={(val) => handleUpdateEnquiryStatus(enquiry.id, val)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="contacted">Contacted</SelectItem>
                                  <SelectItem value="closed">Closed</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Listing Requests Tab */}
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>Listing Requests ({listingRequests.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[1,2,3].map(i => <div key={i} className="h-16 shimmer rounded" />)}
                  </div>
                ) : listingRequests.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No listing requests yet</p>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contact</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Intent</TableHead>
                          <TableHead>Quality</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {listingRequests.map((request) => (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{request.contact_name}</div>
                                <a href={`tel:${request.contact_phone}`} className="text-sm text-primary hover:underline">
                                  {request.contact_phone}
                                </a>
                              </div>
                            </TableCell>
                            <TableCell className="capitalize">{request.property_type}</TableCell>
                            <TableCell>{request.area}, {request.city}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className="capitalize">{request.intent}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className={`font-medium ${
                                request.quality_score >= 70 ? "text-green-600" :
                                request.quality_score >= 40 ? "text-yellow-600" :
                                "text-red-500"
                              }`}>
                                {request.quality_score}%
                              </div>
                            </TableCell>
                            <TableCell>{formatDate(request.created_at)}</TableCell>
                            <TableCell>
                              <Badge className={
                                request.status === "pending" ? "bg-orange-500" :
                                request.status === "reviewed" ? "bg-blue-500" :
                                request.status === "approved" ? "bg-green-500" :
                                "bg-red-500"
                              }>
                                {request.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={request.status}
                                onValueChange={(val) => handleUpdateRequestStatus(request.id, val)}
                              >
                                <SelectTrigger className="w-[120px]">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="pending">Pending</SelectItem>
                                  <SelectItem value="reviewed">Reviewed</SelectItem>
                                  <SelectItem value="approved">Approved</SelectItem>
                                  <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                              </Select>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Property Form Dialog */}
      <PropertyForm
        open={propertyDialogOpen}
        onOpenChange={setPropertyDialogOpen}
        property={editingProperty}
        token={token}
        onSuccess={fetchData}
      />
    </div>
  );
}

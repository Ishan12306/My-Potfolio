import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  Plus,
  Edit,
  Save,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Home,
  AlertCircle,
  CheckCircle
} from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function RentalPropertiesTab({ token }) {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });
  
  // Add property modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addFormData, setAddFormData] = useState({
    flat_no: "",
    society_name: "",
    contact_number: "",
    agreement_start_date: "",
    agreement_end_date: "",
    remarks: ""
  });
  const [addLoading, setAddLoading] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    fetchProperties(pagination.page);
  }, []);

  const fetchProperties = async (page = 1) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API}/admin/rental-properties?page=${page}&limit=50`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProperties(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching rental properties:", error);
      toast.error("Failed to load rental properties");
    } finally {
      setLoading(false);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!addFormData.flat_no?.trim()) {
      toast.error("Flat No is required");
      return;
    }
    if (!addFormData.society_name?.trim()) {
      toast.error("Society Name is required");
      return;
    }
    if (!addFormData.contact_number?.trim()) {
      toast.error("Contact Number is required");
      return;
    }
    if (!addFormData.agreement_start_date) {
      toast.error("Start Date is required");
      return;
    }
    if (!addFormData.agreement_end_date) {
      toast.error("End Date is required");
      return;
    }
    if (addFormData.agreement_end_date <= addFormData.agreement_start_date) {
      toast.error("End Date must be greater than Start Date");
      return;
    }

    setAddLoading(true);
    try {
      await axios.post(
        `${API}/admin/rental-properties`,
        addFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rental property added successfully");
      setAddModalOpen(false);
      setAddFormData({
        flat_no: "",
        society_name: "",
        contact_number: "",
        agreement_start_date: "",
        agreement_end_date: "",
        remarks: ""
      });
      fetchProperties(1);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to add property");
    } finally {
      setAddLoading(false);
    }
  };

  const handleStartEdit = (property) => {
    setEditingId(property.id);
    setEditFormData({
      flat_no: property.flat_no,
      society_name: property.society_name,
      contact_number: property.contact_number,
      agreement_start_date: property.agreement_start_date,
      agreement_end_date: property.agreement_end_date,
      remarks: property.remarks || ""
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSaveEdit = async (propertyId) => {
    // Validation
    if (!editFormData.flat_no?.trim()) {
      toast.error("Flat No is required");
      return;
    }
    if (!editFormData.society_name?.trim()) {
      toast.error("Society Name is required");
      return;
    }
    if (!editFormData.contact_number?.trim()) {
      toast.error("Contact Number is required");
      return;
    }
    if (!editFormData.agreement_start_date) {
      toast.error("Start Date is required");
      return;
    }
    if (!editFormData.agreement_end_date) {
      toast.error("End Date is required");
      return;
    }
    if (editFormData.agreement_end_date <= editFormData.agreement_start_date) {
      toast.error("End Date must be greater than Start Date");
      return;
    }

    setSaveLoading(true);
    try {
      await axios.put(
        `${API}/admin/rental-properties/${propertyId}`,
        editFormData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Rental property updated successfully");
      setEditingId(null);
      setEditFormData({});
      fetchProperties(pagination.page);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Failed to update property");
    } finally {
      setSaveLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    fetchProperties(newPage);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    });
  };

  const getStatusBadge = (property) => {
    if (property.status === "due_approaching") {
      return (
        <Badge className="bg-red-500 text-white flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {property.status_text}
          <span className="text-xs">({property.remaining_days}d)</span>
        </Badge>
      );
    }
    return (
      <Badge className="bg-green-500 text-white flex items-center gap-1">
        <CheckCircle className="w-3 h-3" />
        {property.status_text}
        <span className="text-xs">({property.remaining_days}d)</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Rental Property Details</h2>
          <p className="text-sm text-muted-foreground">
            Manage rental agreements and track due dates
          </p>
        </div>
        <Button 
          onClick={() => setAddModalOpen(true)} 
          className="rounded-full"
          data-testid="add-rental-property-btn"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Property
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border bg-card">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12">
            <Home className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Rental Properties</h3>
            <p className="text-muted-foreground mb-4">
              Add your first rental property to track agreements
            </p>
            <Button onClick={() => setAddModalOpen(true)} className="rounded-full">
              <Plus className="w-4 h-4 mr-2" />
              Add Property
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Sr No</TableHead>
                  <TableHead>Flat No</TableHead>
                  <TableHead>Society Name</TableHead>
                  <TableHead>Contact Number</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remarks</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property, index) => (
                  <TableRow key={property.id}>
                    <TableCell className="font-medium">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </TableCell>
                    
                    {editingId === property.id ? (
                      <>
                        <TableCell>
                          <Input
                            value={editFormData.flat_no}
                            onChange={(e) => setEditFormData({...editFormData, flat_no: e.target.value})}
                            className="h-8 w-24"
                            data-testid={`edit-flat-no-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editFormData.society_name}
                            onChange={(e) => setEditFormData({...editFormData, society_name: e.target.value})}
                            className="h-8 w-40"
                            data-testid={`edit-society-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editFormData.contact_number}
                            onChange={(e) => setEditFormData({...editFormData, contact_number: e.target.value})}
                            className="h-8 w-32"
                            data-testid={`edit-contact-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={editFormData.agreement_start_date}
                            onChange={(e) => setEditFormData({...editFormData, agreement_start_date: e.target.value})}
                            className="h-8 w-36"
                            data-testid={`edit-start-date-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            type="date"
                            value={editFormData.agreement_end_date}
                            onChange={(e) => setEditFormData({...editFormData, agreement_end_date: e.target.value})}
                            className="h-8 w-36"
                            data-testid={`edit-end-date-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(property)}
                        </TableCell>
                        <TableCell>
                          <Input
                            value={editFormData.remarks}
                            onChange={(e) => setEditFormData({...editFormData, remarks: e.target.value})}
                            placeholder="Optional"
                            className="h-8 w-32"
                            data-testid={`edit-remarks-${property.id}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(property.id)}
                              disabled={saveLoading}
                              className="h-8 px-2"
                              data-testid={`save-btn-${property.id}`}
                            >
                              {saveLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={handleCancelEdit}
                              className="h-8 px-2"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </>
                    ) : (
                      <>
                        <TableCell className="font-medium">{property.flat_no}</TableCell>
                        <TableCell>{property.society_name}</TableCell>
                        <TableCell>
                          <a href={`tel:${property.contact_number}`} className="text-primary hover:underline">
                            {property.contact_number}
                          </a>
                        </TableCell>
                        <TableCell>{formatDate(property.agreement_start_date)}</TableCell>
                        <TableCell>{formatDate(property.agreement_end_date)}</TableCell>
                        <TableCell>{getStatusBadge(property)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {property.remarks || "-"}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartEdit(property)}
                            className="h-8 px-2"
                            data-testid={`edit-btn-${property.id}`}
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                        </TableCell>
                      </>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        {properties.length > 0 && (
          <div className="flex items-center justify-between px-4 py-3 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
              {pagination.total} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={!pagination.has_prev}
                className="rounded-full"
                data-testid="prev-page-btn"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Prev
              </Button>
              <span className="text-sm px-2">
                Page {pagination.page} of {pagination.total_pages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={!pagination.has_next}
                className="rounded-full"
                data-testid="next-page-btn"
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Property Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Rental Property</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddProperty} className="space-y-4">
            <div>
              <Label htmlFor="flat_no">Flat No *</Label>
              <Input
                id="flat_no"
                value={addFormData.flat_no}
                onChange={(e) => setAddFormData({...addFormData, flat_no: e.target.value})}
                placeholder="e.g., A-101"
                className="mt-1"
                data-testid="add-flat-no"
              />
            </div>
            <div>
              <Label htmlFor="society_name">Society Name *</Label>
              <Input
                id="society_name"
                value={addFormData.society_name}
                onChange={(e) => setAddFormData({...addFormData, society_name: e.target.value})}
                placeholder="e.g., Maruti Enclave"
                className="mt-1"
                data-testid="add-society-name"
              />
            </div>
            <div>
              <Label htmlFor="contact_number">Contact Number *</Label>
              <Input
                id="contact_number"
                value={addFormData.contact_number}
                onChange={(e) => setAddFormData({...addFormData, contact_number: e.target.value})}
                placeholder="e.g., 9876543210"
                className="mt-1"
                data-testid="add-contact-number"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={addFormData.agreement_start_date}
                  onChange={(e) => setAddFormData({...addFormData, agreement_start_date: e.target.value})}
                  className="mt-1"
                  data-testid="add-start-date"
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={addFormData.agreement_end_date}
                  onChange={(e) => setAddFormData({...addFormData, agreement_end_date: e.target.value})}
                  className="mt-1"
                  data-testid="add-end-date"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="remarks">Remarks (Optional)</Label>
              <Textarea
                id="remarks"
                value={addFormData.remarks}
                onChange={(e) => setAddFormData({...addFormData, remarks: e.target.value})}
                placeholder="Any additional notes..."
                rows={2}
                className="mt-1"
                data-testid="add-remarks"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setAddModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={addLoading}
                data-testid="submit-add-rental"
              >
                {addLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Property
                  </>
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

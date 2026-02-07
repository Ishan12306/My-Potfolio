import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";
import axios from "axios";
import { User, Shield, Phone, ArrowRight, Loader2 } from "lucide-react";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState("user");
  
  // User OTP state
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // Admin state
  const [adminId, setAdminId] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoading, setAdminLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    navigate("/");
    return null;
  }

  const handleSendOtp = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setSendingOtp(true);
    try {
      // Format phone number
      let formattedPhone = phone.replace(/\D/g, "");
      if (!formattedPhone.startsWith("91")) {
        formattedPhone = "91" + formattedPhone;
      }
      formattedPhone = "+" + formattedPhone;

      await axios.post(`${API}/auth/send-otp`, { phone: formattedPhone });
      setPhone(formattedPhone);
      setOtpSent(true);
      toast.success("OTP sent to your phone!");
    } catch (error) {
      const message = error.response?.data?.detail || "Failed to send OTP";
      toast.error(message);
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      toast.error("Please enter the 6-digit OTP");
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await axios.post(`${API}/auth/verify-otp`, {
        phone,
        otp_code: otp
      });
      
      login(response.data.access_token, {
        id: response.data.user_id,
        user_type: response.data.user_type,
        phone
      });
      
      toast.success("Login successful!");
      navigate("/");
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid OTP";
      toast.error(message);
      setOtp("");
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!adminId || !adminPassword) {
      toast.error("Please enter admin credentials");
      return;
    }

    setAdminLoading(true);
    try {
      const response = await axios.post(`${API}/auth/admin-login`, {
        admin_id: adminId,
        password: adminPassword
      });
      
      login(response.data.access_token, {
        id: response.data.user_id,
        user_type: response.data.user_type
      });
      
      toast.success("Admin login successful!");
      navigate("/admin");
    } catch (error) {
      const message = error.response?.data?.detail || "Invalid credentials";
      toast.error(message);
    } finally {
      setAdminLoading(false);
    }
  };

  const handleResendOtp = () => {
    setOtp("");
    setOtpSent(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-muted py-12 animate-fade-in">
      <div className="container-main max-w-md">
        <Card className="shadow-xl">
          <CardContent className="p-6 md:p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold mb-2">Welcome to TM Real Estate</h1>
              <p className="text-muted-foreground">Sign in to access your account</p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="user" className="flex items-center gap-2" data-testid="user-tab">
                  <User className="w-4 h-4" />
                  User
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2" data-testid="admin-tab">
                  <Shield className="w-4 h-4" />
                  Admin
                </TabsTrigger>
              </TabsList>

              {/* User OTP Login */}
              <TabsContent value="user">
                {!otpSent ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Enter your phone number"
                          className="pl-10"
                          data-testid="phone-input"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        We'll send you an OTP for verification
                      </p>
                    </div>
                    <Button
                      onClick={handleSendOtp}
                      disabled={sendingOtp}
                      className="w-full rounded-full"
                      data-testid="send-otp-btn"
                    >
                      {sendingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          Send OTP
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Enter the 6-digit OTP sent to
                      </p>
                      <p className="font-medium">{phone}</p>
                    </div>
                    
                    <div className="flex justify-center">
                      <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={setOtp}
                        data-testid="otp-input"
                      >
                        <InputOTPGroup>
                          <InputOTPSlot index={0} />
                          <InputOTPSlot index={1} />
                          <InputOTPSlot index={2} />
                          <InputOTPSlot index={3} />
                          <InputOTPSlot index={4} />
                          <InputOTPSlot index={5} />
                        </InputOTPGroup>
                      </InputOTP>
                    </div>

                    <Button
                      onClick={handleVerifyOtp}
                      disabled={verifyingOtp || otp.length !== 6}
                      className="w-full rounded-full"
                      data-testid="verify-otp-btn"
                    >
                      {verifyingOtp ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify & Login"
                      )}
                    </Button>

                    <div className="text-center">
                      <button
                        onClick={handleResendOtp}
                        className="text-sm text-primary hover:underline"
                        data-testid="resend-otp"
                      >
                        Didn't receive OTP? Resend
                      </button>
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                  <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
                </div>
              </TabsContent>

              {/* Admin Login */}
              <TabsContent value="admin">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <Label htmlFor="adminId">Admin ID</Label>
                    <Input
                      id="adminId"
                      value={adminId}
                      onChange={(e) => setAdminId(e.target.value)}
                      placeholder="Enter admin ID"
                      className="mt-1"
                      data-testid="admin-id-input"
                    />
                  </div>
                  <div>
                    <Label htmlFor="adminPassword">Password</Label>
                    <Input
                      id="adminPassword"
                      type="password"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="Enter password"
                      className="mt-1"
                      data-testid="admin-password-input"
                    />
                  </div>
                  <Button
                    type="submit"
                    disabled={adminLoading}
                    className="w-full rounded-full"
                    data-testid="admin-login-btn"
                  >
                    {adminLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Logging in...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Admin Login
                      </>
                    )}
                  </Button>
                </form>

                <div className="mt-6 pt-6 border-t text-center text-sm text-muted-foreground">
                  <p>Admin access is restricted to authorized personnel only</p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Mail, Calendar } from "lucide-react";

export const AccountPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setEmail(user.email || "");
          setCreatedAt(new Date(user.created_at).toLocaleDateString());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  const handleBackHome = () => {
    navigate("/");
  };

  const handleUpdateEmail = async () => {
    // This would be implemented with proper email update functionality
    toast({
      title: "Coming soon",
      description: "Email update functionality will be available soon.",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground mt-4">Loading account details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <div className="container mx-auto px-4 py-8">
        <Button
          onClick={handleBackHome}
          variant="outline"
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="max-w-2xl mx-auto">
          <Card className="p-8 shadow-card">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-primary mb-2">Account Details</h1>
              <p className="text-muted-foreground">Manage your Lads account information</p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">Email Address</Label>
                  <p className="text-lg">{email}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <Label className="text-sm font-medium">Member Since</Label>
                  <p className="text-lg">{createdAt}</p>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Button
                  onClick={handleUpdateEmail}
                  variant="outline"
                  className="w-full"
                >
                  Update Email Address
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Settings as SettingsIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SiteSettings {
  site_name: string;
  site_description: string;
  comments_enabled: string;
  ga_measurement_id: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<SiteSettings>({
    site_name: "",
    site_description: "",
    comments_enabled: "true",
    ga_measurement_id: "",
    contact_address: "",
    contact_phone: "",
    contact_email: "",
    contact_hours: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("site_settings")
        .select("key, value");

      if (error) throw error;

      const settingsMap: Record<string, string> = {};
      data?.forEach((item) => {
        settingsMap[item.key] = item.value || "";
      });

      setSettings({
        site_name: settingsMap.site_name || "",
        site_description: settingsMap.site_description || "",
        comments_enabled: settingsMap.comments_enabled || "true",
        ga_measurement_id: settingsMap.ga_measurement_id || "",
        contact_address: settingsMap.contact_address || "",
        contact_phone: settingsMap.contact_phone || "",
        contact_email: settingsMap.contact_email || "",
        contact_hours: settingsMap.contact_hours || "",
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({ title: "Error", description: "Failed to fetch settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from("site_settings")
          .upsert(update, { onConflict: "key" });

        if (error) throw error;
      }

      toast({ title: "Success", description: "Settings saved successfully" });
    } catch (error: any) {
      console.error("Error saving settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              General Settings
            </CardTitle>
            <CardDescription>
              Configure your website's basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site_name">Site Name</Label>
              <Input
                id="site_name"
                value={settings.site_name}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, site_name: e.target.value }))
                }
                placeholder="My Islamic Website"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="site_description">Site Description</Label>
              <Textarea
                id="site_description"
                value={settings.site_description}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    site_description: e.target.value,
                  }))
                }
                placeholder="A brief description of your website..."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comments</CardTitle>
            <CardDescription>
              Configure comment settings for your posts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Switch
                id="comments_enabled"
                checked={settings.comments_enabled === "true"}
                onCheckedChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    comments_enabled: checked ? "true" : "false",
                  }))
                }
              />
              <Label htmlFor="comments_enabled">
                Enable comments globally
              </Label>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              When disabled, comments will be hidden on all posts regardless of individual post settings.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>
              Configure contact details shown on the Contact Us page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="contact_address">Address</Label>
              <Textarea
                id="contact_address"
                value={settings.contact_address}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact_address: e.target.value,
                  }))
                }
                placeholder="123 Street Name, City, Country"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Phone Numbers</Label>
              <Textarea
                id="contact_phone"
                value={settings.contact_phone}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact_phone: e.target.value,
                  }))
                }
                placeholder="+1 234 567 890 (one per line)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_email">Email Addresses</Label>
              <Textarea
                id="contact_email"
                value={settings.contact_email}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact_email: e.target.value,
                  }))
                }
                placeholder="info@example.com (one per line)"
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_hours">Office Hours</Label>
              <Textarea
                id="contact_hours"
                value={settings.contact_hours}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    contact_hours: e.target.value,
                  }))
                }
                placeholder="Mon - Fri: 9am - 6pm (one per line)"
                rows={2}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>
              Configure Google Analytics tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ga_measurement_id">GA Measurement ID</Label>
              <Input
                id="ga_measurement_id"
                value={settings.ga_measurement_id}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    ga_measurement_id: e.target.value,
                  }))
                }
                placeholder="G-XXXXXXXXXX"
              />
              <p className="text-sm text-muted-foreground">
                Enter your Google Analytics 4 measurement ID to enable tracking.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={saving} size="lg">
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}

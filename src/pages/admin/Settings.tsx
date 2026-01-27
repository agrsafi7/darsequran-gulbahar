import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Save, Settings as SettingsIcon, LayoutGrid } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface SiteSettings {
  site_name: string;
  site_description: string;
  comments_enabled: string;
  ga_measurement_id: string;
  contact_address: string;
  contact_phone: string;
  contact_email: string;
  contact_hours: string;
  recent_posts_categories: string;
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
    recent_posts_categories: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Fetch all categories
  const { data: categories } = useQuery({
    queryKey: ["all-categories-for-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  // Fetch dars categories (scholars)
  const { data: darsCategories } = useQuery({
    queryKey: ["dars-categories-for-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dars_categories")
        .select("id, title")
        .eq("is_visible", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

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
        recent_posts_categories: settingsMap.recent_posts_categories || "",
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

  // Parse selected categories from comma-separated string
  const selectedCategories = settings.recent_posts_categories
    ? settings.recent_posts_categories.split(",").map(c => c.trim())
    : [];

  const toggleCategory = (categoryName: string) => {
    const updated = selectedCategories.includes(categoryName)
      ? selectedCategories.filter(c => c !== categoryName)
      : [...selectedCategories, categoryName];
    
    setSettings(prev => ({
      ...prev,
      recent_posts_categories: updated.join(","),
    }));
  };

  // Combine regular categories with dars categories for display
  const allCategoryOptions = [
    ...(categories || []).map(c => ({ name: c.name, type: "Category" })),
    ...(darsCategories || []).map(c => ({ name: c.title, type: "Scholar" })),
  ];

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
            <CardTitle className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5" />
              Recent Posts Section
            </CardTitle>
            <CardDescription>
              Select which categories should appear in the Recent Posts section on the homepage.
              One post from each selected category will be displayed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {allCategoryOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No categories available. Create categories first.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {allCategoryOptions.map((category) => (
                  <div
                    key={category.name}
                    className="flex items-center space-x-2 p-2 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                  >
                    <Checkbox
                      id={`cat-${category.name}`}
                      checked={selectedCategories.includes(category.name)}
                      onCheckedChange={() => toggleCategory(category.name)}
                    />
                    <Label
                      htmlFor={`cat-${category.name}`}
                      className="flex-1 cursor-pointer text-sm"
                    >
                      {category.name}
                      <span className="text-xs text-muted-foreground ml-2">
                        ({category.type})
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              {selectedCategories.length === 0
                ? "No categories selected. The Recent Posts section will be hidden."
                : `${selectedCategories.length} category(ies) selected.`}
            </p>
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

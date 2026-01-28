import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Loader2, Save, Layout, Sidebar, FileText, PanelBottom, MonitorSmartphone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AdPlacement {
  id: string;
  name: string;
  description: string;
  settingKey: string;
  enabledKey: string;
  icon: React.ElementType;
}

const adPlacements: AdPlacement[] = [
  {
    id: "header",
    name: "Below Header",
    description: "Appears below the hero section on the homepage",
    settingKey: "ad_code_header",
    enabledKey: "ad_enabled_header",
    icon: Layout,
  },
  {
    id: "sidebar",
    name: "Sidebar",
    description: "Appears in the sidebar on post and page detail views",
    settingKey: "ad_code_sidebar",
    enabledKey: "ad_enabled_sidebar",
    icon: Sidebar,
  },
  {
    id: "in_content",
    name: "In-Content",
    description: "Appears within post content (after the first section)",
    settingKey: "ad_code_in_content",
    enabledKey: "ad_enabled_in_content",
    icon: FileText,
  },
  {
    id: "footer",
    name: "Above Footer",
    description: "Appears as a pre-footer banner across all pages",
    settingKey: "ad_code_footer",
    enabledKey: "ad_enabled_footer",
    icon: PanelBottom,
  },
  {
    id: "mobile",
    name: "Mobile Banner",
    description: "Sticky bottom banner on mobile devices only",
    settingKey: "ad_code_mobile",
    enabledKey: "ad_enabled_mobile",
    icon: MonitorSmartphone,
  },
];

export default function AdPlacements() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adCodes, setAdCodes] = useState<Record<string, string>>({});
  const [adEnabled, setAdEnabled] = useState<Record<string, boolean>>({});
  const [publisherId, setPublisherId] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    
    const allKeys = [
      "adsense_publisher_id",
      ...adPlacements.flatMap(p => [p.settingKey, p.enabledKey])
    ];
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("key, value")
      .in("key", allKeys);

    if (!error && data) {
      const codes: Record<string, string> = {};
      const enabled: Record<string, boolean> = {};
      
      data.forEach((item) => {
        if (item.key === "adsense_publisher_id") {
          setPublisherId(item.value || "");
        } else if (item.key.startsWith("ad_code_")) {
          codes[item.key] = item.value || "";
        } else if (item.key.startsWith("ad_enabled_")) {
          enabled[item.key] = item.value === "true";
        }
      });
      
      setAdCodes(codes);
      setAdEnabled(enabled);
    }
    
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      // Prepare all settings to upsert
      const settingsToUpsert = [
        { key: "adsense_publisher_id", value: publisherId },
        ...adPlacements.flatMap(p => [
          { key: p.settingKey, value: adCodes[p.settingKey] || "" },
          { key: p.enabledKey, value: adEnabled[p.enabledKey] ? "true" : "false" },
        ])
      ];

      for (const setting of settingsToUpsert) {
        // Check if setting exists
        const { data: existing } = await supabase
          .from("site_settings")
          .select("id")
          .eq("key", setting.key)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("site_settings")
            .update({ value: setting.value })
            .eq("key", setting.key);
        } else {
          await supabase
            .from("site_settings")
            .insert({ key: setting.key, value: setting.value });
        }
      }

      toast({
        title: "Settings Saved",
        description: "Ad placement settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving ad settings:", error);
      toast({
        title: "Error",
        description: "Failed to save ad placement settings.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Ad Placements</h1>
            <p className="text-muted-foreground mt-1">
              Manage Google AdSense ad placements across your website
            </p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save All Changes
          </Button>
        </div>

        {/* Publisher ID Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Google AdSense Publisher ID</CardTitle>
            <CardDescription>
              Your AdSense publisher ID (e.g., ca-pub-1234567890123456)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md">
              <Input
                placeholder="ca-pub-XXXXXXXXXXXXXXXX"
                value={publisherId}
                onChange={(e) => setPublisherId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Find your publisher ID in your AdSense account under Account → Account information
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Ad Placement Cards */}
        <div className="grid gap-6">
          {adPlacements.map((placement) => (
            <Card key={placement.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <placement.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{placement.name}</CardTitle>
                      <CardDescription>{placement.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor={`enabled-${placement.id}`} className="text-sm">
                      {adEnabled[placement.enabledKey] ? "Enabled" : "Disabled"}
                    </Label>
                    <Switch
                      id={`enabled-${placement.id}`}
                      checked={adEnabled[placement.enabledKey] || false}
                      onCheckedChange={(checked) =>
                        setAdEnabled(prev => ({ ...prev, [placement.enabledKey]: checked }))
                      }
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor={`code-${placement.id}`}>Ad Unit Code</Label>
                  <Textarea
                    id={`code-${placement.id}`}
                    placeholder={`Paste your AdSense ad unit code here...\n\nExample:\n<ins class="adsbygoogle"\n     style="display:block"\n     data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"\n     data-ad-slot="1234567890"\n     data-ad-format="auto"\n     data-full-width-responsive="true"></ins>\n<script>\n     (adsbygoogle = window.adsbygoogle || []).push({});\n</script>`}
                    value={adCodes[placement.settingKey] || ""}
                    onChange={(e) =>
                      setAdCodes(prev => ({ ...prev, [placement.settingKey]: e.target.value }))
                    }
                    className="font-mono text-sm min-h-[150px]"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy the complete ad unit code from your AdSense account and paste it here.
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <Card className="bg-muted/30">
          <CardHeader>
            <CardTitle className="text-lg">How to Get Your Ad Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
              <li>Sign in to your <a href="https://www.google.com/adsense" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AdSense account</a></li>
              <li>Go to Ads → By ad unit → Display ads (or your preferred ad type)</li>
              <li>Configure your ad unit size and settings</li>
              <li>Copy the generated ad code</li>
              <li>Paste the code in the appropriate placement above</li>
              <li>Enable the placement using the toggle switch</li>
            </ol>
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Ads may take a few minutes to appear after enabling. Make sure your AdSense account is approved and in good standing.
            </p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}

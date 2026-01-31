import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Youtube, Facebook, Loader2, Save, Radio } from "lucide-react";
import { toast } from "sonner";

interface LiveStream {
  id: string;
  platform: "youtube" | "facebook";
  stream_url: string;
  is_live: boolean;
  updated_at: string;
}

const LiveStreams = () => {
  const queryClient = useQueryClient();

  const { data: streams, isLoading } = useQuery({
    queryKey: ["admin-live-streams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("platform");

      if (error) throw error;
      return data as LiveStream[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      stream_url,
      is_live,
    }: {
      id: string;
      stream_url: string;
      is_live: boolean;
    }) => {
      const { error } = await supabase
        .from("live_streams")
        .update({ stream_url, is_live })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-streams"] });
      queryClient.invalidateQueries({ queryKey: ["live-streams"] });
      toast.success("Live stream settings updated!");
    },
    onError: (error) => {
      toast.error("Failed to update: " + error.message);
    },
  });

  const youtubeStream = streams?.find((s) => s.platform === "youtube");
  const facebookStream = streams?.find((s) => s.platform === "facebook");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Radio className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Live Streams</h1>
            <p className="text-muted-foreground">
              Manage your YouTube and Facebook live stream buttons
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* YouTube Card */}
            <LiveStreamCard
              platform="youtube"
              stream={youtubeStream}
              icon={<Youtube className="w-6 h-6" />}
              color="red"
              onSave={(url, isLive) =>
                updateMutation.mutate({
                  id: youtubeStream!.id,
                  stream_url: url,
                  is_live: isLive,
                })
              }
              isSaving={updateMutation.isPending}
            />

            {/* Facebook Card */}
            <LiveStreamCard
              platform="facebook"
              stream={facebookStream}
              icon={<Facebook className="w-6 h-6" />}
              color="blue"
              onSave={(url, isLive) =>
                updateMutation.mutate({
                  id: facebookStream!.id,
                  stream_url: url,
                  is_live: isLive,
                })
              }
              isSaving={updateMutation.isPending}
            />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">How to use</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground space-y-2">
            <p>1. Enter your YouTube channel or live stream URL</p>
            <p>2. Enter your Facebook page or live stream URL</p>
            <p>3. When you start a live stream, toggle "Currently Live" to ON</p>
            <p>4. The buttons on the homepage will show a LIVE badge when active</p>
            <p>5. Don't forget to toggle OFF when you end the stream!</p>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

interface LiveStreamCardProps {
  platform: "youtube" | "facebook";
  stream: LiveStream | undefined;
  icon: React.ReactNode;
  color: "red" | "blue";
  onSave: (url: string, isLive: boolean) => void;
  isSaving: boolean;
}

function LiveStreamCard({
  platform,
  stream,
  icon,
  color,
  onSave,
  isSaving,
}: LiveStreamCardProps) {
  const [url, setUrl] = useState(stream?.stream_url || "");
  const [isLive, setIsLive] = useState(stream?.is_live || false);

  // Update local state when data loads
  useState(() => {
    if (stream) {
      setUrl(stream.stream_url);
      setIsLive(stream.is_live);
    }
  });

  const hasChanges =
    url !== (stream?.stream_url || "") || isLive !== (stream?.is_live || false);

  const colorClasses = {
    red: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      icon: "text-red-500",
    },
    blue: {
      bg: "bg-blue-600/10",
      border: "border-blue-600/30",
      icon: "text-blue-600",
    },
  };

  return (
    <Card className={`${colorClasses[color].border} border-2`}>
      <CardHeader className={colorClasses[color].bg}>
        <div className="flex items-center gap-3">
          <div className={colorClasses[color].icon}>{icon}</div>
          <div>
            <CardTitle className="capitalize">{platform}</CardTitle>
            <CardDescription>
              {isLive ? (
                <span className="text-green-600 font-medium">● Currently Live</span>
              ) : (
                <span className="text-muted-foreground">○ Not Live</span>
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor={`${platform}-url`}>
            {platform === "youtube" ? "YouTube" : "Facebook"} URL
          </Label>
          <Input
            id={`${platform}-url`}
            placeholder={
              platform === "youtube"
                ? "https://youtube.com/c/YourChannel or live stream URL"
                : "https://facebook.com/YourPage or live stream URL"
            }
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor={`${platform}-live`} className="cursor-pointer">
            Currently Live
          </Label>
          <Switch
            id={`${platform}-live`}
            checked={isLive}
            onCheckedChange={setIsLive}
          />
        </div>

        <Button
          onClick={() => onSave(url, isLive)}
          disabled={!hasChanges || isSaving}
          className="w-full"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Save Changes
        </Button>
      </CardContent>
    </Card>
  );
}

export default LiveStreams;

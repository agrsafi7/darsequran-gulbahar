import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DarsAudio {
  id: string;
  title: string;
  description: string | null;
  audio_url: string;
  duration: string | null;
  file_size: string | null;
  category: string;
  sort_order: number;
  is_published: boolean;
  created_at: string;
}

type Category = "listen" | "download" | "complete";

const categoryLabels: Record<Category, string> = {
  listen: "Listen Online",
  download: "Download Dars",
  complete: "Complete Dars",
};

export default function AdminDarsAudio() {
  const [audioList, setAudioList] = useState<DarsAudio[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<DarsAudio | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    audio_url: "",
    duration: "",
    file_size: "",
    category: "listen" as Category,
    sort_order: 0,
    is_published: true,
  });

  useEffect(() => {
    fetchAudio();
  }, []);

  const fetchAudio = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("dars_audio")
      .select("*")
      .order("category", { ascending: true })
      .order("sort_order", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch audio list",
        variant: "destructive",
      });
    } else {
      setAudioList(data || []);
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      audio_url: "",
      duration: "",
      file_size: "",
      category: "listen",
      sort_order: 0,
      is_published: true,
    });
    setEditingAudio(null);
  };

  const handleEdit = (audio: DarsAudio) => {
    setEditingAudio(audio);
    setFormData({
      title: audio.title,
      description: audio.description || "",
      audio_url: audio.audio_url,
      duration: audio.duration || "",
      file_size: audio.file_size || "",
      category: audio.category as Category,
      sort_order: audio.sort_order,
      is_published: audio.is_published,
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: formData.title,
      description: formData.description || null,
      audio_url: formData.audio_url,
      duration: formData.duration || null,
      file_size: formData.file_size || null,
      category: formData.category,
      sort_order: formData.sort_order,
      is_published: formData.is_published,
    };

    if (editingAudio) {
      const { error } = await supabase
        .from("dars_audio")
        .update(payload)
        .eq("id", editingAudio.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update audio",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Audio updated successfully" });
        setDialogOpen(false);
        resetForm();
        fetchAudio();
      }
    } else {
      const { error } = await supabase.from("dars_audio").insert(payload);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add audio",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Audio added successfully" });
        setDialogOpen(false);
        resetForm();
        fetchAudio();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this audio?")) return;

    const { error } = await supabase.from("dars_audio").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete audio",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Audio deleted successfully" });
      fetchAudio();
    }
  };

  const filteredAudio =
    filterCategory === "all"
      ? audioList
      : audioList.filter((a) => a.category === filterCategory);

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Music className="h-5 w-5" />
            Dars-e-Quran Audio
          </CardTitle>
          <div className="flex items-center gap-4">
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="listen">Listen Online</SelectItem>
                <SelectItem value="download">Download Dars</SelectItem>
                <SelectItem value="complete">Complete Dars</SelectItem>
              </SelectContent>
            </Select>

            <Dialog
              open={dialogOpen}
              onOpenChange={(open) => {
                setDialogOpen(open);
                if (!open) resetForm();
              }}
            >
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Audio
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>
                    {editingAudio ? "Edit Audio" : "Add New Audio"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({ ...formData, description: e.target.value })
                      }
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="audio_url">Audio URL *</Label>
                    <Input
                      id="audio_url"
                      value={formData.audio_url}
                      onChange={(e) =>
                        setFormData({ ...formData, audio_url: e.target.value })
                      }
                      placeholder="https://..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({ ...formData, duration: e.target.value })
                        }
                        placeholder="e.g., 45:30"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="file_size">File Size</Label>
                      <Input
                        id="file_size"
                        value={formData.file_size}
                        onChange={(e) =>
                          setFormData({ ...formData, file_size: e.target.value })
                        }
                        placeholder="e.g., 25 MB"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value: Category) =>
                          setFormData({ ...formData, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="listen">Listen Online</SelectItem>
                          <SelectItem value="download">Download Dars</SelectItem>
                          <SelectItem value="complete">Complete Dars</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sort_order">Sort Order</Label>
                      <Input
                        id="sort_order"
                        type="number"
                        value={formData.sort_order}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            sort_order: parseInt(e.target.value) || 0,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_published"
                      checked={formData.is_published}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_published: checked })
                      }
                    />
                    <Label htmlFor="is_published">Published</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      {editingAudio ? "Update" : "Add"} Audio
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAudio.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      No audio found. Add your first audio file.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAudio.map((audio) => (
                    <TableRow key={audio.id}>
                      <TableCell className="font-medium">{audio.title}</TableCell>
                      <TableCell>
                        {categoryLabels[audio.category as Category]}
                      </TableCell>
                      <TableCell>{audio.duration || "-"}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            audio.is_published
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {audio.is_published ? "Published" : "Draft"}
                        </span>
                      </TableCell>
                      <TableCell>{audio.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(audio)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(audio.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

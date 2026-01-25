import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
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
import { Plus, Pencil, Trash2, Loader2, Music, ListMusic } from "lucide-react";
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
  playlist_id: string | null;
  created_at: string;
}

interface Playlist {
  id: string;
  title: string;
  description: string | null;
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
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [playlistDialogOpen, setPlaylistDialogOpen] = useState(false);
  const [editingAudio, setEditingAudio] = useState<DarsAudio | null>(null);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
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
    playlist_id: "",
  });

  const [playlistFormData, setPlaylistFormData] = useState({
    title: "",
    description: "",
    category: "listen" as Category,
    sort_order: 0,
    is_published: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    const [audioRes, playlistsRes] = await Promise.all([
      supabase
        .from("dars_audio")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true }),
      supabase
        .from("dars_playlists")
        .select("*")
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true }),
    ]);

    if (audioRes.error) {
      toast({
        title: "Error",
        description: "Failed to fetch audio list",
        variant: "destructive",
      });
    } else {
      setAudioList(audioRes.data || []);
    }

    if (!playlistsRes.error) {
      setPlaylists(playlistsRes.data || []);
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
      playlist_id: "",
    });
    setEditingAudio(null);
  };

  const resetPlaylistForm = () => {
    setPlaylistFormData({
      title: "",
      description: "",
      category: "listen",
      sort_order: 0,
      is_published: true,
    });
    setEditingPlaylist(null);
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
      playlist_id: audio.playlist_id || "",
    });
    setDialogOpen(true);
  };

  const handleEditPlaylist = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    setPlaylistFormData({
      title: playlist.title,
      description: playlist.description || "",
      category: playlist.category as Category,
      sort_order: playlist.sort_order,
      is_published: playlist.is_published,
    });
    setPlaylistDialogOpen(true);
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
      playlist_id: formData.playlist_id || null,
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
        fetchData();
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
        fetchData();
      }
    }
    setSaving(false);
  };

  const handlePlaylistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      title: playlistFormData.title,
      description: playlistFormData.description || null,
      category: playlistFormData.category,
      sort_order: playlistFormData.sort_order,
      is_published: playlistFormData.is_published,
    };

    if (editingPlaylist) {
      const { error } = await supabase
        .from("dars_playlists")
        .update(payload)
        .eq("id", editingPlaylist.id);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to update playlist",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Playlist updated successfully" });
        setPlaylistDialogOpen(false);
        resetPlaylistForm();
        fetchData();
      }
    } else {
      const { error } = await supabase.from("dars_playlists").insert(payload);

      if (error) {
        toast({
          title: "Error",
          description: "Failed to add playlist",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Playlist added successfully" });
        setPlaylistDialogOpen(false);
        resetPlaylistForm();
        fetchData();
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
      fetchData();
    }
  };

  const handleDeletePlaylist = async (id: string) => {
    if (!confirm("Are you sure you want to delete this playlist? Audio files will be unlinked but not deleted.")) return;

    const { error } = await supabase.from("dars_playlists").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete playlist",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Playlist deleted successfully" });
      fetchData();
    }
  };

  const filteredAudio =
    filterCategory === "all"
      ? audioList
      : audioList.filter((a) => a.category === filterCategory);

  const filteredPlaylists =
    filterCategory === "all"
      ? playlists
      : playlists.filter((p) => p.category === filterCategory);

  const getPlaylistName = (playlistId: string | null) => {
    if (!playlistId) return "-";
    const playlist = playlists.find((p) => p.id === playlistId);
    return playlist?.title || "-";
  };

  return (
    <AdminLayout title="Dars Audio">
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="audio" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="audio" className="flex items-center gap-2">
                <Music className="h-4 w-4" />
                Single Audio
              </TabsTrigger>
              <TabsTrigger value="playlists" className="flex items-center gap-2">
                <ListMusic className="h-4 w-4" />
                Playlists
              </TabsTrigger>
            </TabsList>

            {/* Single Audio Tab */}
            <TabsContent value="audio">
              <div className="flex justify-end mb-4">
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
                          <Label htmlFor="playlist">Playlist (Optional)</Label>
                          <Select
                            value={formData.playlist_id}
                            onValueChange={(value) =>
                              setFormData({ ...formData, playlist_id: value === "none" ? "" : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="No playlist" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No playlist</SelectItem>
                              {playlists.map((playlist) => (
                                <SelectItem key={playlist.id} value={playlist.id}>
                                  {playlist.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
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
                      <TableHead>Playlist</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
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
                          <TableCell className="text-muted-foreground">
                            {getPlaylistName(audio.playlist_id)}
                          </TableCell>
                          <TableCell>{audio.duration || "-"}</TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                audio.is_published
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {audio.is_published ? "Published" : "Draft"}
                            </span>
                          </TableCell>
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
            </TabsContent>

            {/* Playlists Tab */}
            <TabsContent value="playlists">
              <div className="flex justify-end mb-4">
                <Dialog
                  open={playlistDialogOpen}
                  onOpenChange={(open) => {
                    setPlaylistDialogOpen(open);
                    if (!open) resetPlaylistForm();
                  }}
                >
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Playlist
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>
                        {editingPlaylist ? "Edit Playlist" : "Add New Playlist"}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handlePlaylistSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="playlist_title">Title *</Label>
                        <Input
                          id="playlist_title"
                          value={playlistFormData.title}
                          onChange={(e) =>
                            setPlaylistFormData({ ...playlistFormData, title: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="playlist_description">Description</Label>
                        <Textarea
                          id="playlist_description"
                          value={playlistFormData.description}
                          onChange={(e) =>
                            setPlaylistFormData({ ...playlistFormData, description: e.target.value })
                          }
                          rows={2}
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="playlist_category">Category *</Label>
                          <Select
                            value={playlistFormData.category}
                            onValueChange={(value: Category) =>
                              setPlaylistFormData({ ...playlistFormData, category: value })
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
                          <Label htmlFor="playlist_sort_order">Sort Order</Label>
                          <Input
                            id="playlist_sort_order"
                            type="number"
                            value={playlistFormData.sort_order}
                            onChange={(e) =>
                              setPlaylistFormData({
                                ...playlistFormData,
                                sort_order: parseInt(e.target.value) || 0,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="playlist_is_published"
                          checked={playlistFormData.is_published}
                          onCheckedChange={(checked) =>
                            setPlaylistFormData({ ...playlistFormData, is_published: checked })
                          }
                        />
                        <Label htmlFor="playlist_is_published">Published</Label>
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setPlaylistDialogOpen(false);
                            resetPlaylistForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button type="submit" disabled={saving}>
                          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                          {editingPlaylist ? "Update" : "Add"} Playlist
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

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
                      <TableHead>Audio Count</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPlaylists.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          No playlists found. Add your first playlist.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPlaylists.map((playlist) => (
                        <TableRow key={playlist.id}>
                          <TableCell className="font-medium">{playlist.title}</TableCell>
                          <TableCell>
                            {categoryLabels[playlist.category as Category]}
                          </TableCell>
                          <TableCell>
                            {audioList.filter((a) => a.playlist_id === playlist.id).length}
                          </TableCell>
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                playlist.is_published
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                              }`}
                            >
                              {playlist.is_published ? "Published" : "Draft"}
                            </span>
                          </TableCell>
                          <TableCell>{playlist.sort_order}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditPlaylist(playlist)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeletePlaylist(playlist.id)}
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
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

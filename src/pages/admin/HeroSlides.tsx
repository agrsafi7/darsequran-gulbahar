import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash2, Loader2, GripVertical, ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface HeroSlide {
  id: string;
  image_url: string;
  heading: string | null;
  subtext: string | null;
  button1_text: string | null;
  button1_url: string | null;
  button2_text: string | null;
  button2_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export default function HeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<HeroSlide | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    image_url: "",
    heading: "",
    subtext: "",
    button1_text: "Explore Dars-e-Quran",
    button1_url: "/dars-e-quran",
    button2_text: "Learn More",
    button2_url: "/about",
    is_active: true,
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      const { data, error } = await supabase
        .from("hero_slides")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setSlides(data || []);
    } catch (error) {
      console.error("Error fetching slides:", error);
      toast({
        title: "Error",
        description: "Failed to load slides",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      image_url: "",
      heading: "",
      subtext: "",
      button1_text: "Explore Dars-e-Quran",
      button1_url: "/dars-e-quran",
      button2_text: "Learn More",
      button2_url: "/about",
      is_active: true,
    });
    setEditingSlide(null);
  };

  const handleEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setFormData({
      image_url: slide.image_url,
      heading: slide.heading || "",
      subtext: slide.subtext || "",
      button1_text: slide.button1_text || "Explore Dars-e-Quran",
      button1_url: slide.button1_url || "/dars-e-quran",
      button2_text: slide.button2_text || "Learn More",
      button2_url: slide.button2_url || "/about",
      is_active: slide.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this slide?")) return;

    try {
      const { error } = await supabase.from("hero_slides").delete().eq("id", id);

      if (error) throw error;

      toast({ title: "Success", description: "Slide deleted" });
      fetchSlides();
    } catch (error) {
      console.error("Error deleting slide:", error);
      toast({
        title: "Error",
        description: "Failed to delete slide",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (editingSlide) {
        const { error } = await supabase
          .from("hero_slides")
          .update({
            image_url: formData.image_url,
            heading: formData.heading || null,
            subtext: formData.subtext || null,
            button1_text: formData.button1_text || null,
            button1_url: formData.button1_url || null,
            button2_text: formData.button2_text || null,
            button2_url: formData.button2_url || null,
            is_active: formData.is_active,
          })
          .eq("id", editingSlide.id);

        if (error) throw error;
        toast({ title: "Success", description: "Slide updated" });
      } else {
        const maxOrder = slides.length > 0 
          ? Math.max(...slides.map(s => s.sort_order)) + 1 
          : 0;

        const { error } = await supabase.from("hero_slides").insert({
          image_url: formData.image_url,
          heading: formData.heading || null,
          subtext: formData.subtext || null,
          button1_text: formData.button1_text || null,
          button1_url: formData.button1_url || null,
          button2_text: formData.button2_text || null,
          button2_url: formData.button2_url || null,
          is_active: formData.is_active,
          sort_order: maxOrder,
        });

        if (error) throw error;
        toast({ title: "Success", description: "Slide created" });
      }

      setIsDialogOpen(false);
      resetForm();
      fetchSlides();
    } catch (error) {
      console.error("Error saving slide:", error);
      toast({
        title: "Error",
        description: "Failed to save slide",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (slide: HeroSlide) => {
    try {
      const { error } = await supabase
        .from("hero_slides")
        .update({ is_active: !slide.is_active })
        .eq("id", slide.id);

      if (error) throw error;
      fetchSlides();
    } catch (error) {
      console.error("Error toggling slide:", error);
      toast({
        title: "Error",
        description: "Failed to update slide",
        variant: "destructive",
      });
    }
  };

  const moveSlide = async (index: number, direction: "up" | "down") => {
    const newIndex = direction === "up" ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= slides.length) return;

    const newSlides = [...slides];
    [newSlides[index], newSlides[newIndex]] = [newSlides[newIndex], newSlides[index]];

    try {
      await Promise.all(
        newSlides.map((slide, i) =>
          supabase.from("hero_slides").update({ sort_order: i }).eq("id", slide.id)
        )
      );
      fetchSlides();
    } catch (error) {
      console.error("Error reordering slides:", error);
      toast({
        title: "Error",
        description: "Failed to reorder slides",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Hero Slides">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Hero Slider Management</CardTitle>
              <CardDescription>
                Manage the homepage hero carousel slides
              </CardDescription>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Slide
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                  <DialogTitle>
                    {editingSlide ? "Edit Slide" : "Add New Slide"}
                  </DialogTitle>
                  <DialogDescription>
                    Configure the hero slide content and image
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image_url">Image URL *</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use images from the Media Library or external URLs
                    </p>
                  </div>
                  
                  {formData.image_url && (
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={formData.image_url} 
                        alt="Preview" 
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="heading">Heading</Label>
                    <Input
                      id="heading"
                      value={formData.heading}
                      onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                      placeholder="Enter slide heading"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subtext">Subtext</Label>
                    <Textarea
                      id="subtext"
                      value={formData.subtext}
                      onChange={(e) => setFormData({ ...formData, subtext: e.target.value })}
                      placeholder="Enter slide subtext"
                      rows={3}
                    />
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <p className="text-sm font-medium mb-3">Button 1 (Primary)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="button1_text">Button Text</Label>
                        <Input
                          id="button1_text"
                          value={formData.button1_text}
                          onChange={(e) => setFormData({ ...formData, button1_text: e.target.value })}
                          placeholder="Explore Dars-e-Quran"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="button1_url">Button URL</Label>
                        <Input
                          id="button1_url"
                          value={formData.button1_url}
                          onChange={(e) => setFormData({ ...formData, button1_url: e.target.value })}
                          placeholder="/dars-e-quran"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-3">Button 2 (Secondary)</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="button2_text">Button Text</Label>
                        <Input
                          id="button2_text"
                          value={formData.button2_text}
                          onChange={(e) => setFormData({ ...formData, button2_text: e.target.value })}
                          placeholder="Learn More"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="button2_url">Button URL</Label>
                        <Input
                          id="button2_url"
                          value={formData.button2_url}
                          onChange={(e) => setFormData({ ...formData, button2_url: e.target.value })}
                          placeholder="/about"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>

                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {editingSlide ? "Update" : "Create"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : slides.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No slides yet. Add your first slide to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead className="w-24">Preview</TableHead>
                  <TableHead>Heading</TableHead>
                  <TableHead className="w-20">Status</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slides.map((slide, index) => (
                  <TableRow key={slide.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSlide(index, "up")}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6"
                          onClick={() => moveSlide(index, "down")}
                          disabled={index === slides.length - 1}
                        >
                          ↓
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <img
                        src={slide.image_url}
                        alt={slide.heading || "Slide"}
                        className="w-20 h-12 object-cover rounded"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.svg";
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{slide.heading || "(No heading)"}</p>
                        {slide.subtext && (
                          <p className="text-sm text-muted-foreground truncate max-w-xs">
                            {slide.subtext}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={slide.is_active}
                        onCheckedChange={() => toggleActive(slide)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(slide)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(slide.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
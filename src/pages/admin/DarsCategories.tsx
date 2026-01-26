import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Headphones, Download, FileAudio, BookOpen, Mic, Video } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DarsCategory {
  id: string;
  title: string;
  description: string | null;
  href: string;
  icon: string;
  sort_order: number;
  is_visible: boolean;
}

const iconOptions = [
  { value: "Headphones", label: "Headphones", icon: Headphones },
  { value: "Download", label: "Download", icon: Download },
  { value: "FileAudio", label: "File Audio", icon: FileAudio },
  { value: "BookOpen", label: "Book", icon: BookOpen },
  { value: "Mic", label: "Microphone", icon: Mic },
  { value: "Video", label: "Video", icon: Video },
];

const DarsCategories = () => {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<DarsCategory | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    href: "",
    icon: "Headphones",
    is_visible: true,
  });

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["dars-categories-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dars_categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return data as DarsCategory[];
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData & { id?: string }) => {
      if (data.id) {
        const { error } = await supabase
          .from("dars_categories")
          .update({
            title: data.title,
            description: data.description || null,
            href: data.href,
            icon: data.icon,
            is_visible: data.is_visible,
          })
          .eq("id", data.id);
        if (error) throw error;
      } else {
        const maxOrder = Math.max(0, ...categories.map((c) => c.sort_order));
        const { error } = await supabase.from("dars_categories").insert({
          title: data.title,
          description: data.description || null,
          href: data.href,
          icon: data.icon,
          is_visible: data.is_visible,
          sort_order: maxOrder + 1,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dars-categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["dars-categories"] });
      toast.success(editingCategory ? "Category updated" : "Category created");
      handleCloseDialog();
    },
    onError: (error) => {
      toast.error("Failed to save category: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("dars_categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["dars-categories-admin"] });
      queryClient.invalidateQueries({ queryKey: ["dars-categories"] });
      toast.success("Category deleted");
      setDeleteId(null);
    },
    onError: (error) => {
      toast.error("Failed to delete: " + error.message);
    },
  });

  const handleOpenDialog = (category?: DarsCategory) => {
    if (category) {
      setEditingCategory(category);
      setFormData({
        title: category.title,
        description: category.description || "",
        href: category.href,
        icon: category.icon,
        is_visible: category.is_visible,
      });
    } else {
      setEditingCategory(null);
      setFormData({
        title: "",
        description: "",
        href: "",
        icon: "Headphones",
        is_visible: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
    setFormData({
      title: "",
      description: "",
      href: "",
      icon: "Headphones",
      is_visible: true,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate({
      ...formData,
      id: editingCategory?.id,
    });
  };

  const getIconComponent = (iconName: string) => {
    const option = iconOptions.find((o) => o.value === iconName);
    return option ? option.icon : Headphones;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dars-e-Quran Categories</h1>
            <p className="text-muted-foreground">
              Manage the category cards shown on the Dars-e-Quran page
            </p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="h-24" />
              </Card>
            ))}
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No categories yet. Add your first one!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {categories.map((category) => {
              const IconComponent = getIconComponent(category.icon);
              return (
                <Card key={category.id} className={!category.is_visible ? "opacity-50" : ""}>
                  <CardContent className="py-4">
                    <div className="flex items-center gap-4">
                      <GripVertical className="w-5 h-5 text-muted-foreground cursor-move" />
                      <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
                        <IconComponent className="w-6 h-6 text-primary-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">{category.title}</h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {category.href}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleOpenDialog(category)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setDeleteId(category.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Listen Online Dars"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of this category"
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="href">Link URL</Label>
              <Input
                id="href"
                value={formData.href}
                onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                placeholder="/dars-e-quran/listen"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center gap-2">
                        <option.icon className="w-4 h-4" />
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_visible"
                checked={formData.is_visible}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, is_visible: checked })
                }
              />
              <Label htmlFor="is_visible">Visible on website</Label>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Category</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this category? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteMutation.mutate(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
};

export default DarsCategories;
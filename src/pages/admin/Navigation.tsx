import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Loader2, GripVertical, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface NavigationItem {
  id: string;
  title: string;
  url: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminNavigation() {
  const [items, setItems] = useState<NavigationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    url: "",
    parent_id: "",
    sort_order: 0,
    is_visible: true,
  });
  const { toast } = useToast();

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from("navigation_items")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching navigation items:", error);
      toast({ title: "Error", description: "Failed to fetch navigation", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const parentItems = items.filter((item) => !item.parent_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const itemData = {
        title: formData.title,
        url: formData.url,
        parent_id: formData.parent_id || null,
        sort_order: formData.sort_order,
        is_visible: formData.is_visible,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("navigation_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast({ title: "Success", description: "Navigation item updated" });
      } else {
        const { error } = await supabase.from("navigation_items").insert(itemData);

        if (error) throw error;
        toast({ title: "Success", description: "Navigation item created" });
      }

      setDialogOpen(false);
      resetForm();
      fetchItems();
    } catch (error: any) {
      console.error("Error saving navigation item:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save navigation item",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      url: item.url,
      parent_id: item.parent_id || "",
      sort_order: item.sort_order,
      is_visible: item.is_visible,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this navigation item? Child items will also be deleted.")) return;

    try {
      const { error } = await supabase.from("navigation_items").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Navigation item deleted" });
      fetchItems();
    } catch (error) {
      console.error("Error deleting navigation item:", error);
      toast({ title: "Error", description: "Failed to delete navigation item", variant: "destructive" });
    }
  };

  const toggleVisibility = async (id: string, currentVisibility: boolean) => {
    try {
      const { error } = await supabase
        .from("navigation_items")
        .update({ is_visible: !currentVisibility })
        .eq("id", id);

      if (error) throw error;
      fetchItems();
    } catch (error) {
      console.error("Error toggling visibility:", error);
      toast({ title: "Error", description: "Failed to update visibility", variant: "destructive" });
    }
  };

  const resetForm = () => {
    setEditingItem(null);
    setFormData({
      title: "",
      url: "",
      parent_id: "",
      sort_order: 0,
      is_visible: true,
    });
  };

  const getChildItems = (parentId: string) => {
    return items.filter((item) => item.parent_id === parentId);
  };

  const renderItem = (item: NavigationItem, isChild = false) => {
    const children = getChildItems(item.id);

    return (
      <>
        <TableRow key={item.id} className={isChild ? "bg-muted/30" : ""}>
          <TableCell>
            <div className="flex items-center gap-2">
              <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
              {isChild && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
              <span className={isChild ? "text-sm" : "font-medium"}>{item.title}</span>
            </div>
          </TableCell>
          <TableCell className="text-muted-foreground">{item.url}</TableCell>
          <TableCell>
            <Badge variant={item.is_visible ? "default" : "secondary"}>
              {item.is_visible ? "Visible" : "Hidden"}
            </Badge>
          </TableCell>
          <TableCell>{item.sort_order}</TableCell>
          <TableCell className="text-right">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => toggleVisibility(item.id, item.is_visible)}
            >
              {item.is_visible ? "👁" : "👁‍🗨"}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEdit(item)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(item.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </TableCell>
        </TableRow>
        {children.map((child) => renderItem(child, true))}
      </>
    );
  };

  return (
    <AdminLayout title="Navigation">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Manage Navigation Menu</CardTitle>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    value={formData.url}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, url: e.target.value }))
                    }
                    placeholder="/about or https://..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parent">Parent Item (optional)</Label>
                  <Select
                    value={formData.parent_id}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, parent_id: value === "none" ? "" : value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="No parent (top level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No parent (top level)</SelectItem>
                      {parentItems
                        .filter((item) => item.id !== editingItem?.id)
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.title}
                          </SelectItem>
                        ))}
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
                      setFormData((prev) => ({
                        ...prev,
                        sort_order: parseInt(e.target.value) || 0,
                      }))
                    }
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="is_visible"
                    checked={formData.is_visible}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, is_visible: checked }))
                    }
                  />
                  <Label htmlFor="is_visible">Visible on website</Label>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    {editingItem ? "Update" : "Create"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : items.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No navigation items yet. Add your first menu item!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>URL</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {parentItems.map((item) => renderItem(item))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

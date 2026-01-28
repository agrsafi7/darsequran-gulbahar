import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import { Plus, Pencil, Trash2, Loader2, Tags, ChevronRight, TreePine, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CategoryTree } from "@/components/admin/CategoryTree";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  parent_id: string | null;
  created_at: string;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<"tree" | "table">("tree");
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    parent_id: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("sort_order", { ascending: true });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch categories",
        variant: "destructive",
      });
    } else {
      setCategories(data || []);
    }
    setLoading(false);
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: editingCategory ? prev.slug : generateSlug(name),
    }));
  };

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      sort_order: 0,
      parent_id: "",
    });
    setEditingCategory(null);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      description: category.description || "",
      sort_order: category.sort_order,
      parent_id: category.parent_id || "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: formData.name,
      slug: formData.slug,
      description: formData.description || null,
      sort_order: formData.sort_order,
      parent_id: formData.parent_id || null,
    };

    if (editingCategory) {
      // Prevent setting parent to self or its own children
      if (formData.parent_id === editingCategory.id) {
        toast({
          title: "Error",
          description: "A category cannot be its own parent",
          variant: "destructive",
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from("categories")
        .update(payload)
        .eq("id", editingCategory.id);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update category",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Category updated successfully" });
        setDialogOpen(false);
        resetForm();
        fetchCategories();
      }
    } else {
      const { error } = await supabase.from("categories").insert(payload);

      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to add category",
          variant: "destructive",
        });
      } else {
        toast({ title: "Success", description: "Category added successfully" });
        setDialogOpen(false);
        resetForm();
        fetchCategories();
      }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    // Check if category has children
    const hasChildren = categories.some((c) => c.parent_id === id);
    if (hasChildren) {
      toast({
        title: "Cannot Delete",
        description: "This category has sub-categories. Please delete or move them first.",
        variant: "destructive",
      });
      return;
    }

    if (!confirm("Are you sure you want to delete this category?")) return;

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Category deleted successfully" });
      fetchCategories();
    }
  };

  // Build hierarchical structure for display
  const buildHierarchy = (categories: Category[]): CategoryWithChildren[] => {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // First pass: create all nodes
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Flatten hierarchy for table display with indentation info
  const flattenHierarchy = (
    nodes: CategoryWithChildren[],
    depth = 0
  ): { category: Category; depth: number }[] => {
    const result: { category: Category; depth: number }[] = [];
    nodes.forEach((node) => {
      result.push({ category: node, depth });
      if (node.children.length > 0) {
        result.push(...flattenHierarchy(node.children, depth + 1));
      }
    });
    return result;
  };

  const hierarchicalCategories = buildHierarchy(categories);
  const flatCategories = flattenHierarchy(hierarchicalCategories);

  // Get available parent categories (exclude self and children when editing)
  const getAvailableParents = () => {
    if (!editingCategory) return categories;
    
    // Get all descendant IDs
    const getDescendantIds = (parentId: string): string[] => {
      const children = categories.filter((c) => c.parent_id === parentId);
      return children.flatMap((c) => [c.id, ...getDescendantIds(c.id)]);
    };
    
    const excludeIds = new Set([editingCategory.id, ...getDescendantIds(editingCategory.id)]);
    return categories.filter((c) => !excludeIds.has(c.id));
  };

  const getParentName = (parentId: string | null) => {
    if (!parentId) return null;
    const parent = categories.find((c) => c.id === parentId);
    return parent?.name || null;
  };

  return (
    <AdminLayout title="Categories">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tags className="h-5 w-5" />
            Manage Categories
          </CardTitle>
          <div className="flex items-center gap-2">
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "tree" | "table")}>
              <TabsList className="h-9">
                <TabsTrigger value="tree" className="gap-1.5 px-3">
                  <TreePine className="h-4 w-4" />
                  Tree
                </TabsTrigger>
                <TabsTrigger value="table" className="gap-1.5 px-3">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
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
                  Add Category
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>
                    {editingCategory ? "Edit Category" : "Add New Category"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) =>
                        setFormData({ ...formData, slug: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parent_id">Parent Category</Label>
                    <Select
                      value={formData.parent_id}
                      onValueChange={(value) =>
                        setFormData({ ...formData, parent_id: value === "none" ? "" : value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="None (Top Level)" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Top Level)</SelectItem>
                        {getAvailableParents().map((cat) => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Select a parent to nest this category under another
                    </p>
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
                      {editingCategory ? "Update" : "Add"} Category
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
          ) : viewMode === "tree" ? (
            <CategoryTree
              categories={categories}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Parent</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {flatCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No categories found. Add your first category.
                    </TableCell>
                  </TableRow>
                ) : (
                  flatCategories.map(({ category, depth }) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-1">
                          {depth > 0 && (
                            <span 
                              className="text-muted-foreground"
                              style={{ marginLeft: `${depth * 20}px` }}
                            >
                              <ChevronRight className="h-4 w-4 inline" />
                            </span>
                          )}
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {category.slug}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getParentName(category.parent_id) || "-"}
                      </TableCell>
                      <TableCell>{category.sort_order}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(category)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(category.id)}
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

import { useState } from "react";
import { ChevronRight, ChevronDown, Pencil, Trash2, FolderOpen, Folder } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  sort_order: number;
  parent_id: string | null;
}

interface CategoryWithChildren extends Category {
  children: CategoryWithChildren[];
}

interface CategoryTreeProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
}

interface CategoryNodeProps {
  node: CategoryWithChildren;
  depth: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  hasChildren: boolean;
}

function CategoryNode({ node, depth, onEdit, onDelete, hasChildren }: CategoryNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="animate-fade-in">
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-colors hover:bg-muted/50 group",
          depth > 0 && "ml-6 border-l-2 border-border"
        )}
        style={{ marginLeft: depth > 0 ? `${depth * 24}px` : 0 }}
      >
        {/* Expand/Collapse toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "p-1 rounded hover:bg-muted transition-colors",
            !hasChildren && "invisible"
          )}
          disabled={!hasChildren}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {/* Folder icon */}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="h-4 w-4 text-primary" />
          ) : (
            <Folder className="h-4 w-4 text-primary" />
          )
        ) : (
          <div className="w-4" />
        )}

        {/* Category info */}
        <div className="flex-1 min-w-0">
          <span className="font-medium text-foreground">{node.name}</span>
          <span className="text-xs text-muted-foreground ml-2">/{node.slug}</span>
        </div>

        {/* Sort order badge */}
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
          #{node.sort_order}
        </span>

        {/* Action buttons */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onEdit(node)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onDelete(node.id)}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className="animate-accordion-down">
          {node.children.map((child) => (
            <CategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              hasChildren={child.children.length > 0}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function CategoryTree({ categories, onEdit, onDelete }: CategoryTreeProps) {
  // Build hierarchical structure
  const buildHierarchy = (items: Category[]): CategoryWithChildren[] => {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // First pass: create all nodes
    items.forEach((cat) => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Second pass: build tree
    items.forEach((cat) => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Sort children by sort_order
    const sortChildren = (nodes: CategoryWithChildren[]) => {
      nodes.sort((a, b) => a.sort_order - b.sort_order);
      nodes.forEach((node) => sortChildren(node.children));
    };
    sortChildren(roots);

    return roots;
  };

  const hierarchicalCategories = buildHierarchy(categories);

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found. Add your first category.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {hierarchicalCategories.map((node) => (
        <CategoryNode
          key={node.id}
          node={node}
          depth={0}
          onEdit={onEdit}
          onDelete={onDelete}
          hasChildren={node.children.length > 0}
        />
      ))}
    </div>
  );
}

import { useState, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ChevronRight, ChevronDown, Pencil, Trash2, FolderOpen, Folder, GripVertical } from "lucide-react";
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
  onReorder?: (categoryId: string, newParentId: string | null, newSortOrder: number) => void;
}

interface SortableCategoryNodeProps {
  node: CategoryWithChildren;
  depth: number;
  onEdit: (category: Category) => void;
  onDelete: (id: string) => void;
  hasChildren: boolean;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

function SortableCategoryNode({ 
  node, 
  depth, 
  onEdit, 
  onDelete, 
  hasChildren,
  expandedIds,
  toggleExpand 
}: SortableCategoryNodeProps) {
  const isExpanded = expandedIds.has(node.id);
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: node.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <div
        className={cn(
          "flex items-center gap-2 py-2 px-3 rounded-lg transition-colors hover:bg-muted/50 group",
          isDragging && "opacity-50 bg-muted",
          depth > 0 && "border-l-2 border-border"
        )}
        style={{ marginLeft: depth > 0 ? `${depth * 24}px` : 0 }}
      >
        {/* Drag handle */}
        <button
          className="p-1 rounded hover:bg-muted cursor-grab active:cursor-grabbing touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </button>

        {/* Expand/Collapse toggle */}
        <button
          onClick={() => toggleExpand(node.id)}
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
            <SortableCategoryNode
              key={child.id}
              node={child}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
              hasChildren={child.children.length > 0}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function DragOverlayContent({ node }: { node: CategoryWithChildren }) {
  return (
    <div className="flex items-center gap-2 py-2 px-3 rounded-lg bg-card border border-primary shadow-lg">
      <GripVertical className="h-4 w-4 text-muted-foreground" />
      <Folder className="h-4 w-4 text-primary" />
      <span className="font-medium text-foreground">{node.name}</span>
    </div>
  );
}

export function CategoryTree({ categories, onEdit, onDelete, onReorder }: CategoryTreeProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set(categories.map(c => c.id)));

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const toggleExpand = (id: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

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

  const hierarchicalCategories = useMemo(() => buildHierarchy(categories), [categories]);
  
  // Flatten for sortable context
  const flattenForSortable = (nodes: CategoryWithChildren[]): string[] => {
    const result: string[] = [];
    const traverse = (items: CategoryWithChildren[]) => {
      items.forEach(node => {
        result.push(node.id);
        if (expandedIds.has(node.id) && node.children.length > 0) {
          traverse(node.children);
        }
      });
    };
    traverse(nodes);
    return result;
  };

  const sortableIds = useMemo(
    () => flattenForSortable(hierarchicalCategories),
    [hierarchicalCategories, expandedIds]
  );

  const findNode = (id: string): CategoryWithChildren | null => {
    const search = (nodes: CategoryWithChildren[]): CategoryWithChildren | null => {
      for (const node of nodes) {
        if (node.id === id) return node;
        const found = search(node.children);
        if (found) return found;
      }
      return null;
    };
    return search(hierarchicalCategories);
  };

  const activeNode = activeId ? findNode(activeId) : null;

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || active.id === over.id || !onReorder) return;

    const activeCategory = categories.find(c => c.id === active.id);
    const overCategory = categories.find(c => c.id === over.id);

    if (!activeCategory || !overCategory) return;

    // Determine new parent and sort order
    const newParentId = overCategory.parent_id;
    
    // Get siblings at the same level
    const siblings = categories.filter(c => c.parent_id === newParentId);
    const overIndex = siblings.findIndex(c => c.id === over.id);
    
    // Calculate new sort order
    let newSortOrder: number;
    if (overIndex === 0) {
      newSortOrder = siblings[0].sort_order - 1;
    } else if (overIndex === siblings.length - 1) {
      newSortOrder = siblings[siblings.length - 1].sort_order + 1;
    } else {
      const before = siblings[overIndex - 1];
      const after = siblings[overIndex];
      newSortOrder = Math.floor((before.sort_order + after.sort_order) / 2);
    }

    onReorder(active.id as string, newParentId, newSortOrder);
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No categories found. Add your first category.
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={sortableIds} strategy={verticalListSortingStrategy}>
        <div className="space-y-1">
          {hierarchicalCategories.map((node) => (
            <SortableCategoryNode
              key={node.id}
              node={node}
              depth={0}
              onEdit={onEdit}
              onDelete={onDelete}
              hasChildren={node.children.length > 0}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      </SortableContext>
      
      <DragOverlay>
        {activeNode ? <DragOverlayContent node={activeNode} /> : null}
      </DragOverlay>
    </DndContext>
  );
}

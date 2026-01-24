import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Check, X, Trash2, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Comment {
  id: string;
  post_id: string;
  parent_id: string | null;
  author_name: string;
  author_email: string;
  content: string;
  status: string;
  created_at: string;
  posts?: { title: string } | null;
}

export default function AdminComments() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");
  const { toast } = useToast();

  const fetchComments = async () => {
    try {
      let query = supabase
        .from("comments")
        .select(`*, posts(title)`)
        .order("created_at", { ascending: false });

      if (filter !== "all") {
        query = query.eq("status", filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast({ title: "Error", description: "Failed to fetch comments", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [filter]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const { error } = await supabase
        .from("comments")
        .update({ status })
        .eq("id", id);

      if (error) throw error;
      toast({ title: "Success", description: `Comment ${status}` });
      fetchComments();
    } catch (error) {
      console.error("Error updating comment:", error);
      toast({ title: "Error", description: "Failed to update comment", variant: "destructive" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this comment?")) return;

    try {
      const { error } = await supabase.from("comments").delete().eq("id", id);
      if (error) throw error;
      toast({ title: "Success", description: "Comment deleted" });
      fetchComments();
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast({ title: "Error", description: "Failed to delete comment", variant: "destructive" });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      approved: "default",
      pending: "outline",
      spam: "destructive",
      deleted: "secondary",
    };
    return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
  };

  const pendingCount = comments.filter((c) => c.status === "pending").length;

  return (
    <AdminLayout title="Comments">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-4">
            <CardTitle>Moderate Comments</CardTitle>
            {pendingCount > 0 && (
              <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                {pendingCount} pending
              </Badge>
            )}
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Comments</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="spam">Spam</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === "all"
                  ? "No comments yet."
                  : `No ${filter} comments.`}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Author</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Post</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comments.map((comment) => (
                  <TableRow key={comment.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{comment.author_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {comment.author_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="truncate" title={comment.content}>
                        {comment.content}
                      </p>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {comment.posts?.title || "Unknown"}
                    </TableCell>
                    <TableCell>{getStatusBadge(comment.status)}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      {comment.status !== "approved" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus(comment.id, "approved")}
                          title="Approve"
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                      )}
                      {comment.status !== "spam" && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => updateStatus(comment.id, "spam")}
                          title="Mark as spam"
                        >
                          <X className="h-4 w-4 text-yellow-600" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(comment.id)}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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

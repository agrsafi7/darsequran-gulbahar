import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";

export default function AdminUsers() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-existing-profiles"],
    queryFn: async () => {
      const result = await supabase.from("profiles").select("id, display_name, created_at").order("created_at", { ascending: false });
      if (result.error) throw result.error;
      return result.data;
    },
  });
  return <AdminLayout title="Users">
    <section className="border border-border bg-card">
      <h2 className="admin-panel-heading">Users</h2>
      {isLoading ? <Loader2 className="m-6 h-5 w-5 animate-spin" /> : error ? <p role="alert" className="p-6 text-destructive">Unable to load existing users.</p> :
        <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Joined</TableHead></TableRow></TableHeader>
          <TableBody>{data?.map(profile => <TableRow key={profile.id}><TableCell>{profile.display_name || "—"}</TableCell><TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell></TableRow>)}
            {!data?.length && <TableRow><TableCell colSpan={2}>No user profiles found.</TableCell></TableRow>}
          </TableBody></Table>}
    </section>
  </AdminLayout>;
}
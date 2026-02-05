import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PostCreator } from "@/components/post-creator";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/auth/login");
  }

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 ">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <PostCreator />
    </div>
  );
}

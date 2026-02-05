import { PostCreator } from "@/components/post-creator";

export default function DashboardPage() {
  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Create Post</h1>
      <PostCreator />
    </div>
  );
}

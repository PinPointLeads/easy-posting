"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandVoice, setBrandVoice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const supabase = createClient();

  // Load existing settings on mount
  useEffect(() => {
    async function loadSettings() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("brand_settings")
        .select("business_name, industry, brand_voice")
        .eq("customer_id", user.id)
        .single();

      if (data) {
        setBusinessName(data.business_name || "");
        setIndustry(data.industry || "");
        setBrandVoice(data.brand_voice || "");
      }
      setIsLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setMessage({ type: "error", text: "You must be logged in to save settings" });
      setIsSaving(false);
      return;
    }

    const { error } = await supabase
      .from("brand_settings")
      .upsert({
        customer_id: user.id,
        business_name: businessName,
        industry: industry,
        brand_voice: brandVoice,
      }, { onConflict: "customer_id" });

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Settings saved successfully!" });
    }
    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="businessName">Business Name</Label>
          <Input
            id="businessName"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Your business name"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Restaurant, Retail, Fitness"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="brandVoice">Brand Voice</Label>
          <textarea
            id="brandVoice"
            value={brandVoice}
            onChange={(e) => setBrandVoice(e.target.value)}
            placeholder="Describe how your brand communicates. For example: 'Friendly and casual, uses humor, speaks directly to customers like a neighbor would. Avoids corporate jargon.'"
            rows={6}
            className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
          />
        </div>

        {message && (
          <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
            {message.text}
          </p>
        )}

        <Button onClick={handleSave} size="lg" className="w-full mt-2" disabled={isSaving || isLoading}>
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

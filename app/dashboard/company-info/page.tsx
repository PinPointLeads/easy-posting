"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export default function CompanyInfoPage() {
  const [fullname, setFullName] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [website, setWebsite] = useState("");
  const [serviceArea, setServiceArea] = useState("");
  const [industry, setIndustry] = useState("");
  const [postStyle, setPostStyle] = useState<string[]>([]);

  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const supabase = createClient();

  const togglePostStyle = (value: string) => {
    setPostStyle((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value],
    );
  };

  useEffect(() => {
    async function loadSettings() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setIsLoading(false);
        return;
      }

      const { data } = await supabase
        .from("brand_settings")
        .select(
          "fullname, business_name, website, service_area, industry, post_style",
        )
        .eq("customer_id", user.id)
        .single();

      if (data) {
        setFullName(data.fullname || "");
        setBusinessName(data.business_name || "");
        setWebsite(data.website || "");
        setServiceArea(data.service_area || "");
        setIndustry(data.industry || "");
        setPostStyle(data.post_style || []);
      }

      setIsLoading(false);
    }

    loadSettings();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage({
        type: "error",
        text: "You must be logged in to save settings",
      });
      setIsSaving(false);
      return;
    }

    const { error } = await supabase.from("brand_settings").upsert(
      {
        customer_id: user.id,
        fullname: fullname,
        business_name: businessName,
        website: website,
        service_area: serviceArea,
        industry: industry,
        post_style: postStyle,
      },
      { onConflict: "customer_id" },
    );

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({
        type: "success",
        text: "Company info saved successfully!",
      });
    }

    setIsSaving(false);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Company Info</h1>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <Label htmlFor="fullname">Name</Label>
          <Input
            id="fullname"
            value={fullname}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Smith"
          />
        </div>

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
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="www.example.com"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="serviceArea">Service Area</Label>
          <Input
            id="serviceArea"
            value={serviceArea}
            onChange={(e) => setServiceArea(e.target.value)}
            placeholder="e.g. Manchester & surrounding areas"
          />
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="e.g. Fencing, Paving, Landscaping"
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-sm font-medium mb-2">Post Style</span>

          {[
            { id: "humor", label: "A bit of humor" },
            { id: "professional", label: "Professional" },
            { id: "friendly", label: "Friendly" },
            { id: "short", label: "Short and sweet" },
            { id: "promotional", label: "Promotional" },
          ].map((style) => (
            <label key={style.id} className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={postStyle.includes(style.id)}
                onChange={() => togglePostStyle(style.id)}
              />
              {style.label}
            </label>
          ))}
        </div>

        {message && (
          <p
            className={`text-sm ${
              message.type === "error" ? "text-red-500" : "text-green-500"
            }`}
          >
            {message.text}
          </p>
        )}

        <Button
          onClick={handleSave}
          size="lg"
          className="w-full mt-2"
          disabled={isSaving || isLoading}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </Button>
      </div>
    </div>
  );
}

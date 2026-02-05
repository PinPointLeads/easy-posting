"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SettingsPage() {
  const [businessName, setBusinessName] = useState("");
  const [industry, setIndustry] = useState("");
  const [brandVoice, setBrandVoice] = useState("");

  const handleSave = () => {
    console.log({
      businessName,
      industry,
      brandVoice,
    });
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

        <Button onClick={handleSave} size="lg" className="w-full mt-2">
          Save Settings
        </Button>
      </div>
    </div>
  );
}

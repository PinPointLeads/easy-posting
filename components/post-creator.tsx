"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function PostCreator() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const supabase = createClient();

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      setMessage({ type: "error", text: "Could not access microphone. Please allow microphone access." });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const removeAudio = () => {
    setAudioBlob(null);
    setAudioUrl(null);
  };

  // Submit post
  const handleSubmit = async () => {
    if (!image) {
      setMessage({ type: "error", text: "Please select an image" });
      return;
    }

    if (!caption && !audioBlob) {
      setMessage({ type: "error", text: "Please add a caption or record a voice note" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload image to Supabase Storage
      const imageExt = image.name.split(".").pop();
      const imagePath = `${user.id}/${Date.now()}.${imageExt}`;

      const { error: imageError } = await supabase.storage
        .from("post-media")
        .upload(imagePath, image);

      if (imageError) throw imageError;

      // Upload voice note if exists
      let voicePath = null;
      if (audioBlob) {
        voicePath = `${user.id}/${Date.now()}.webm`;

        const { error: voiceError } = await supabase.storage
          .from("voice-notes")
          .upload(voicePath, audioBlob);

        if (voiceError) throw voiceError;
      }

      // Insert into posts table
      const { error: insertError } = await supabase
        .from("posts")
        .insert({
          customer_id: user.id,
          image_path: imagePath,
          voice_path: voicePath,
          user_prompt: caption || null,
          status: "processing",
        });

      if (insertError) throw insertError;

      // TODO: Send webhook to n8n here
      // await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL, { ... })

      setMessage({ type: "success", text: "Post submitted successfully! It will be published shortly." });

      // Reset form
      setImage(null);
      setImagePreview(null);
      setCaption("");
      setAudioBlob(null);
      setAudioUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to submit post"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Image Upload */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="image">Image</Label>
        <input
          ref={fileInputRef}
          id="image"
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />

        {imagePreview ? (
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full max-h-64 object-cover rounded-lg"
            />
            <Button
              variant="destructive"
              size="sm"
              onClick={removeImage}
              className="absolute top-2 right-2"
            >
              Remove
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="h-32 border-dashed"
          >
            Tap to select image
          </Button>
        )}
      </div>

      {/* Voice Recording */}
      <div className="flex flex-col gap-2">
        <Label>Voice Note (optional)</Label>

        {audioUrl ? (
          <div className="flex items-center gap-2">
            <audio src={audioUrl} controls className="flex-1" />
            <Button variant="destructive" size="sm" onClick={removeAudio}>
              Remove
            </Button>
          </div>
        ) : (
          <Button
            variant={isRecording ? "destructive" : "outline"}
            onClick={isRecording ? stopRecording : startRecording}
          >
            {isRecording ? "Stop Recording" : "Record Voice Note"}
          </Button>
        )}
      </div>

      {/* Caption */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="caption">Caption {audioBlob ? "(optional)" : ""}</Label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write your caption here... AI will optimize it for each platform."
          rows={4}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm resize-none"
        />
      </div>

      {/* Info text */}
      <p className="text-sm text-muted-foreground">
        Your post will be optimized for Facebook, Instagram, LinkedIn, and Google Business Profile.
      </p>

      {/* Status message */}
      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-500"}`}>
          {message.text}
        </p>
      )}

      {/* Submit button */}
      <Button
        onClick={handleSubmit}
        size="lg"
        className="w-full"
        disabled={isSubmitting || !image}
      >
        {isSubmitting ? "Submitting..." : "Create Post"}
      </Button>
    </div>
  );
}

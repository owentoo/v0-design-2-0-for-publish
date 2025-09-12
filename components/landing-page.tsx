"use client";

import type React from "react";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { TopNavBar } from "@/components/ui/top-nav-bar";
import ColorThief from "colorthief";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { Upload, Sparkles, Type, Loader2, ArrowUp } from "lucide-react";
import { ProductCarousel } from "./product-carousel";

interface Product {
  id: number;
  name: string;
  image: string;
  handle: string;
}

interface GeneratedImage {
  id: number;
  url: string;
  prompt: string;
  isLoading?: boolean;
  // server meta (optional)
  fileName?: string;
  autoBgRemove?: boolean;
}

export function LandingPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [showOptions, setShowOptions] = useState(false);
  const [showAIPrompt, setShowAIPrompt] = useState(false);
  const [showAILoading, setShowAILoading] = useState(false);
  const [showAIResults, setShowAIResults] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const products: Product[] = [
    { id: 1, name: "T-Shirt", image: "/white-t-shirt.png", handle: "https://www.rushordertees.com/design/?method=scr&item=11565&designTemplate=NTUyMTM2Mw" },
    { id: 2, name: "Hoodie", image: "/transparent-hoodie.png", handle: "https://www.rushordertees.com/design/?method=scr&item=804&designTemplate=NTUyMTM2Mw" },
    { id: 3, name: "Tank Top", image: "/brown-tank-top.png", handle: "https://www.rushordertees.com/design/?method=scr&item=1872&designTemplate=NTUyMTM2Mw" },
    { id: 4, name: "Long Sleeve", image: "/navy-long-sleeve.png", handle: "https://www.rushordertees.com/design/?method=scr&item=817&designTemplate=NTUyMTM2Mw" },
    { id: 5, name: "Polo Shirt", image: "/golden-polo-shirt.png", handle: "https://www.rushordertees.com/design/?method=scr&item=7741&designTemplate=NTUyMTM2Mw" },
    { id: 6, name: "V-Neck", image: "/green-v-neck.png", handle: "https://www.rushordertees.com/design/?method=scr&item=1164&designTemplate=NTUyMTM2Mw" },
    { id: 7, name: "Baseball Tee", image: "/gray-navy-baseball-tee.png", handle: "https://www.rushordertees.com/design/?method=scr&item=1925&designTemplate=NTUyMTM2Mw" },
    { id: 8, name: "Hat", image: "/burgundy-hat.png", handle: "https://www.rushordertees.com/design/?method=scr&item=9373&designTemplate=NTUyMTM2Mw" },
    { id: 9, name: "Sweatshirt", image: "/royal-blue-sweatshirt.png", handle: "https://www.rushordertees.com/design/?method=scr&item=11565&designTemplate=NTUyMTM2Mw" },
    { id: 10, name: "Zip Hoodie", image: "/orange-zip-hoodie.png", handle: "https://www.rushordertees.com/design/?method=scr&item=806&designTemplate=NTUyMTM2Mw" },
    { id: 11, name: "Long Sleeve Polo", image: "/forest-green-long-sleeve-polo.png", handle: "https://www.rushordertees.com/design/?method=scr&item=9944&designTemplate=NTUyMTM2Mw" },
    { id: 12, name: "Tote Bag", image: "/natural-canvas-tote-bag.png", handle: "https://www.rushordertees.com/design/?method=scr&item=9347&designTemplate=NTUyMTM2Mw" },
  ];

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setShowOptions(true);
  };

  const handleNavigation = (option: "upload" | "ai" | "text") => {
    switch (option) {
      case "upload":
        fileInputRef.current?.click();
        break;
      case "ai":
        setShowAIPrompt(true);
        break;
      case "text":
        window.location.href = "https://www.rushordertees.com/design/";
        break;
    }
  };

  const handleBackToProducts = () => {
    setShowOptions(false);
    setSelectedProduct(null);
  };

  /** Upload any Blob/File using multipart/form-data */
  async function uploadBinaryAndRedirect(blob: Blob, fileName: string) {
    if (!selectedProduct?.handle) return;
    setIsUploading(true);
    try {
      const form = new FormData();
      // server expects "uploaded"
      form.append("uploaded", blob, fileName);

      const res = await fetch("https://www.rushordertees.com/design-v2/upload.php", {
        method: "POST",
        body: form,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const text = await res.text();
      const doc = new DOMParser().parseFromString(text.trim(), "application/xml");
      if (doc.getElementsByTagName("parsererror").length) {
        throw new Error("Invalid XML in response");
      }
      const uploadedFileName = doc.getElementsByTagName("fileName")[0]?.textContent?.trim() || "";

      // In-place navigation — will remain inside RN WebView
      window.location.href =
        selectedProduct.handle +
        `&uploadFileName=${uploadedFileName}&uploadRemoveBackground=true`;
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  }

  /** User picks an image via file input (camera/gallery) */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    await uploadBinaryAndRedirect(file, file.name);
  };

  /** Generate via AI (unchanged API), then let user tap "Use Design" */
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setIsGenerating(true);
    setShowAILoading(true);
    setShowAIPrompt(false);
    setProgress(0);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev < 20) return Math.min(prev + 4, 20);
        if (prev < 70) return Math.min(prev + 2, 70);
        if (prev < 95) return Math.min(prev + 1, 95);
        return prev;
      });
    }, 200);
    setProgressTimer(timer);

    const startIndex = generatedImages.length;
    const placeholders: GeneratedImage[] = Array.from({ length: 3 }, (_, i) => ({
      id: startIndex + i + 1,
      url: "",
      prompt: aiPrompt,
      isLoading: true,
    }));
    setGeneratedImages((prev) => [...prev, ...placeholders]);

    try {
      const imagePromises = Array.from({ length: 3 }, async (_, idx) => {
        try {
          const response = await fetch(
            "https://www.rushordertees.com/design-v2/studio/postBatchGenerativeAiUpload.php",
            {
              method: "POST",
              body: JSON.stringify({
                prompt: aiPrompt,
                batchSize: 1,
                brandingName: "rushordertees.com",
              }),
            }
          );
          if (!response.ok) throw new Error("AI generation failed");
          const data = await response.json();
          const imgData = data?.[0];
          const imageId = startIndex + idx + 1;
          setGeneratedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    url: imgData?.url || "",
                    fileName: imgData?.fileName,
                    autoBgRemove: imgData?.autoBgRemove,
                    isLoading: false,
                  }
                : img
            )
          );
          return { success: true };
        } catch (e) {
          const imageId = startIndex + idx + 1;
          setGeneratedImages((prev) =>
            prev.map((img) =>
              img.id === imageId
                ? {
                    ...img,
                    url: `/placeholder.svg?height=300&width=300&query=${encodeURIComponent(
                      aiPrompt
                    )}`,
                    isLoading: false,
                  }
                : img
            )
          );
          return { success: false };
        }
      });

      await Promise.allSettled(imagePromises);
      setGenerationCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error in AI generation process:", error);
    } finally {
      if (progressTimer) {
        clearInterval(progressTimer);
        setProgressTimer(null);
      }
      setProgress(100);
      setTimeout(() => {
        setIsGenerating(false);
        setShowAILoading(false);
        setShowAIResults(true);
      }, 300);
    }
  };

  /** When user taps "Use Design" on an AI image — fetch Blob, upload, redirect */
  const handleUseDesign = async (image: GeneratedImage) => {
    if (!image?.url) return;
    try {
      setIsUploading(true);
      const res = await fetch(image.url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();

      // derive a filename from response headers or URL
      let fileName = image.fileName || "image.png";
      const cd = res.headers.get("content-disposition");
      if (cd) {
        const m = /filename\*?=(?:UTF-8''|")?([^\";]+)/i.exec(cd);
        if (m) fileName = decodeURIComponent(m[1].replace(/"/g, "").trim());
      } else {
        const u = new URL(image.url);
        const tail = u.pathname.split("/").pop();
        if (tail) fileName = tail;
      }

      await uploadBinaryAndRedirect(blob, fileName);
    } catch (e) {
      console.error("Use design failed:", e);
      alert("Failed to use this design. Please try another.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleBackToOptions = () => {
    setShowAIPrompt(false);
    setShowAIResults(false);
    setShowAILoading(false);
    setAiPrompt("");
    setGeneratedImages([]);
    setGenerationCount(0);
  };

  const shouldShowTopNav = !showAILoading;
  const shouldShowBackButton = showOptions || showAIPrompt || showAILoading || showAIResults;

  return (
    <div>
      <div className="min-h-screen bg-gradient-to-br from-blue-800 via-purple-900 to-pink-800">

        {/* Upload overlay */}
        {isUploading && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-12 h-12 text-white animate-spin" />
              <p className="text-white text-lg font-semibold">Uploading your design...</p>
            </div>
          </div>
        )}

        {shouldShowTopNav && (
          <TopNavBar
            showBackButton={shouldShowBackButton}
            onBackClick={() => {
              if (showAIResults) {
                setShowAIResults(false);
                setShowAIPrompt(true);
              } else if (showAILoading) {
                setShowAILoading(false);
                setShowAIPrompt(true);
                setIsGenerating(false);
              } else if (showAIPrompt) {
                handleBackToOptions();
              } else if (showOptions) {
                handleBackToProducts();
              }
            }}
            title={
              showAIResults ? "AI Results" :
              showAILoading ? "AI Loading" :
              showAIPrompt ? "Create With AI" :
              showOptions ? "Design Options" : "Select Product"
            }
          />
        )}

        {/* IMPORTANT: prefer rear camera on mobile */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />

        {/* ----- AI Prompt, Loading, Results, Product grid ... keep your existing UI (unchanged) ----- */}
        {/* The rest of your UI (prompt, carousel, cards) can remain as in your current file */}
        {/* For brevity, not re-pasting that markup; only upload-related logic changed */}
        {/* ... paste the rest of your JSX from your current file here ... */}
      </div>
    </div>
  );
}
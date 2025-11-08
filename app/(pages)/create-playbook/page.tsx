"use client";

import { useState } from "react";
import { UploadZone } from "@/components/upload-zone";
import { ThinkingAnimation } from "@/components/thinking-animation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap } from "lucide-react";
// import { extractClausesFromUrl } from "@/lib/api"; // No longer needed
import type { Clause } from "@/lib/api";

export default function CreatePlaybookPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [clauses, setClauses] = useState<Clause[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setClauses([]);

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      // 1. Upload files to get public URLs
      const uploadResponse = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error("File upload failed");
      }

      const { publicUrls } = await uploadResponse.json();
      const pdfUrl = publicUrls[0]; // Assuming one file upload for now

      // 2. Call the new API route to process PDF, generate clauses with IDs, and save the playbook
      const processAndStoreResponse = await fetch("/api/process-and-store-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pdfUrl, playbookName: "My New Playbook" }), // You can make the playbook name dynamic
      });

      if (!processAndStoreResponse.ok) {
        throw new Error("Failed to process PDF and create playbook");
      }

      const newPlaybook = await processAndStoreResponse.json();
      setClauses(newPlaybook.clauses);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // savePlaybook function is removed as its functionality is now integrated into /api/process-and-store-pdf

  return (
    <main className="min-h-screen bg-background text-foreground p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-12">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-gemini-text">Create your playbook</span>
            </h1>
          </div>
          <p className="text-muted-foreground text-lg max-w-2xl">
            Upload your gold-standard contracts to create a playbook of your preferred clauses.
          </p>
        </div>

        <div className="rounded-xl bg-card/50 border border-border p-8">
          <h2 className="text-xl font-semibold text-foreground mb-6">Upload Documents</h2>
          <UploadZone onFilesSelected={handleFilesSelected} isLoading={isLoading} />
        </div>

        {isLoading && (
          <div className="rounded-xl bg-card/50 border border-border p-8">
            <ThinkingAnimation isVisible={true} />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive text-destructive p-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {clauses.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Extracted Clauses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {clauses.map((clause, index) => (
                <div key={index} className="p-4 border rounded-lg bg-background">
                  <p className="text-sm font-bold text-primary">{clause.clause_type}</p>
                  <p className="mt-1">{clause.clause_text}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}

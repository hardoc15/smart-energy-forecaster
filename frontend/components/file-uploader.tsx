"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, FileType, X, Loader2 } from 'lucide-react';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  isLoading: boolean;
}

export default function FileUploader({ onFileUpload, isLoading }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      handleFile(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleFile(file);
    }
  };

  const handleFile = (file: File) => {
    // Check if file is CSV, Excel, or JSON
    const validTypes = [
      "text/csv", 
      "application/vnd.ms-excel", 
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/json"
    ];
    
    if (!validTypes.includes(file.type)) {
      alert("Please upload a CSV, Excel, or JSON file");
      return;
    }
    
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const uploadFile = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes("csv")) return "CSV";
    if (fileType.includes("excel") || fileType.includes("spreadsheet")) return "XLS";
    if (fileType.includes("json")) return "JSON";
    return "FILE";
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          dragActive ? "border-primary bg-primary/5" : "border-gray-300"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Input
          ref={inputRef}
          type="file"
          accept=".csv,.xls,.xlsx,.json"
          onChange={handleChange}
          className="hidden"
          id="file-upload"
        />
        
        <div className="flex flex-col items-center justify-center space-y-4">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-lg font-medium">Drag and drop your file here</p>
            <p className="text-sm text-gray-500">or</p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => inputRef.current?.click()}
            disabled={isLoading}
          >
            Browse Files
          </Button>
          <p className="text-xs text-gray-500">
            Supported formats: CSV, Excel, JSON
          </p>
        </div>
      </div>

      {selectedFile && (
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex h-10 w-10 items-center justify-center rounded bg-gray-100">
                <FileType className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-xs text-gray-500">
                  {getFileIcon(selectedFile.type)} • {(selectedFile.size / 1024).toFixed(2)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={removeFile} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-4">
            <Button 
              className="w-full" 
              onClick={uploadFile} 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                "Upload File"
              )}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}

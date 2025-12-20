"use client";

import { useState, useEffect } from "react";
import { Briefcase, MapPin, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getStrapiURL } from "@/lib/strapi/client";
import type { Category } from "../api";
import { JobPreview } from "./JobPreview";

type JobType = "Remote" | "Full-Time" | "Part-Time" | "Contract" | "Internship";

type PostJobFormData = {
  jobTitle: string;
  location: string;
  category: string;
  jobType: JobType | "";
  jobDescription: string;
  requirements: string;
  minSalary: string;
  maxSalary: string;
};

export function PostJobForm() {
  const [formData, setFormData] = useState<PostJobFormData>({
    jobTitle: "",
    location: "",
    category: "",
    jobType: "",
    jobDescription: "",
    requirements: "",
    minSalary: "",
    maxSalary: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<Partial<Record<keyof PostJobFormData, string>> & { submit?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Fetch categories on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch categories
        const categoriesResponse = await fetch(`${getStrapiURL()}/api/categories?populate=*`);
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData.data || []);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleChange = (field: keyof PostJobFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof PostJobFormData, string>> = {};

    if (!formData.jobTitle.trim()) {
      newErrors.jobTitle = "Job title is required";
    }
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.jobType) {
      newErrors.jobType = "Job type is required";
    }
    if (!formData.jobDescription.trim()) {
      newErrors.jobDescription = "Job description is required";
    }
    if (!formData.requirements.trim()) {
      newErrors.requirements = "Requirements are required";
    }
    if (formData.minSalary && formData.maxSalary) {
      const min = parseFloat(formData.minSalary);
      const max = parseFloat(formData.maxSalary);
      if (isNaN(min) || isNaN(max)) {
        newErrors.minSalary = "Please enter valid salary numbers";
      } else if (min > max) {
        newErrors.minSalary = "Minimum salary cannot be greater than maximum salary";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Convert plain text to Strapi rich text format
  const convertToRichText = (text: string) => {
    if (!text.trim()) return [];
    
    // Split by newlines and create paragraphs
    const paragraphs = text.split('\n').filter(p => p.trim());
    
    if (paragraphs.length === 0) {
      return [{
        type: "paragraph",
        children: [{ type: "text", text: text.trim() }]
      }];
    }

    return paragraphs.map(paragraph => ({
      type: "paragraph",
      children: [{ type: "text", text: paragraph.trim() }]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // Get JWT token from localStorage
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("You must be logged in to post a job");
      }

      // Prepare job data in Strapi format
      const jobData: {
        data: {
          title: string;
          jobType: string;
          jobDescription: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
          requirements: Array<{ type: string; children: Array<{ type: string; text: string }> }>;
          location: string | null;
          category?: number;
          minSalary?: number;
          maxSalary?: number;
        };
      } = {
        data: {
          title: formData.jobTitle,
          jobType: formData.jobType,
          jobDescription: convertToRichText(formData.jobDescription),
          requirements: convertToRichText(formData.requirements),
          location: formData.location || null,
        }
      };

      // Add category if selected (only include if provided, as relation ID)
      if (formData.category) {
        jobData.data.category = parseInt(formData.category);
      }

      // Add salary if provided
      if (formData.minSalary) {
        jobData.data.minSalary = parseFloat(formData.minSalary);
      }
      if (formData.maxSalary) {
        jobData.data.maxSalary = parseFloat(formData.maxSalary);
      }

      // Submit to Strapi
      console.log("Submitting job data:", JSON.stringify(jobData, null, 2));
      console.log("JWT token present:", !!jwt);
      
      const response = await fetch(`${getStrapiURL()}/api/jobs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify(jobData),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log("Response data:", result);
      
      if (!response.ok) {
        // Handle 403 specifically
        if (response.status === 403) {
          throw new Error(
            "Permission denied. Please ensure your user role has permission to create jobs in Strapi. " +
            "Go to Settings > Users & Permissions > Roles > Authenticated (or your role) > Job > enable 'create' permission."
          );
        }
        throw new Error(result.error?.message || result.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      // Success - show toast notification
      toast.success("Job posted successfully!", {
        description: "Your job posting has been created and is now live.",
      });
      
      // Reset form
      setFormData({
        jobTitle: "",
        location: "",
        category: "",
        jobType: "",
        jobDescription: "",
        requirements: "",
        minSalary: "",
        maxSalary: "",
      });
      
      // Optionally redirect to jobs list
      // window.location.href = "/dashboard/jobs";
    } catch (error) {
      console.error("Error posting job:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to post job. Please try again.";
      
      // Show error toast
      toast.error("Failed to post job", {
        description: errorMessage,
      });
      
      setErrors({
        ...errors,
        submit: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  // Show preview if enabled
  if (showPreview) {
    const categoryName = categories.find(c => c.id.toString() === formData.category)?.name;
    
    return (
      <JobPreview
        jobData={{
          ...formData,
          categoryName,
        }}
        categories={categories}
        onBack={() => setShowPreview(false)}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto space-y-6">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Post a New Job</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Fill out the form below to create your job posting.
          </p>
        </div>
        <Button 
          type="button" 
          variant="outline"
          onClick={() => {
            if (validate()) {
              setShowPreview(true);
            }
          }}
          className="shrink-0"
        >
          Preview
        </Button>
      </div>

      {/* Job Title */}
      <div className="space-y-2">
        <Label htmlFor="jobTitle" className="flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Job Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="jobTitle"
          type="text"
          placeholder="e.g., Front-End Developer"
          value={formData.jobTitle}
          onChange={(e) => handleChange("jobTitle", e.target.value)}
          className={errors.jobTitle ? "border-destructive" : ""}
        />
        {errors.jobTitle && (
          <p className="text-sm text-destructive">{errors.jobTitle}</p>
        )}
      </div>

      {/* Location */}
      <div className="space-y-2">
        <Label htmlFor="location" className="flex items-center gap-2">
          <MapPin className="h-4 w-4" />
          Location
        </Label>
        <Input
          id="location"
          type="text"
          placeholder="e.g., Paris, France"
          value={formData.location}
          onChange={(e) => handleChange("location", e.target.value)}
          className={errors.location ? "border-destructive" : ""}
        />
        {errors.location && (
          <p className="text-sm text-destructive">{errors.location}</p>
        )}
      </div>

      {/* Category */}
      <div className="space-y-2">
        <Label htmlFor="category" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Category <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.category}
          onValueChange={(value) => handleChange("category", value)}
        >
          <SelectTrigger className={`w-full ${errors.category ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category}</p>
        )}
      </div>

      {/* Job Type */}
      <div className="space-y-2">
        <Label htmlFor="jobType" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Job Type <span className="text-destructive">*</span>
        </Label>
        <Select
          value={formData.jobType}
          onValueChange={(value) => handleChange("jobType", value as JobType)}
        >
          <SelectTrigger className={`w-full ${errors.jobType ? "border-destructive" : ""}`}>
            <SelectValue placeholder="Select job type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Remote">Remote</SelectItem>
            <SelectItem value="Full-Time">Full-Time</SelectItem>
            <SelectItem value="Part-Time">Part-Time</SelectItem>
            <SelectItem value="Contract">Contract</SelectItem>
            <SelectItem value="Internship">Internship</SelectItem>
          </SelectContent>
        </Select>
        {errors.jobType && (
          <p className="text-sm text-destructive">{errors.jobType}</p>
        )}
      </div>

      {/* Job Description */}
      <div className="space-y-2">
        <Label htmlFor="jobDescription" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Job Description <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="jobDescription"
          rows={8}
          placeholder="Describe the role and responsibilities..."
          value={formData.jobDescription}
          onChange={(e) => handleChange("jobDescription", e.target.value)}
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.jobDescription ? "border-destructive" : ""
          }`}
        />
        <p className="text-xs text-muted-foreground">
          Include key responsibilities, day-to-day tasks, and what makes this role exciting
        </p>
        {errors.jobDescription && (
          <p className="text-sm text-destructive">{errors.jobDescription}</p>
        )}
      </div>

      {/* Requirements */}
      <div className="space-y-2">
        <Label htmlFor="requirements" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Requirements <span className="text-destructive">*</span>
        </Label>
        <textarea
          id="requirements"
          rows={8}
          placeholder="List the required skills, qualifications, and experience..."
          value={formData.requirements}
          onChange={(e) => handleChange("requirements", e.target.value)}
          className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.requirements ? "border-destructive" : ""
          }`}
        />
        {errors.requirements && (
          <p className="text-sm text-destructive">{errors.requirements}</p>
        )}
      </div>

      {/* Salary Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minSalary" className="flex items-center gap-2">
            {/* <DollarSign className="h-4 w-4" /> */}
            Minimum Salary (ETB)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ETB
            </span>
            <Input
              id="minSalary"
              type="number"
              placeholder="e.g., 10000"
              value={formData.minSalary}
              onChange={(e) => handleChange("minSalary", e.target.value)}
              className={`pl-12 ${errors.minSalary ? "border-destructive" : ""}`}
              min="0"
              step="100"
            />
          </div>
          {errors.minSalary && (
            <p className="text-sm text-destructive">{errors.minSalary}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxSalary" className="flex items-center gap-2">
            {/* <DollarSign className="h-4 w-4" /> */}
            Maximum Salary (ETB)
          </Label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
              ETB
            </span>
            <Input
              id="maxSalary"
              type="number"
              placeholder="e.g., 20000"
              value={formData.maxSalary}
              onChange={(e) => handleChange("maxSalary", e.target.value)}
              className={`pl-12 ${errors.maxSalary ? "border-destructive" : ""}`}
              min="0"
              step="100"
            />
          </div>
          {errors.maxSalary && (
            <p className="text-sm text-destructive">{errors.maxSalary}</p>
          )}
        </div>
      </div>

      {/* Error Message */}
      {errors.submit && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          <p className="font-medium">Error</p>
          <p className="mt-1">{errors.submit}</p>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-4 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Posting..." : "Post Job"}
        </Button>
      </div>
    </form>
  );
}


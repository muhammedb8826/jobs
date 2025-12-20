"use client";

import { ArrowLeft, MapPin, DollarSign, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Category } from "../api";

type JobType = "Remote" | "Full-Time" | "Part-Time" | "Contract" | "Internship";

type JobPreviewData = {
  jobTitle: string;
  location: string;
  category: string;
  categoryName?: string;
  jobType: JobType | "";
  jobDescription: string;
  requirements: string;
  minSalary: string;
  maxSalary: string;
};

type JobPreviewProps = {
  jobData: JobPreviewData;
  categories: Category[];
  onBack: () => void;
};

export function JobPreview({ jobData, categories, onBack }: JobPreviewProps) {
  const categoryName = jobData.categoryName || 
    categories.find(c => c.id.toString() === jobData.category)?.name || 
    "Uncategorized";

  const formatSalary = () => {
    if (!jobData.minSalary && !jobData.maxSalary) {
      return null;
    }
    const min = jobData.minSalary ? parseInt(jobData.minSalary).toLocaleString() : "";
    const max = jobData.maxSalary ? parseInt(jobData.maxSalary).toLocaleString() : "";
    
    if (min && max) {
      return `${min} - ${max} ETB per year`;
    } else if (min) {
      return `${min}+ ETB per year`;
    } else if (max) {
      return `Up to ${max} ETB per year`;
    }
    return null;
  };

  const salaryRange = formatSalary();

  // Format job description and requirements (convert plain text to paragraphs)
  const formatText = (text: string) => {
    return text.split('\n').filter(p => p.trim());
  };

  const descriptionParagraphs = formatText(jobData.jobDescription);
  const requirementLines = formatText(jobData.requirements);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Job Preview</h1>
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Edit
          </Button>
        </div>
      </div>

      {/* Job Title */}
      <div>
        <h2 className="text-4xl font-bold tracking-tight text-foreground mb-2">
          {jobData.jobTitle || "Untitled Job"}
        </h2>
        {jobData.location && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{jobData.location}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap items-center gap-3">
        {categoryName && categoryName !== "Uncategorized" && (
          <Badge variant="secondary" className="bg-blue-100! text-blue-700! hover:bg-blue-100! border-blue-200">
            {categoryName}
          </Badge>
        )}
        {jobData.jobType && (
          <Badge variant="secondary" className="bg-purple-100! text-purple-700! hover:bg-purple-100! border-purple-200">
            {jobData.jobType}
          </Badge>
        )}
        <Badge variant="secondary" className="bg-gray-100! text-gray-700! hover:bg-gray-100! border-gray-200">
          <Clock className="h-3 w-3" />
          Posted today
        </Badge>
      </div>

      {/* Compensation Section */}
      {salaryRange && (
        <div className="rounded-lg bg-green-50 border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center shrink-0">
                <DollarSign className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Compensation</p>
                <p className="text-2xl font-bold text-foreground">{salaryRange}</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100! text-green-700! hover:bg-green-100! border-green-200">
              <Users className="h-3 w-3" />
              Competitive
            </Badge>
          </div>
        </div>
      )}

      {/* About This Role Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-purple-600"></div>
          <h3 className="text-2xl font-bold text-foreground">About This Role</h3>
        </div>
        <div className="rounded-lg border bg-card p-6">
          {descriptionParagraphs.length > 0 ? (
            <div className="space-y-3 text-muted-foreground">
              {descriptionParagraphs.map((paragraph, index) => (
                <p key={index} className="leading-relaxed">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground italic">No description provided.</p>
          )}
        </div>
      </div>

      {/* What We're Looking For Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="h-8 w-1 rounded-full bg-purple-600"></div>
          <h3 className="text-2xl font-bold text-foreground">What We&apos;re Looking For</h3>
        </div>
        <div className="rounded-lg border bg-card p-6">
          {requirementLines.length > 0 ? (
            <ul className="space-y-2 text-muted-foreground">
              {requirementLines.map((requirement, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-primary mt-1.5">•</span>
                  <span className="leading-relaxed">{requirement}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground italic">No requirements specified.</p>
          )}
        </div>
      </div>
    </div>
  );
}


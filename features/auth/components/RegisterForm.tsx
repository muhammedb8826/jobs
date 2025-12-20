"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { User, Mail, Lock, Eye, EyeOff, Upload, Building2, Briefcase, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getStrapiURL } from "@/lib/strapi/client";

type UserType = "jobseeker" | "employer";

type RegisterFormData = {
  fullName: string;
  email: string;
  password: string;
  userType: UserType | "";
  profileImage: File | null;
  profileImagePreview: string | null;
};

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    email: "",
    password: "",
    userType: "",
    profileImage: null,
    profileImagePreview: null,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof RegisterFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleUserTypeSelect = (userType: UserType) => {
    setFormData((prev) => ({ ...prev, userType }));
    if (errors.userType) {
      setErrors((prev) => ({ ...prev, userType: undefined }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "File size must be less than 5MB",
        }));
        return;
      }
      // Validate file type
      if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
        setErrors((prev) => ({
          ...prev,
          profileImage: "Only JPG and PNG files are allowed",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({
          ...prev,
          profileImage: file,
          profileImagePreview: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
      if (errors.profileImage) {
        setErrors((prev) => ({ ...prev, profileImage: undefined }));
      }
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof RegisterFormData, string>> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    if (!formData.userType) {
      newErrors.userType = "Please select a user type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // First, upload the profile image if provided
      let profileImageId: number | null = null;
      if (formData.profileImage) {
        const imageFormData = new FormData();
        imageFormData.append("files", formData.profileImage);

        const uploadResponse = await fetch(`${getStrapiURL()}/api/upload`, {
          method: "POST",
          body: imageFormData,
        });

        if (uploadResponse.ok) {
          const uploadedFiles = await uploadResponse.json();
          if (uploadedFiles && uploadedFiles.length > 0) {
            profileImageId = uploadedFiles[0].id;
          }
        }
      }

      // Step 1: Register the user with native Strapi endpoint (basic fields only)
      const registerData = {
        username: formData.email.split("@")[0], // Use email prefix as username
        email: formData.email,
        password: formData.password,
      };

      const registerResponse = await fetch(`${getStrapiURL()}/api/auth/local/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const registerResult = await registerResponse.json();

      if (!registerResponse.ok) {
        throw new Error(registerResult.error?.message || registerResult.error || "Registration failed");
      }

      // Step 2: Update user profile with custom fields using the JWT token
      const jwt = registerResult.jwt;
      const userId = registerResult.user?.id;

      if (userId && jwt) {
        const updateData: {
          fullName: string;
          userType: string;
          profileImage?: number;
        } = {
          fullName: formData.fullName,
          userType: formData.userType,
        };

        if (profileImageId) {
          updateData.profileImage = profileImageId;
        }

        const updateResponse = await fetch(`${getStrapiURL()}/api/users/${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${jwt}`,
          },
          body: JSON.stringify({ data: updateData }),
        });

        if (!updateResponse.ok) {
          const updateResult = await updateResponse.json();
          console.warn("Failed to update user profile:", updateResult);
          // Continue anyway - user is registered, profile update can be done later
        }
      }

      // Success - redirect to login or show success message
      window.location.href = "/login?registered=true";
    } catch (error) {
      console.error("Registration error:", error);
      const errorMessage = error instanceof Error ? error.message : "Registration failed. Please try again.";
      setErrors({
        email: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6">
      {/* Full Name */}
      <div className="space-y-2">
        <Label htmlFor="fullName" className="flex items-center gap-2">
          Full Name <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="fullName"
            name="fullName"
            type="text"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            className={`pl-10 ${errors.fullName ? "border-destructive" : ""}`}
          />
        </div>
        {errors.fullName && (
          <p className="text-sm text-destructive">{errors.fullName}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email" className="flex items-center gap-2">
          Email Address <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={`pl-10 ${errors.email ? "border-destructive" : ""}`}
          />
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <Label htmlFor="password" className="flex items-center gap-2">
          Password <span className="text-destructive">*</span>
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={formData.password}
            onChange={handleChange}
            className={`pl-10 pr-10 ${errors.password ? "border-destructive" : ""}`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      {/* Profile Picture */}
      <div className="space-y-2">
        <Label>Profile Picture (Optional)</Label>
        <div className="flex items-center gap-4">
          <div className="relative h-20 w-20 rounded-full overflow-hidden bg-muted border-2 border-border flex items-center justify-center">
            {formData.profileImagePreview ? (
              <Image
                src={formData.profileImagePreview}
                alt="Profile preview"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <User className="h-10 w-10 text-muted-foreground" />
            )}
          </div>
          <div className="flex-1">
            <Label htmlFor="profileImage" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start gap-2"
                asChild
              >
                <span>
                  <Upload className="h-4 w-4" />
                  Upload Photo
                </span>
              </Button>
            </Label>
            <input
              id="profileImage"
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleImageChange}
              className="hidden"
            />
            <p className="text-xs text-muted-foreground mt-1">
              JPG, PNG up to 5MB
            </p>
            {errors.profileImage && (
              <p className="text-sm text-destructive mt-1">{errors.profileImage}</p>
            )}
          </div>
        </div>
      </div>

      {/* User Type Selection */}
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          I am a <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-2 gap-4">
          {/* Job Seeker */}
          <button
            type="button"
            onClick={() => handleUserTypeSelect("jobseeker")}
            className={`relative p-4 rounded-lg border-2 transition-all text-left ${
              formData.userType === "jobseeker"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            } ${errors.userType ? "border-destructive" : ""}`}
          >
            {formData.userType === "jobseeker" && (
              <div className="absolute top-2 right-2">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="flex flex-col items-center text-center space-y-2">
              <Briefcase className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">Job Seeker</div>
                <div className="text-xs text-muted-foreground">
                  Looking for opportunities
                </div>
              </div>
            </div>
          </button>

          {/* Employer */}
          <button
            type="button"
            onClick={() => handleUserTypeSelect("employer")}
            className={`relative p-4 rounded-lg border-2 transition-all text-left ${
              formData.userType === "employer"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50"
            } ${errors.userType ? "border-destructive" : ""}`}
          >
            {formData.userType === "employer" && (
              <div className="absolute top-2 right-2">
                <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-3 w-3 text-primary-foreground" />
                </div>
              </div>
            )}
            <div className="flex flex-col items-center text-center space-y-2">
              <Building2 className="h-8 w-8 text-muted-foreground" />
              <div>
                <div className="font-medium text-foreground">Employer</div>
                <div className="text-xs text-muted-foreground">Hiring talent</div>
              </div>
            </div>
          </button>
        </div>
        {errors.userType && (
          <p className="text-sm text-destructive">{errors.userType}</p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Creating Account..." : "Create Account"}
      </Button>

      {/* Login Link */}
      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Sign in here
        </Link>
      </div>
    </form>
  );
}


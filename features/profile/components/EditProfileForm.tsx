"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { IconBuilding, IconUser, IconX } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getStrapiURL } from "@/lib/strapi/client";
import { resolveImageUrl } from "@/lib/strapi/media";
import type { User } from "@/lib/auth/user";
import { updateUserProfile, updateCompany, createCompany, uploadFile } from "../api/profile.api";

type EditProfileFormData = {
  fullName: string;
  email: string;
  profileImage: File | null;
  companyName: string;
  companyDescription: string;
  companyLogo: File | null;
};

export function EditProfileForm({ user, onUpdate }: { user: User; onUpdate?: () => Promise<void> }) {
  const [formData, setFormData] = useState<EditProfileFormData>({
    fullName: user.fullName || "",
    email: user.email || "",
    profileImage: null,
    companyName: user.company?.name || "",
    companyDescription: user.company?.description || "",
    companyLogo: null,
  });

  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
  const [companyLogoPreview, setCompanyLogoPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const profileImageInputRef = useRef<HTMLInputElement>(null);
  const companyLogoInputRef = useRef<HTMLInputElement>(null);

  // Initialize previews from user data when user changes
  useEffect(() => {
    // Set profile image preview from user data
    if (user.profileImage?.url) {
      const baseUrl = getStrapiURL();
      const imageUrl = resolveImageUrl(user.profileImage, baseUrl);
      if (imageUrl && !formData.profileImage) {
        setProfileImagePreview(imageUrl);
      }
    }

    // Set company logo preview from user data
    if (user.company?.logo?.url) {
      const baseUrl = getStrapiURL();
      const imageUrl = resolveImageUrl(user.company.logo, baseUrl);
      if (imageUrl && !formData.companyLogo) {
        setCompanyLogoPreview(imageUrl);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, profileImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCompanyLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, companyLogo: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          setCompanyLogoPreview(reader.result);
        }
      };
      reader.onerror = () => {
        console.error("Error reading company logo file");
        setCompanyLogoPreview(null);
      };
      reader.readAsDataURL(file);
    } else {
      // Reset preview if no file selected - restore user's existing logo
      if (user.company?.logo?.url) {
        const baseUrl = getStrapiURL();
        const imageUrl = resolveImageUrl(user.company.logo, baseUrl);
        setCompanyLogoPreview(imageUrl || null);
      } else {
        setCompanyLogoPreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const jwt = localStorage.getItem("jwt");
      if (!jwt) {
        throw new Error("You must be logged in to update your profile");
      }

      // Upload profile image if changed
      let profileImageId: number | undefined;
      if (formData.profileImage) {
        profileImageId = await uploadFile(formData.profileImage, jwt);
      }

      // Upload company logo if changed
      let companyLogoId: number | undefined;
      if (formData.companyLogo) {
        companyLogoId = await uploadFile(formData.companyLogo, jwt);
      }

      // Update user profile
      const updateData: {
        fullName: string;
        email: string;
        profileImage?: { id: number };
      } = {
        fullName: formData.fullName,
        email: formData.email,
      };
      
      if (profileImageId) {
        updateData.profileImage = { id: profileImageId };
      }

      await updateUserProfile(user.id, updateData, jwt);

      // Update or create company if user is employer
      if (user.userType === "employer") {
        if (user.company?.id) {
          // Update existing company
          await updateCompany(
            user.company.id,
            {
              name: formData.companyName,
              description: formData.companyDescription || undefined,
              logo: companyLogoId ? { id: companyLogoId } : undefined,
            },
            jwt
          );
        } else if (formData.companyName) {
          // Create new company
          const newCompany = await createCompany(
            {
              name: formData.companyName,
              description: formData.companyDescription || undefined,
              logo: companyLogoId ? { id: companyLogoId } : undefined,
            },
            jwt
          );

          // Link company to user
          await updateUserProfile(user.id, { company: newCompany.id }, jwt);
        }
      }

      toast.success("Profile updated successfully");
      
      // Clear the file inputs since we've successfully uploaded
      setFormData((prev) => ({
        ...prev,
        profileImage: null,
        companyLogo: null,
      }));
      
      // Reset file input refs
      if (profileImageInputRef.current) {
        profileImageInputRef.current.value = "";
      }
      if (companyLogoInputRef.current) {
        companyLogoInputRef.current.value = "";
      }
      
      // Refetch user data to show updated profile
      if (onUpdate) {
        await onUpdate();
      } else {
        // Fallback to reload if no onUpdate callback
        window.location.reload();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error(error instanceof Error ? error.message : "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Edit Profile
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Update your personal information and company details.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Personal Information */}
            <div className="space-y-6">
              <div className="border-b pb-4">
                <h2 className="text-xl font-semibold">Personal Information</h2>
              </div>

              {/* Profile Picture */}
              <div className="space-y-3">
                <Label>Profile Picture</Label>
                <div className="flex items-center gap-4">
                  <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                    {profileImagePreview ? (
                      <Image
                        src={profileImagePreview}
                        alt="Profile"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <IconUser className="w-12 h-12 text-muted-foreground" />
                    )}
                  </div>
                  <div>
                    <input
                      ref={profileImageInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleProfileImageChange}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => profileImageInputRef.current?.click()}
                      className="bg-blue-500 hover:bg-blue-600 text-white border-0"
                    >
                      Choose file
                    </Button>
                    <p className="text-sm text-muted-foreground mt-1">
                      {formData.profileImage ? formData.profileImage.name : "No file chosen"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Full Name */}
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, fullName: e.target.value }))}
                  required
                />
              </div>

              {/* Email Address */}
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                />
              </div>
            </div>

            {/* Company Information - Only show for employers */}
            {user.userType === "employer" && (
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <h2 className="text-xl font-semibold">Company Information</h2>
                </div>

                {/* Company Logo */}
                <div className="space-y-3">
                  <Label>Company Logo</Label>
                  <div className="flex items-center gap-4">
                    <div className="relative w-24 h-24 rounded-lg overflow-hidden border-2 border-border bg-muted flex items-center justify-center">
                      {companyLogoPreview ? (
                        <Image
                          src={companyLogoPreview}
                          alt="Company Logo"
                          fill
                          className="object-cover"
                          unoptimized
                          priority
                        />
                      ) : (
                        <IconBuilding className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div>
                      <input
                        ref={companyLogoInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleCompanyLogoChange}
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => companyLogoInputRef.current?.click()}
                        className="bg-green-500 hover:bg-green-600 text-white border-0"
                      >
                        Choose file
                      </Button>
                      <p className="text-sm text-muted-foreground mt-1">
                        {formData.companyLogo ? formData.companyLogo.name : "No file chosen"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>

                {/* Company Description */}
                <div className="space-y-2">
                  <Label htmlFor="companyDescription">Company Description</Label>
                  <textarea
                    id="companyDescription"
                    rows={4}
                    value={formData.companyDescription}
                    onChange={(e) => setFormData((prev) => ({ ...prev, companyDescription: e.target.value }))}
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              disabled={isSubmitting}
            >
              <IconX className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
              <svg
                className="mr-2 h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


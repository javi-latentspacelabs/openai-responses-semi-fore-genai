"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff, Info } from "lucide-react";

interface SignupFormData {
  businessName: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  email: string;
  password: string;
  monthlyRevenue: string;
  useCase: string;
  referralCode: string;
  acceptedTerms: boolean;
}

export default function SignupForm() {
  const [formData, setFormData] = useState<SignupFormData>({
    businessName: "",
    firstName: "",
    lastName: "",
    mobileNumber: "",
    email: "",
    password: "",
    monthlyRevenue: "",
    useCase: "",
    referralCode: "",
    acceptedTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (field: keyof SignupFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // TODO: Implement signup logic
    console.log("Signup form data:", formData);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
  };

  const isPasswordValid = (password: string) => {
    const hasMinLength = password.length >= 12;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    
    return hasMinLength && hasNumber && hasSpecialChar && hasUpperCase;
  };

  const revenueOptions = [
    "Below ₱100,000",
    "₱100,000 - ₱500,000",
    "₱500,000 - ₱1,000,000",
    "₱1,000,000 - ₱5,000,000",
    "Above ₱5,000,000"
  ];

  const useCaseOptions = [
    "SMS Marketing Campaigns",
    "Customer Notifications",
    "Transaction Alerts",
    "Appointment Reminders",
    "Promotional Messages",
    "Customer Support"
  ];

  return (
    <div className="max-w-md mx-auto p-6 bg-white">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Business Name */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
            Business name
            <Info className="h-4 w-4 text-gray-400" />
          </label>
          <Input
            type="text"
            placeholder="Business name"
            value={formData.businessName}
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            className="w-full"
            required
          />
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full name
          </label>
          <div className="grid grid-cols-2 gap-4">
            <Input
              type="text"
              placeholder="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange("firstName", e.target.value)}
              required
            />
            <Input
              type="text"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange("lastName", e.target.value)}
              required
            />
          </div>
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile number
          </label>
          <p className="text-xs text-gray-500 mb-2">e.g. +63917XXXXXXX</p>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <span className="text-gray-500 text-sm">🇵🇭 +63</span>
            </div>
            <Input
              type="tel"
              placeholder=""
              value={formData.mobileNumber}
              onChange={(e) => handleInputChange("mobileNumber", e.target.value)}
              className="pl-20"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email address
          </label>
          <Input
            type="email"
            placeholder="johndoe@domain.com"
            value={formData.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <p className="text-xs text-gray-500 mb-2">
            Password should have at least 12 characters with one number, one special character !@#$%^&* and one letter in uppercase.
          </p>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className="pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 flex items-center pr-3"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What is your business&apos; average monthly revenue in PHP?
          </label>
          <select
            value={formData.monthlyRevenue}
            onChange={(e) => handleInputChange("monthlyRevenue", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="">Select option</option>
            {revenueOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Use Case */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            How do you intend to use SMS campaigns?
          </label>
          <select
            value={formData.useCase}
            onChange={(e) => handleInputChange("useCase", e.target.value)}
            className="w-full h-9 rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            required
          >
            <option value="">Select option</option>
            {useCaseOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        {/* Referral Code */}
        <div>
          <button
            type="button"
            className="text-blue-600 text-sm font-medium hover:underline"
            onClick={() => {
              // Toggle referral code input visibility
              const input = document.getElementById('referralCode');
              if (input) {
                input.style.display = input.style.display === 'none' ? 'block' : 'none';
              }
            }}
          >
            + Add referral code
          </button>
          <Input
            id="referralCode"
            type="text"
            placeholder="Referral code"
            value={formData.referralCode}
            onChange={(e) => handleInputChange("referralCode", e.target.value)}
            className="mt-2 hidden"
          />
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start gap-3">
          <input
            type="checkbox"
            id="terms"
            checked={formData.acceptedTerms}
            onChange={(e) => handleInputChange("acceptedTerms", e.target.checked)}
            className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            required
          />
          <label htmlFor="terms" className="text-sm text-gray-700">
            I have reviewed the{" "}
            <a href="#" className="text-blue-600 hover:underline">
              terms and conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              list of prohibited businesses
            </a>
          </label>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full bg-green-800 hover:bg-green-900 text-white py-3 rounded-md text-sm font-medium"
          disabled={isLoading || !formData.acceptedTerms || !isPasswordValid(formData.password)}
        >
          {isLoading ? "Signing up..." : "Sign up"}
        </Button>

        {/* Login Link */}
        <div className="text-center">
          <span className="text-gray-600 text-sm">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              Log in here
            </a>
          </span>
        </div>
      </form>
    </div>
  );
} 
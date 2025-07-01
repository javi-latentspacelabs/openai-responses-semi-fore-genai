"use client";

import Assistant from "@/components/assistant";
import ToolsPanel from "@/components/tools-panel";
import { Menu, X, ArrowLeft } from "lucide-react";
import { useState } from "react";
import Link from "next/link";

export default function ChatPage() {
  const [isToolsPanelOpen, setIsToolsPanelOpen] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            href="/" 
            className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back to Campaign Builder
          </Link>
        </div>
        <div className="text-center">
          <h1 className="text-lg font-semibold text-gray-900">Advanced Chat Mode</h1>
          <p className="text-sm text-gray-500">Full access to all tools and features</p>
        </div>
        <div className="w-48"></div> {/* Spacer for center alignment */}
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 flex justify-center">
          <div className="w-full md:w-[70%]">
            <Assistant />
          </div>
        </div>
        <div className="hidden md:block w-[30%]">
          <ToolsPanel />
        </div>
        
        {/* Mobile hamburger menu */}
        <div className="absolute top-20 right-4 md:hidden">
          <button 
            onClick={() => setIsToolsPanelOpen(true)}
            className="bg-white border rounded-lg p-2 shadow-sm"
          >
            <Menu size={20} />
          </button>
        </div>
        
        {/* Mobile overlay panel */}
        {isToolsPanelOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30">
            <div className="w-full bg-white h-full p-4">
              <button 
                className="mb-4 flex items-center text-gray-600" 
                onClick={() => setIsToolsPanelOpen(false)}
              >
                <X size={20} className="mr-2" />
                Close
              </button>
              <ToolsPanel />
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Link from "next/link";

interface CampaignData {
  persona: string;
  campaignType: string;
  message: string;
  recipients: string[];
}

interface GeneratedSMS {
  content: string;
  classification: {
    category: string;
    allow_send: boolean;
  };
}

export default function CampaignBuilder() {
  const [step, setStep] = useState(1);
  const [campaignData, setCampaignData] = useState<CampaignData>({
    persona: "",
    campaignType: "",
    message: "",
    recipients: [],
  });
  const [generatedSMS, setGeneratedSMS] = useState<GeneratedSMS | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isReClassifying, setIsReClassifying] = useState(false);
  const [recipientNumber, setRecipientNumber] = useState("");

  // Check if we're in development/test mode
  const isTestMode = typeof window !== 'undefined' ? 
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' :
    true;

  const personas = [
    { id: "students", label: "Students", description: "College & university students" },
    { id: "parents", label: "Parents", description: "Parents with children" },
    { id: "professionals", label: "Professionals", description: "Working professionals" },
    { id: "seniors", label: "Seniors", description: "Adults 55+" },
    { id: "general", label: "General", description: "General audience" },
  ];

  const campaignTypes = [
    { id: "sale", label: "Sale/Discount", description: "Promote discounts & deals" },
    { id: "event", label: "Event", description: "Announce events & workshops" },
    { id: "update", label: "Update", description: "Share news & updates" },
    { id: "reminder", label: "Reminder", description: "Appointment reminders" },
    { id: "welcome", label: "Welcome", description: "Welcome new customers" },
  ];

  const testNumbers = [
    "+639123456789",
    "+639987654321", 
    "+639111222333",
    "+639failtest", // This will trigger failure
    "+639invalidtest" // This will trigger invalid error
  ];

  const handlePersonaSelect = (persona: string) => {
    console.log('Persona selected:', persona);
    setCampaignData(prev => ({ ...prev, persona }));
    setErrorMessage(""); // Clear any previous errors
    setStep(2);
  };

  const handleCampaignTypeSelect = (campaignType: string) => {
    console.log('Campaign type selected:', campaignType);
    setCampaignData(prev => ({ ...prev, campaignType }));
    setErrorMessage(""); // Clear any previous errors
    setStep(3);
  };

  const reClassifySMS = async (content: string) => {
    if (!content.trim()) return null;
    
    setIsReClassifying(true);
    try {
      const classifyResponse = await fetch('/api/sms_classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content
        })
      });
      
      const classificationData = await classifyResponse.json();
      console.log('Re-classification Response:', classificationData);
      
      if (!classifyResponse.ok) {
        console.error('Re-classification API Error:', classificationData);
        return null;
      }
      
      if (!classificationData.classification) {
        console.error('No re-classification data:', classificationData);
        return null;
      }
      
      const classification = classificationData.classification;
      const category = Array.isArray(classification.categories) 
        ? classification.categories[0] 
        : classification.categories || 'Unknown';
      
      return {
        category: category,
        allow_send: classification.allow_send === true
      };
    } catch (error) {
      console.error('Error re-classifying SMS:', error);
      return null;
    } finally {
      setIsReClassifying(false);
    }
  };

  // Track the edited SMS content separately
  const [editedSMSContent, setEditedSMSContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>("");

  // Initialize edited content when SMS is generated
  useEffect(() => {
    if (generatedSMS && generatedSMS.content && !editedSMSContent) {
      setEditedSMSContent(generatedSMS.content);
    }
  }, [generatedSMS, editedSMSContent]);

  // Debounced re-classification when content changes
  useEffect(() => {
    if (!editedSMSContent.trim() || !generatedSMS) return;
    if (editedSMSContent === generatedSMS.content) return; // No change

    // Update SMS content immediately for UI responsiveness
    setGeneratedSMS(prev => prev ? { 
      ...prev, 
      content: editedSMSContent,
      classification: {
        ...prev.classification,
        // Reset to checking state while re-classifying
        allow_send: false
      }
    } : null);

    // Debounce the re-classification
    const timeoutId = setTimeout(async () => {
      const newClassification = await reClassifySMS(editedSMSContent);
      if (newClassification) {
        setGeneratedSMS(prev => prev ? {
          ...prev,
          content: editedSMSContent,
          classification: newClassification
        } : null);
      }
    }, 1000); // Wait 1 second after user stops typing

    return () => clearTimeout(timeoutId);
  }, [editedSMSContent, generatedSMS]);

  const handleGenerateSMS = async () => {
    setIsGenerating(true);
    try {
      // Generate SMS
      const generateResponse = await fetch('/api/sms_generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          persona: campaignData.persona,
          prompt: campaignData.message
        })
      });
      
      let smsData;
      try {
        smsData = await generateResponse.json();
      } catch (jsonError) {
        console.error('Failed to parse SMS generation response:', jsonError);
        throw new Error('Server communication error. Please try again.');
      }
      
      console.log('SMS Generation Response Status:', generateResponse.status);
      console.log('SMS Generation Response:', smsData);
      
      // Check if SMS generation failed
      if (!generateResponse.ok) {
        // Handle content policy violations with user-friendly messages
        if (smsData?.blocked) {
          // Create user-friendly error messages based on category
          let userMessage = "Your content violates our policy guidelines.";
          
          if (smsData.category?.toLowerCase().includes('adult')) {
            userMessage = "🚫 Adult content is not allowed in SMS campaigns.";
          } else if (smsData.category?.toLowerCase().includes('gambling')) {
            userMessage = "🚫 Gambling content is not allowed in SMS campaigns.";
          } else if (smsData.category?.toLowerCase().includes('political')) {
            userMessage = "🚫 Political campaign content is not allowed.";
          } else if (smsData.category?.toLowerCase().includes('fraud')) {
            userMessage = "🚫 This content appears to be fraudulent or misleading.";
          } else if (smsData.category?.toLowerCase().includes('illegal')) {
            userMessage = "🚫 Illegal content is not allowed in SMS campaigns.";
          }
          
          throw new Error(userMessage);
        }
        
        // Handle other API errors
        const errorMessage = smsData?.error || 'Failed to generate SMS';
        throw new Error(errorMessage);
      }
      
      if (!smsData.message) {
        console.error('No SMS content in response:', smsData);
        throw new Error('No SMS content generated. Check your OpenAI API key.');
      }
      
      // Classify SMS
      const classifyResponse = await fetch('/api/sms_classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: smsData.message
        })
      });
      
      const classificationData = await classifyResponse.json();
      console.log('Classification Response Status:', classifyResponse.status);
      console.log('Classification Response:', classificationData);
      
      // Check if classification failed
      if (!classifyResponse.ok) {
        console.error('Classification API Error:', classificationData);
        throw new Error(classificationData.error || `Classification API Error: ${classifyResponse.status}`);
      }
      
      if (!classificationData.classification) {
        console.error('No classification data:', classificationData);
        throw new Error('No classification data returned.');
      }
      
      // Extract the classification object and format it for the UI
      const classification = classificationData.classification;
      const category = Array.isArray(classification.categories) 
        ? classification.categories[0] 
        : classification.categories || 'Unknown';
      
      setGeneratedSMS({
        content: smsData.message,
        classification: {
          category: category,
          allow_send: classification.allow_send === true
        }
      });
      
      setStep(4);
      // Reset edited content to the new generated content
      setEditedSMSContent(smsData.message);
    } catch (error) {
      console.error('Error generating SMS:', error);
      
      // Show user-friendly error message
      const errorMsg = error instanceof Error ? error.message : 'Unknown error occurred';
      
      // Don't mention API key for policy violations
      if (errorMsg.includes('🚫')) {
        setErrorMessage(errorMsg);
      } else {
        setErrorMessage(`${errorMsg}${errorMsg.includes('OpenAI') ? '' : '. Please check your configuration and try again.'}`);
      }
      
      // Clear error after 5 seconds
      setTimeout(() => setErrorMessage(""), 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendSMS = async () => {
    if (!generatedSMS || !recipientNumber || !editedSMSContent.trim()) return;
    
    setIsSending(true);
    try {
      const response = await fetch('/api/sms_send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: editedSMSContent, // Use the edited content
          recipient: recipientNumber
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert(isTestMode ? 
          'Test Mode: SMS would be sent successfully!' : 
          'SMS sent successfully!'
        );
      } else {
        alert('Error sending SMS: ' + result.error);
      }
    } catch (error) {
      console.error('Error sending SMS:', error);
      alert('Error sending SMS. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Debug logging
  console.log('Current step:', step, 'Campaign data:', campaignData);

  return (
    <div className="max-w-4xl mx-auto p-8">
      {/* Test Mode Banner */}
      {isTestMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="bg-yellow-200 rounded-full w-6 h-6 flex items-center justify-center mr-3">
              <span className="text-yellow-800 text-sm font-bold">T</span>
            </div>
            <div>
              <h3 className="font-medium text-yellow-800">Test Mode Active</h3>
              <p className="text-sm text-yellow-700">
                No real SMS messages will be sent. Perfect for testing your campaigns!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Header with Semaphore Logo */}
      <div className="text-center mb-8">
        <img 
          src="/semaphore_logo.svg" 
          alt="Semaphore" 
          className="h-16 mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          SMS Campaign Builder
        </h1>
        <p className="text-gray-600">
          Create targeted SMS campaigns in minutes
        </p>
      </div>

      {/* Progress Steps */}
      <div className="flex justify-center mb-12">
        <div className="flex items-center space-x-4">
          {[1, 2, 3, 4].map((stepNum) => (
            <React.Fragment key={stepNum}>
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium
                ${step >= stepNum 
                  ? 'bg-orange-500 text-white' 
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {stepNum}
              </div>
              {stepNum < 4 && (
                <div className={`
                  w-12 h-1 
                  ${step > stepNum ? 'bg-orange-500' : 'bg-gray-200'}
                `} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Enhanced Error Message Display */}
      {errorMessage && (
        <div className="mb-6 p-6 rounded-xl border-2 border-red-500 bg-gradient-to-r from-red-50 to-pink-50 shadow-xl">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🚫</span>
              </div>
            </div>
            <div className="ml-4 flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-red-800 font-bold text-lg">Content Policy Violation</h3>
                <button
                  onClick={() => setErrorMessage("")}
                  className="text-red-500 hover:text-red-700 font-bold text-xl hover:bg-red-100 rounded-full w-8 h-8 flex items-center justify-center transition-all"
                >
                  ×
                </button>
              </div>
              
              <div className="bg-white rounded-lg p-4 mb-4 border border-red-200">
                <h4 className="font-medium text-red-800 mb-2">⚠️ Why was this blocked?</h4>
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-red-100 rounded-lg p-3">
                  <h5 className="font-medium text-red-800 mb-1">📊 Compliance Category</h5>
                  <p className="text-red-600">
                    {errorMessage.includes('Adult') ? 'Adult Content' :
                     errorMessage.includes('Gambling') ? 'Gambling/Betting' :
                     errorMessage.includes('Political') ? 'Political Campaign' :
                     errorMessage.includes('fraud') ? 'Fraud/Scam' :
                     errorMessage.includes('Illegal') ? 'Illegal Content' : 'Policy Violation'}
                  </p>
                </div>
                <div className="bg-red-100 rounded-lg p-3">
                  <h5 className="font-medium text-red-800 mb-1">🛡️ Protection Level</h5>
                  <p className="text-red-600">High Risk - Blocked</p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <h5 className="font-medium text-yellow-800 mb-1">💡 What can you do?</h5>
                <p className="text-yellow-700 text-sm">
                  Modify your campaign to focus on legitimate business offerings, educational content, or standard promotional messages.
                </p>
              </div>

              <div className="mt-4 text-xs text-gray-600 bg-gray-50 p-2 rounded border">
                📋 <strong>Audit Log:</strong> This violation has been logged for compliance reporting. 
                Timestamp: {new Date().toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step Content */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        
        {/* Step 1: Select Persona */}
        {step === 1 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Who is your audience?</h2>
            <p className="text-gray-600 mb-8">Choose the persona that best describes your target audience</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {personas.map((persona) => (
                <button
                  key={persona.id}
                  onClick={() => handlePersonaSelect(persona.id)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all group"
                >
                  <div className="font-medium text-gray-900 mb-2 text-lg">
                    {persona.label}
                  </div>
                  <div className="text-sm text-gray-600">{persona.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Select Campaign Type */}
        {step === 2 && (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">What type of campaign?</h2>
            <p className="text-gray-600 mb-8">Choose the purpose of your SMS campaign</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
              {campaignTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleCampaignTypeSelect(type.id)}
                  className="p-6 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all"
                >
                  <div className="font-medium text-gray-900 mb-2 text-lg">
                    {type.label}
                  </div>
                  <div className="text-sm text-gray-600">{type.description}</div>
                </button>
              ))}
            </div>

            <Button 
              onClick={() => {
                setStep(1);
                setErrorMessage("");
              }}
              variant="outline"
              className="mt-8 mr-4"
            >
              Back
            </Button>
          </div>
        )}

        {/* Step 3: Create Message */}
        {step === 3 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Describe your campaign</h2>
            <p className="text-gray-600 mb-8 text-center">
              Tell us about your {campaignData.campaignType} campaign for {campaignData.persona}
            </p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign details
                </label>
                <Textarea
                  placeholder="e.g., 20% discount on all products for the next 7 days, free shipping included..."
                  value={campaignData.message}
                  onChange={(e) => {
                    setCampaignData(prev => ({ ...prev, message: e.target.value }));
                    if (errorMessage) setErrorMessage(""); // Clear error when user starts typing
                  }}
                  rows={4}
                  className="w-full"
                />
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-medium text-orange-900 mb-2">Campaign Summary</h3>
                <div className="text-sm text-orange-800">
                  <p><span className="font-medium">Audience:</span> {personas.find(p => p.id === campaignData.persona)?.label}</p>
                  <p><span className="font-medium">Type:</span> {campaignTypes.find(t => t.id === campaignData.campaignType)?.label}</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button 
                  onClick={() => {
                    setStep(2);
                    setErrorMessage("");
                  }}
                  variant="outline"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleGenerateSMS}
                  disabled={!campaignData.message.trim() || isGenerating}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  {isGenerating ? 'Generating...' : 'Generate SMS'}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Preview & Send */}
        {step === 4 && generatedSMS && (
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">Campaign Generated!</h2>
            <p className="text-gray-600 mb-8">Review and customize your SMS before sending</p>
            
            {/* Clean SMS Editor */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 border border-orange-200 rounded-xl p-6 mb-8">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                {/* Phone Mockup */}
                <div className="bg-gray-900 rounded-2xl p-4 max-w-sm mx-auto mb-4">
                  <div className="bg-gray-800 rounded-xl p-1 mb-2">
                    <div className="bg-white rounded-lg p-3">
                      <div className="flex items-center mb-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                        <span className="text-xs text-gray-600">SMS Preview</span>
                      </div>
                                             <div className="text-left text-sm text-gray-900 leading-relaxed">
                         {(editedSMSContent && editedSMSContent !== "") ? editedSMSContent : generatedSMS.content}
                       </div>
                    </div>
                  </div>
                  <div className="text-center">
                    <span className="text-xs text-gray-400">
                      {((editedSMSContent && editedSMSContent !== "") ? editedSMSContent : generatedSMS.content).length}/160
                    </span>
                  </div>
                </div>

                {/* Edit Button */}
                <Button
                  variant="outline"
                  onClick={() => {
                    if (!isEditing) {
                      setEditedSMSContent(editedSMSContent || generatedSMS.content);
                    }
                    setIsEditing(!isEditing);
                  }}
                  className="mb-4 text-sm"
                >
                  {isEditing ? '✅ Done Editing' : '✏️ Edit Message'}
                </Button>

                {/* Inline Editor (only show when editing) */}
                {isEditing && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                    <Textarea
                      value={editedSMSContent}
                      onChange={(e) => setEditedSMSContent(e.target.value)}
                      rows={3}
                      className="w-full text-center border-2 focus:border-orange-300"
                      placeholder="Edit your SMS..."
                    />
                    <div className="mt-2 flex justify-between items-center">
                      <span className={`text-xs ${editedSMSContent.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                        {editedSMSContent.length}/160 characters
                      </span>
                      <div className="space-x-2">
                        <Button
                          variant="outline"
                          onClick={() => {
                            setEditedSMSContent(generatedSMS.content);
                            setIsEditing(false);
                          }}
                          className="text-sm px-3 py-1"
                        >
                          Reset
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Elegant Compliance Check */}
            <div className={`rounded-xl p-6 mb-8 transition-all duration-300 ${
              isReClassifying
                ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200'
                : generatedSMS.classification.allow_send 
                  ? 'bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-200' 
                  : 'bg-gradient-to-r from-red-50 to-pink-50 border-2 border-red-200'
            }`}>
              <div className="flex items-center justify-center mb-3">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 shadow-lg ${
                  isReClassifying
                    ? 'bg-gradient-to-br from-yellow-400 to-orange-400'
                    : generatedSMS.classification.allow_send 
                      ? 'bg-gradient-to-br from-green-400 to-blue-400' 
                      : 'bg-gradient-to-br from-red-400 to-pink-400'
                }`}>
                  <span className="text-white text-lg font-bold">
                    {isReClassifying ? '⏳' : generatedSMS.classification.allow_send ? '✓' : '⚠️'}
                  </span>
                </div>
                <div className="text-left">
                  <h3 className={`font-bold text-lg ${
                    isReClassifying 
                      ? 'text-yellow-800'
                      : generatedSMS.classification.allow_send ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {isReClassifying 
                      ? 'Checking Compliance...'
                      : generatedSMS.classification.allow_send 
                        ? 'Ready to Send!' 
                        : 'Compliance Issue'
                    }
                  </h3>
                  <p className={`text-sm ${
                    isReClassifying 
                      ? 'text-yellow-600'
                      : generatedSMS.classification.allow_send ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isReClassifying ? (
                      'Analyzing your message...'
                    ) : (
                      `${generatedSMS.classification.category} • ${generatedSMS.classification.allow_send ? 'Safe to send' : 'Cannot send'}`
                    )}
                  </p>
                </div>
              </div>
            </div>

            {generatedSMS.classification.allow_send && (
              <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                <h3 className="font-bold text-lg text-gray-800 mb-4">Ready to Send!</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      📱 {isTestMode ? 'Test Phone Number' : 'Recipient Phone Number'}
                    </label>
                    <Input
                      placeholder={isTestMode ? "Try: +639123456789" : "+639123456789"}
                      value={recipientNumber}
                      onChange={(e) => setRecipientNumber(e.target.value)}
                      className="max-w-xs mx-auto text-center border-2 focus:border-orange-300"
                    />
                    
                    {isTestMode && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-600 mb-2">Quick test numbers:</p>
                        <div className="flex flex-wrap gap-2 justify-center">
                          {testNumbers.slice(0, 3).map((number) => (
                            <button
                              key={number}
                              onClick={() => setRecipientNumber(number)}
                              className="text-xs bg-white hover:bg-orange-50 border border-gray-200 hover:border-orange-300 px-3 py-1 rounded-full transition-colors"
                            >
                              {number}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSendSMS}
                    disabled={!recipientNumber.trim() || isSending || isReClassifying || ((editedSMSContent && editedSMSContent !== "") ? editedSMSContent : generatedSMS.content).length > 160}
                    className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    {isSending ? '📤 Sending...' : 
                     isReClassifying ? '⏳ Checking...' :
                     isTestMode ? '🧪 Test Send SMS' : '🚀 Send SMS'}
                  </Button>
                </div>
              </div>
            )}
            
            <div className="flex justify-center gap-4 pt-6 border-t border-gray-200">
              <Button 
                variant="outline" 
                onClick={() => {
                  setStep(3);
                  setEditedSMSContent(""); // Reset edited content
                  setIsEditing(false); // Reset editing state
                  setErrorMessage(""); // Clear any errors
                }}
                className="border-orange-200 text-orange-600 hover:bg-orange-50"
              >
                ← Back to Edit
              </Button>
              <Button 
                variant="outline"
                className="border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                💾 Save Draft
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Mode Link */}
      <div className="text-center mt-8">
        <Link href="/chat" className="text-sm text-gray-500 hover:text-orange-500">
          Need more control? Try Advanced Chat Mode
        </Link>
      </div>
    </div>
  );
} 
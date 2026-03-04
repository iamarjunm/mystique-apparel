"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity";
import { motion } from "framer-motion";
import { Mail, Send, Users, Check, AlertCircle, Eye, Zap } from "lucide-react";
import Modal from "../components/Modal";
import EmailTemplateSelector from "./components/EmailTemplateSelector";
import AdvancedEmailBuilder from "./components/AdvancedEmailBuilder";
import EmailPreviewRenderer from "./components/EmailPreviewRenderer";

export default function EmailManagementPage() {
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isTemplateOpen, setIsTemplateOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recipientMode, setRecipientMode] = useState("database");
  const [customEmails, setCustomEmails] = useState("");

  // Email builder state
  const [emailBuilder, setEmailBuilder] = useState({
    subject: "Update from Mystique Apparel",
    greeting: "Hello there! 👋",
    headline: "Check Out Our Latest Collection",
    mainMessage: "We have something special for you.",
    ctaText: "Shop Now",
    ctaLink: "https://mystique-apparel.com",
    footerText: "© 2024 Mystique Apparel",
    bodyStyle: "professional",
  });

  const bodyStyles = {
    professional: {
      bgColor: "#ffffff",
      headerBg: "#1a1a1a",
      accentColor: "#007bff",
      textColor: "#333333",
    },
    marketing: {
      bgColor: "#ffffff",
      headerBg: "linear-gradient(135deg, #0096ff 0%, #0066cc 100%)",
      accentColor: "#ff6b35",
      textColor: "#333333",
    },
    minimal: {
      bgColor: "#f5f5f5",
      headerBg: "#ffffff",
      accentColor: "#555555",
      textColor: "#666666",
    },
  };

  const handleSelectTemplate = (template) => {
    setEmailBuilder({
      subject: template.subject,
      greeting: template.greeting,
      headline: template.headline,
      mainMessage: template.mainMessage,
      ctaText: template.ctaText,
      ctaLink: template.ctaLink,
      footerText: template.footerText,
      bodyStyle: template.bodyStyle,
    });
    setIsTemplateOpen(false);
  };

  const handleEmailUpdate = (newData) => {
    setEmailBuilder(newData);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await client.fetch(
        `*[_type == "userProfile" && email != null] {
          _id,
          displayName,
          email
        } | order(displayName asc)`
      );
      console.log("Fetched users:", data);
      setUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserSelection = (userId) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const toggleAllUsers = () => {
    if (selectedUsers.size === filteredUsers.length && filteredUsers.length > 0) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(filteredUsers.map((u) => u._id)));
    }
  };

  const handleEmailBuilderChange = (field, value) => {
    setEmailBuilder((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const generateEmailHTML = () => {
    const style = bodyStyles[emailBuilder.bodyStyle] || bodyStyles.professional;
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${style.bgColor}; padding: 20px; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: ${style.headerBg}; color: white; padding: 40px 30px; text-align: center; }
    .header h1 { font-size: 28px; margin-bottom: 10px; }
    .content { padding: 40px 30px; color: ${style.textColor}; line-height: 1.8; }
    .content p { margin-bottom: 15px; }
    .greeting { font-size: 16px; }
    .headline { font-size: 24px; font-weight: bold; color: ${style.accentColor}; margin: 20px 0; }
    .cta-button { display: inline-block; background: ${style.accentColor}; color: white; padding: 14px 40px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 25px 0; }
    .cta-button:hover { opacity: 0.9; }
    .footer { background: #f5f5f5; padding: 20px 30px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✉️ Mystique Apparel</h1>
    </div>
    <div class="content">
      <p class="greeting">${emailBuilder.greeting}</p>
      <h2 class="headline">${emailBuilder.headline}</h2>
      <p>${emailBuilder.mainMessage}</p>
      <a href="${emailBuilder.ctaLink}" class="cta-button">${emailBuilder.ctaText}</a>
      <p style="margin-top: 30px; font-size: 14px;">Best regards,<br><strong>The Mystique Apparel Team</strong></p>
    </div>
    <div class="footer">
      <p>${emailBuilder.footerText}</p>
    </div>
  </div>
</body>
</html>`;
  };

  const handleSendEmail = async () => {
    if (!emailBuilder.subject || !emailBuilder.headline || !emailBuilder.mainMessage) {
      alert("Please fill in all required fields (Subject, Headline, Message)");
      return;
    }

    if (recipientMode === "database" && selectedUsers.size === 0) {
      alert("Please select at least one user");
      return;
    }

    if (recipientMode === "custom" && getCustomEmailsList().length === 0) {
      alert("Please enter at least one valid email");
      return;
    }

    setIsSending(true);
    try {
      let recipients = [];
      if (recipientMode === "database") {
        recipients = users
          .filter((u) => selectedUsers.has(u._id))
          .map((u) => u.email)
          .filter((email) => email); // Filter out undefined/null emails
      } else {
        recipients = getCustomEmailsList();
      }

      // Generate email HTML content
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f5f5f5; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
            .header { background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%); color: white; padding: 50px 30px; text-align: center; }
            .header h1 { font-size: 28px; margin-bottom: 5px; font-weight: 700; }
            .content { padding: 40px 30px; color: #333333; line-height: 1.8; }
            .headline { font-size: 28px; font-weight: 700; color: #007bff; margin: 30px 0 20px 0; }
            .cta-button { display: inline-block; background: #007bff; color: white; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 30px 0; font-size: 16px; }
            .footer { background: #f5f5f5; color: #666; padding: 30px; text-align: center; font-size: 12px; border-top: 1px solid #e0e0e0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>✉️ Mystique Apparel</h1>
            </div>
            <div class="content">
              <p>${emailBuilder.greeting}</p>
              <h2 class="headline">${emailBuilder.headline}</h2>
              <p>${emailBuilder.mainMessage}</p>
              <a href="${emailBuilder.ctaLink}" class="cta-button">${emailBuilder.ctaText}</a>
              <p style="margin-top: 30px; font-size: 14px;">Best regards,<br><strong>The Mystique Apparel Team</strong></p>
            </div>
            <div class="footer">
              <p>${emailBuilder.footerText}</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Send emails via Nodemailer API with BCC batching
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipients,
          subject: emailBuilder.subject,
          htmlContent,
          batchSize: 150, // 150 per batch (BCC mode)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send emails");
      }

      // Show success message with detailed stats
      alert(
        `✅ Email campaign sent successfully!\n\n` +
        `Total Recipients: ${result.summary.totalRecipients}\n` +
        `Valid Recipients: ${result.summary.validRecipients}\n` +
        `Successfully Sent: ${result.summary.successCount}\n` +
        `Batches Used: ${result.summary.totalBatches} (${result.summary.batchSize} per batch)\n\n` +
        `The emails are being sent via Nodemailer with BCC batching for optimal delivery.`
      );

      // Reset form
      setEmailBuilder({
        subject: "Update from Mystique Apparel",
        greeting: "Hello there! 👋",
        headline: "Check Out Our Latest Collection",
        mainMessage: "We have something special for you.",
        ctaText: "Shop Now",
        ctaLink: "https://mystique-apparel.com",
        footerText: "© 2024 Mystique Apparel",
        bodyStyle: "professional",
      });
      setSelectedUsers(new Set());
      setCustomEmails("");
      setIsPreviewOpen(false);
    } catch (error) {
      console.error("Error sending email:", error);
      alert(`❌ Failed to send emails: ${error.message}`);
    } finally {
      setIsSending(false);
    }
  };

  const getCustomEmailsList = () => {
    return customEmails
      .split('\n')
      .map((email) => email.trim())
      .filter((email) => email.length > 0 && email.includes('@'))
      .map((email) => ({ _id: email, displayName: email, email }));
  };

  const filteredUsers = users.filter((user) =>
    (user.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Mail className="w-8 h-8 text-blue-400" />
          Email Management
        </h1>
        <p className="text-gray-400">Send beautiful, professional emails with our easy-to-use builder</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <button
          onClick={() => setIsTemplateOpen(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Zap className="w-5 h-5" />
          Use Template
        </button>
        <button
          onClick={() => setIsPreviewOpen(true)}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white px-4 py-3 rounded font-semibold flex items-center justify-center gap-2 transition-all"
        >
          <Eye className="w-5 h-5" />
          Preview
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Builder */}
        <div className="lg:col-span-2 space-y-6">
          {/* Advanced Email Builder */}
          <div className="bg-black/30 border border-white/10 rounded p-4">
            <AdvancedEmailBuilder emailData={emailBuilder} onUpdate={handleEmailUpdate} />
          </div>
        </div>

        {/* Recipients Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-black/30 border border-white/10 rounded p-4 space-y-4 sticky top-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-semibold text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Recipients
              </h3>
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                {recipientMode === "database" 
                  ? `${selectedUsers.size}/${filteredUsers.length}`
                  : `${getCustomEmailsList().length}`
                }
              </span>
            </div>

            {/* Mode Toggle */}
            <div className="flex gap-2 bg-black/40 rounded p-1">
              <button
                onClick={() => {
                  setRecipientMode("database");
                  setSelectedUsers(new Set());
                }}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  recipientMode === "database"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Database
              </button>
              <button
                onClick={() => {
                  setRecipientMode("custom");
                  setSelectedUsers(new Set());
                }}
                className={`flex-1 px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  recipientMode === "custom"
                    ? "bg-blue-500 text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                Custom List
              </button>
            </div>

            {/* Database Mode */}
            {recipientMode === "database" && (
              <>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-500"
                />

                <div className="space-y-2 max-h-[55vh] overflow-y-auto">
                  {loading ? (
                    <p className="text-gray-400 text-sm">Loading users...</p>
                  ) : filteredUsers.length === 0 ? (
                    <div className="text-gray-400 text-sm">
                      <p className="font-semibold mb-1">No users found</p>
                      {users.length === 0 ? (
                        <p className="text-xs">No users in database yet</p>
                      ) : (
                        <p className="text-xs">Try adjusting your search</p>
                      )}
                    </div>
                  ) : (
                    <>
                      <label className="flex items-center gap-2 p-2 bg-blue-500/10 border border-blue-500/30 rounded cursor-pointer hover:bg-blue-500/20 transition-colors">
                        <input
                          type="checkbox"
                          checked={
                            selectedUsers.size === filteredUsers.length &&
                            filteredUsers.length > 0
                          }
                          onChange={toggleAllUsers}
                          className="w-4 h-4 rounded checked:bg-blue-500 checked:border-blue-500"
                        />
                        <span className="text-xs font-semibold text-blue-300">
                          Select All ({filteredUsers.length})
                        </span>
                      </label>

                      {filteredUsers.map((user) => (
                        <label
                          key={user._id}
                          className="flex items-center gap-2 p-2 rounded hover:bg-white/5 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(user._id)}
                            onChange={() => toggleUserSelection(user._id)}
                            className="w-4 h-4 rounded checked:bg-blue-500 checked:border-blue-500 flex-shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-white truncate">
                              {user.displayName || "No Name"}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{user.email}</p>
                          </div>
                        </label>
                      ))}
                    </>
                  )}
                </div>

                {selectedUsers.size > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-xs text-green-300">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Ready to send
                    </p>
                    <p>Recipients: {selectedUsers.size}</p>
                  </div>
                )}

                {selectedUsers.size === 0 && filteredUsers.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Select recipients
                    </p>
                    <p>Choose users to send emails to</p>
                  </div>
                )}
              </>
            )}

            {/* Custom Email List Mode */}
            {recipientMode === "custom" && (
              <>
                <textarea
                  value={customEmails}
                  onChange={(e) => setCustomEmails(e.target.value)}
                  placeholder="Paste email addresses here&#10;One email per line&#10;&#10;example@gmail.com&#10;user@domain.com"
                  className="w-full px-3 py-2 bg-black/40 border border-white/20 rounded text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 h-32 resize-none font-mono"
                />

                <div className="space-y-2 max-h-[30vh] overflow-y-auto">
                  {getCustomEmailsList().length > 0 ? (
                    <>
                      <p className="text-xs text-gray-400 font-semibold">
                        {getCustomEmailsList().length} email{getCustomEmailsList().length !== 1 ? "s" : ""} found:
                      </p>
                      {getCustomEmailsList().map((email) => (
                        <div
                          key={email._id}
                          className="p-2 bg-black/40 border border-green-500/30 rounded text-xs text-green-300 truncate flex items-center gap-2"
                        >
                          <Check className="w-3 h-3 flex-shrink-0" />
                          {email.email}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-gray-500">Enter emails to preview them here</p>
                  )}
                </div>

                {getCustomEmailsList().length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded p-3 text-xs text-green-300">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <Check className="w-4 h-4" />
                      Ready to send
                    </p>
                    <p>Recipients: {getCustomEmailsList().length}</p>
                  </div>
                )}

                {getCustomEmailsList().length === 0 && customEmails.length > 0 && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3 text-xs text-amber-300">
                    <p className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      Invalid format
                    </p>
                    <p>Please enter valid email addresses (one per line)</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Email Preview Modal */}
      <Modal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        title="Email Preview"
        size="2xl"
      >
        <div className="space-y-4 max-h-[80vh] overflow-y-auto">
          <EmailPreviewRenderer emailData={emailBuilder} style={emailBuilder.bodyStyle} />

          <div className="bg-blue-500/10 border border-blue-500/30 rounded p-3 text-xs text-blue-300">
            <p className="font-semibold">
              Will be sent to {recipientMode === "database" ? selectedUsers.size : getCustomEmailsList().length} recipient{(recipientMode === "database" ? selectedUsers.size : getCustomEmailsList().length) !== 1 ? "s" : ""}
            </p>
          </div>

          <div className="flex gap-2 pt-4 border-t border-white/10">
            <button
              onClick={handleSendEmail}
              disabled={isSending}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              {isSending ? "Sending..." : "Confirm & Send"}
            </button>
            <button
              onClick={() => setIsPreviewOpen(false)}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded font-semibold transition-colors"
            >
              Edit
            </button>
          </div>
        </div>
      </Modal>

      {/* Template Selector Modal */}
      <Modal
        isOpen={isTemplateOpen}
        onClose={() => setIsTemplateOpen(false)}
        title="Email Templates"
        size="2xl"
      >
        <div className="max-h-[75vh] overflow-y-auto">
          <EmailTemplateSelector onSelectTemplate={handleSelectTemplate} />
        </div>
      </Modal>
    </motion.div>
  );
}


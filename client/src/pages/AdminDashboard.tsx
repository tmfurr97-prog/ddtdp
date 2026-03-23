import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, Mail, Search, FileText, AlertTriangle } from "lucide-react";
import { Streamdown } from "streamdown";

export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("emails");

  // Fetch admin stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.stats.useQuery();

  // Email Forwardings
  const { data: pendingEmails, isLoading: emailsLoading, refetch: refetchEmails } = trpc.admin.emailForwardings.pending.useQuery();
  const updateEmailVerdict = trpc.admin.emailForwardings.updateVerdict.useMutation({
    onSuccess: () => refetchEmails(),
  });

  // Credibility Searches
  const { data: pendingSearches, isLoading: searchesLoading, refetch: refetchSearches } = trpc.admin.credibilitySearches.pending.useQuery();
  const updateSearchVerdict = trpc.admin.credibilitySearches.updateVerdict.useMutation({
    onSuccess: () => refetchSearches(),
  });

  // Submissions
  const { data: pendingSubmissions, isLoading: submissionsLoading, refetch: refetchSubmissions } = trpc.admin.submissions.pending.useQuery();
  const updateSubmissionStatus = trpc.admin.submissions.updateStatus.useMutation({
    onSuccess: () => refetchSubmissions(),
  });

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              Access Denied
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              You don't have permission to access the admin dashboard. Only administrators can view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Review and manage user-submitted content before publication</p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Pending Emails
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingEmails}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Pending Searches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSearches}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Pending Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingSubmissions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  Flagged Senders
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.flaggedSenders}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="emails">Email Forwardings</TabsTrigger>
            <TabsTrigger value="searches">Credibility Searches</TabsTrigger>
            <TabsTrigger value="submissions">Submissions</TabsTrigger>
          </TabsList>

          {/* Email Forwardings Tab */}
          <TabsContent value="emails" className="space-y-4">
            {emailsLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
              </Card>
            ) : pendingEmails && pendingEmails.length > 0 ? (
              pendingEmails.map((email) => (
                <Card key={email.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      From: {email.senderEmail}
                    </CardTitle>
                    <CardDescription>
                      {email.senderName && `Sender: ${email.senderName} • `}
                      {email.companyName && `Company: ${email.companyName}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Subject</h4>
                      <p className="text-sm text-muted-foreground">{email.subject}</p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Email Body</h4>
                      <div className="bg-muted p-3 rounded text-sm max-h-40 overflow-y-auto">
                        <Streamdown>{email.emailBody}</Streamdown>
                      </div>
                    </div>

                    {email.suspiciousHooks && (
                      <div>
                        <h4 className="font-semibold mb-2">Identified Red Flags</h4>
                        <p className="text-sm text-muted-foreground">{email.suspiciousHooks}</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Verdict</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        defaultValue={email.verdict || ""}
                        onChange={(e) => {
                          const verdict = e.target.value;
                          updateEmailVerdict.mutate({
                            id: email.id,
                            verdict,
                            analysis: `Reviewed and classified as: ${verdict}`,
                            status: "completed",
                          });
                        }}
                      >
                        <option value="">Select verdict...</option>
                        <option value="phishing">Phishing</option>
                        <option value="scam">Scam</option>
                        <option value="spam">Spam</option>
                        <option value="safe">Safe</option>
                        <option value="suspicious">Suspicious</option>
                      </select>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateEmailVerdict.mutate({
                          id: email.id,
                          verdict: email.verdict || "reviewed",
                          analysis: "Archived without verdict",
                          status: "archived",
                        });
                      }}
                    >
                      Archive
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No pending email forwardings
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Credibility Searches Tab */}
          <TabsContent value="searches" className="space-y-4">
            {searchesLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
              </Card>
            ) : pendingSearches && pendingSearches.length > 0 ? (
              pendingSearches.map((search) => (
                <Card key={search.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{search.query}</CardTitle>
                    <CardDescription>Submitted for fact-checking</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Verdict</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        defaultValue={search.verdict || ""}
                        onChange={(e) => {
                          const verdict = e.target.value;
                          updateSearchVerdict.mutate({
                            id: search.id,
                            verdict,
                            credibilityScore: 50,
                            summary: `Fact-checked: ${verdict}`,
                            sources: JSON.stringify([]),
                            fullAnalysis: `Reviewed and classified as: ${verdict}`,
                            status: "completed",
                          });
                        }}
                      >
                        <option value="">Select verdict...</option>
                        <option value="true">True</option>
                        <option value="false">False</option>
                        <option value="misleading">Misleading</option>
                        <option value="unverified">Unverified</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium">Credibility Score (0-100)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        defaultValue="50"
                        className="w-full px-3 py-2 border rounded-md text-sm"
                      />
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        updateSearchVerdict.mutate({
                          id: search.id,
                          verdict: search.verdict || "unverified",
                          credibilityScore: 0,
                          summary: "Archived without verdict",
                          sources: JSON.stringify([]),
                          fullAnalysis: "Archived",
                          status: "archived",
                        });
                      }}
                    >
                      Archive
                    </Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No pending credibility searches
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Submissions Tab */}
          <TabsContent value="submissions" className="space-y-4">
            {submissionsLoading ? (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">Loading...</CardContent>
              </Card>
            ) : pendingSubmissions && pendingSubmissions.length > 0 ? (
              pendingSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{submission.title}</CardTitle>
                    <CardDescription>{submission.category}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground">{submission.description}</p>
                    </div>

                    {submission.sourceUrl && (
                      <div>
                        <h4 className="font-semibold mb-2">Source</h4>
                        <a href={submission.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
                          {submission.sourceUrl}
                        </a>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          updateSubmissionStatus.mutate({
                            id: submission.id,
                            status: "accepted",
                          });
                        }}
                      >
                        Accept
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          updateSubmissionStatus.mutate({
                            id: submission.id,
                            status: "rejected",
                          });
                        }}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                  <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
                  No pending submissions
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

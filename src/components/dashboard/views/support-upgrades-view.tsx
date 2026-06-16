"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Headphones,
  ArrowUpRight,
  Send,
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useT } from "@/lib/i18n";

// ─── Schemas ──────────────────────────────────────────────────────────────────

const ticketSchema = z.object({
  subject: z.string().min(3, "Subject must be at least 3 characters").max(120),
  category: z.enum(["Payment Issue", "Technical Integration", "Payout Delay", "Account Verification", "Other"]),
  priority: z.enum(["Low", "Medium", "High"]),
  description: z.string().min(10, "Please provide at least 10 characters of detail").max(2000),
});

type TicketFormValues = z.infer<typeof ticketSchema>;

const upgradeSchema = z.object({
  reason: z.string().min(20, "Please provide at least 20 characters explaining your needs").max(1000),
});

type UpgradeFormValues = z.infer<typeof upgradeSchema>;

// ─── Mock Tickets ─────────────────────────────────────────────────────────────

const TICKETS = [
  {
    subject: "PIX payment not confirming",
    status: "open" as const,
    priority: "High" as const,
    timeAgo: "2 hours ago",
  },
  {
    subject: "Webhook integration help",
    status: "in_progress" as const,
    priority: "Medium" as const,
    timeAgo: "1 day ago",
  },
  {
    subject: "Payout delay for batch #4521",
    status: "resolved" as const,
    priority: "Low" as const,
    timeAgo: "3 days ago",
  },
];

// ─── Status / Priority Badges ─────────────────────────────────────────────────

function TicketStatusBadge({ status }: { status: "open" | "in_progress" | "resolved" }) {
  const { t } = useT();

  switch (status) {
    case "open":
      return (
        <Badge variant="outline" className="border-usdt/30 text-usdt bg-usdt/10">
          {t("support.open")}
        </Badge>
      );
    case "in_progress":
      return (
        <Badge variant="outline" className="border-pending/30 text-pending bg-pending/10">
          {t("support.in_progress")}
        </Badge>
      );
    case "resolved":
      return (
        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground bg-muted/50">
          {t("support.resolved")}
        </Badge>
      );
  }
}

function PriorityBadge({ priority }: { priority: "Low" | "Medium" | "High" }) {
  const { t } = useT();

  switch (priority) {
    case "High":
      return (
        <Badge variant="outline" className="border-risk/30 text-risk bg-risk/10">
          {t("support.high")}
        </Badge>
      );
    case "Medium":
      return (
        <Badge variant="outline" className="border-pending/30 text-pending bg-pending/10">
          {t("support.medium")}
        </Badge>
      );
    case "Low":
      return (
        <Badge variant="outline" className="border-muted-foreground/30 text-muted-foreground bg-muted/50">
          {t("support.low")}
        </Badge>
      );
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function SupportUpgradesView() {
  const { t } = useT();
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [upgradeSubmitted, setUpgradeSubmitted] = useState(false);

  // Ticket form
  const ticketForm = useForm<TicketFormValues>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      subject: "",
      category: "Payment Issue",
      priority: "Medium",
      description: "",
    },
  });

  // Upgrade dialog form
  const upgradeForm = useForm<UpgradeFormValues>({
    resolver: zodResolver(upgradeSchema),
    defaultValues: {
      reason: "",
    },
  });

  function onTicketSubmit(_data: TicketFormValues) {
    setTicketSubmitted(true);
    ticketForm.reset();
    setTimeout(() => setTicketSubmitted(false), 3000);
  }

  function onUpgradeSubmit(_data: UpgradeFormValues) {
    setUpgradeSubmitted(true);
    setTimeout(() => {
      setUpgradeSubmitted(false);
      setDialogOpen(false);
      upgradeForm.reset();
    }, 2000);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          {t("support.title")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t("support.subtitle")}
        </p>
      </div>

      <Separator className="bg-border" />

      {/* ── Section 1: Support Ticket Form ───────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("support.open_ticket")}</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardContent className="pt-6">
            <Form {...ticketForm}>
              <form onSubmit={ticketForm.handleSubmit(onTicketSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={ticketForm.control}
                    name="subject"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t("support.subject")}</FormLabel>
                        <FormControl>
                          <Input placeholder="Brief description of your issue" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={ticketForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("support.category")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Payment Issue">Payment Issue</SelectItem>
                              <SelectItem value="Technical Integration">Technical Integration</SelectItem>
                              <SelectItem value="Payout Delay">Payout Delay</SelectItem>
                              <SelectItem value="Account Verification">Account Verification</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={ticketForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("support.priority")}</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Low">{t("support.low")}</SelectItem>
                              <SelectItem value="Medium">{t("support.medium")}</SelectItem>
                              <SelectItem value="High">{t("support.high")}</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                <FormField
                  control={ticketForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("support.description")}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe your issue in detail. Include transaction IDs, error messages, or any relevant context."
                          className="min-h-[120px] resize-y"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="bg-usdt text-background hover:bg-usdt/90 font-medium"
                  disabled={ticketSubmitted}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {ticketSubmitted ? t("support.ticket_submitted") : t("support.submit_ticket")}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 2: Tier Upgrade ──────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <ArrowUpRight className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("support.tier_upgrade")}</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle className="text-base">{t("support.tier_comparison")}</CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              {t("support.tier_upgrade_desc")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Current Tier */}
              <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">Tier B</span>
                  <Badge variant="outline" className="border-usdt/30 text-usdt bg-usdt/10 text-xs">
                    {t("support.current")}
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    D+3 settlement
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    3.49% processing fee
                  </li>
                  <li className="flex items-center gap-2">
                    <Circle className="h-3.5 w-3.5 text-muted-foreground" />
                    Standard support
                  </li>
                </ul>
              </div>

              {/* Target Tier */}
              <div className="rounded-lg border border-usdt/30 bg-usdt/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-usdt">Tier A</span>
                  <Badge variant="outline" className="border-usdt/50 text-usdt bg-usdt/15 text-xs">
                    {t("support.target")}
                  </Badge>
                </div>
                <ul className="space-y-2 text-sm text-foreground/80">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-usdt" />
                    D+0 settlement (instant)
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-usdt" />
                    2.49% processing fee
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-usdt" />
                    Priority support
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-usdt" />
                    Higher transaction limits
                  </li>
                </ul>
              </div>
            </div>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="mt-6 border-usdt/30 text-usdt hover:bg-usdt/10 hover:text-usdt"
                >
                  <ArrowUpRight className="h-4 w-4 mr-2" />
                  {t("support.request_upgrade")}
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-surface border-border sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="text-foreground">
                    {t("support.request_upgrade")}
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    {t("support.tier_upgrade_desc")}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  {/* Requirements */}
                  <div className="rounded-lg border border-border bg-background p-4 space-y-3">
                    <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                      <Shield className="h-4 w-4 text-usdt" />
                      {t("support.requirements")}
                    </h4>
                    <ul className="space-y-2">
                      {[
                        "Minimum 30 days account age",
                        "Monthly volume exceeding $10,000 USD",
                        "Zero compliance violations",
                        "Complete KYC/KYB verification",
                      ].map((req) => (
                        <li
                          key={req}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-usdt mt-0.5 shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Upgrade Form */}
                  <Form {...upgradeForm}>
                    <form onSubmit={upgradeForm.handleSubmit(onUpgradeSubmit)} className="space-y-4">
                      <FormField
                        control={upgradeForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Tell us about your business volume and why you need D+0
                              settlement
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your monthly volume, use case, and how instant settlement would benefit your operations..."
                                className="min-h-[100px] resize-y"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() => {
                            setDialogOpen(false);
                            upgradeForm.reset();
                          }}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          {t("support.cancel")}
                        </Button>
                        <Button
                          type="submit"
                          className="bg-usdt text-background hover:bg-usdt/90 font-medium"
                          disabled={upgradeSubmitted}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          {upgradeSubmitted ? t("support.request_submitted") : t("support.submit_request")}
                        </Button>
                      </DialogFooter>
                    </form>
                  </Form>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </section>

      <Separator className="bg-border" />

      {/* ── Section 3: Recent Tickets ────────────────────────────────────── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Headphones className="h-4 w-4 text-usdt" />
          <h2 className="text-lg font-medium text-foreground">{t("support.recent_tickets")}</h2>
        </div>

        <Card className="bg-surface border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {TICKETS.map((ticket) => (
                <div
                  key={ticket.subject}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-4 py-4"
                >
                  {/* Subject */}
                  <span className="flex-1 text-sm font-medium text-foreground">
                    {ticket.subject}
                  </span>

                  {/* Badges + Time */}
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <TicketStatusBadge status={ticket.status} />
                    <PriorityBadge priority={ticket.priority} />
                    <span className="text-xs text-muted-foreground hidden sm:inline">
                      {ticket.timeAgo}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
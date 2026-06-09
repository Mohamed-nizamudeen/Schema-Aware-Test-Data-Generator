import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sparkles, ShoppingBag, Landmark, Stethoscope, Users, Zap, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { generateData } from "@/lib/api";

export const Route = createFileRoute("/generator")({
  head: () => ({ meta: [{ title: "Data Generator · TestDataGen AI" }] }),
  component: GeneratorPage,
});

const domains = [
  { id: "ecommerce", name: "E-Commerce", icon: ShoppingBag, desc: "Customers, orders, products" },
  { id: "banking", name: "Banking", icon: Landmark, desc: "Accounts, transactions, ledgers" },
  { id: "healthcare", name: "Healthcare", icon: Stethoscope, desc: "Patients, encounters, claims" },
  { id: "hr", name: "HR", icon: Users, desc: "Employees, departments, payroll" },
];

function GeneratorPage() {
  const { ddl, parsedSchema, setGeneratedData, setAgentLog, setValidationIssues, setValidationPassed } = useStore();
  const navigate = useNavigate();
  const [rows, setRows] = useState([10]);
  const [domain, setDomain] = useState("ecommerce");
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  async function generate() {
    if (!ddl) {
      toast.error("No schema found. Please upload one first.");
      navigate({ to: "/upload" });
      return;
    }
    setGenerating(true);
    setProgress(5);
    
    // Faux progress for UX
    const interval = setInterval(() => {
      setProgress((p) => (p < 85 ? p + 5 : p));
    }, 500);

    try {
      const res = await generateData(ddl, rows[0]);
      clearInterval(interval);
      setProgress(100);
      setGeneratedData(res.all_data);
      setAgentLog(res.agent_log);
      setValidationIssues(res.issues);
      setValidationPassed(res.passed);
      toast.success("Dataset generated successfully");
      setTimeout(() => navigate({ to: "/data" }), 500);
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || "Failed to generate data");
      setGenerating(false);
      setProgress(0);
    }
  }

  return (
    <AppShell
      title="Data Generator"
      description="Configure synthetic data generation with domain-aware realism and referential integrity."
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Domain template</CardTitle>
              <CardDescription>Pick a vertical to seed realistic values and distributions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2">
                {domains.map((d) => {
                  const active = domain === d.id;
                  return (
                    <button
                      key={d.id}
                      onClick={() => setDomain(d.id)}
                      className={`text-left rounded-xl border p-4 transition-all ${
                        active
                          ? "border-primary bg-primary/5 shadow-glow"
                          : "border-border/60 bg-card/60 hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                          active ? "gradient-brand text-white" : "bg-muted text-foreground"
                        }`}>
                          <d.icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{d.name}</div>
                          <div className="text-xs text-muted-foreground">{d.desc}</div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="glass border-border/50">
            <CardHeader>
              <CardTitle className="text-base">Volume & options</CardTitle>
              <CardDescription>Tune row counts and generation behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label className="text-sm">Row count per table</Label>
                  <Badge variant="outline" className="font-mono">{rows[0].toLocaleString()} rows</Badge>
                </div>
                <Slider
                  value={rows}
                  onValueChange={setRows}
                  min={1}
                  max={500}
                  step={1}
                />
                <div className="mt-2 flex justify-between text-[10px] text-muted-foreground font-mono">
                  <span>1</span><span>100</span><span>250</span><span>500</span>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm">Locale</Label>
                  <Select defaultValue="en_us">
                    <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en_us">English (US)</SelectItem>
                      <SelectItem value="en_gb">English (UK)</SelectItem>
                      <SelectItem value="fr_fr">French</SelectItem>
                      <SelectItem value="de_de">German</SelectItem>
                      <SelectItem value="ja_jp">Japanese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Seed (deterministic)</Label>
                  <Input className="mt-1.5 font-mono" defaultValue="42" />
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Preserve referential integrity", checked: true },
                  { label: "Generate edge-case rows (10%)", checked: true },
                  { label: "Mask sensitive PII fields", checked: false },
                  { label: "Run validation after generation", checked: true },
                ].map((o) => (
                  <div key={o.label} className="flex items-center justify-between rounded-lg border border-border/60 bg-card/60 px-4 py-2.5">
                    <span className="text-sm">{o.label}</span>
                    <Switch defaultChecked={o.checked} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass border-border/50 h-fit sticky top-20">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Generation summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Domain</span><span className="font-medium capitalize">{domains.find((d) => d.id === domain)?.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Tables</span><span className="font-medium">4</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rows / table</span><span className="font-mono">{rows[0].toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. total rows</span><span className="font-mono">{(rows[0] * 4).toLocaleString()}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Est. duration</span><span className="font-mono">~{Math.max(1, Math.round(rows[0] / 25000))}s</span></div>
            </div>

            {generating && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs"><span className="text-muted-foreground">Generating…</span><span className="font-mono">{progress}%</span></div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Button
              size="lg"
              className="w-full gradient-brand text-white border-0 shadow-glow"
              onClick={generate}
              disabled={generating}
            >
              <Zap className="h-4 w-4" />
              {generating ? "Generating…" : "Generate dataset"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

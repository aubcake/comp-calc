"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, TrendingUp, TrendingDown, MapPin, Briefcase, DollarSign, HelpCircle, AlertTriangle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// IRS Contribution Limits (updated annually by the IRS)
// Current: 2025 limits
// Note: Update these when 2026 limits are announced (typically in Q4 2025)
// Source: IRS.gov - cost-of-living adjustments
const IRS_LIMITS = {
  YEAR: 2025,
  HSA_INDIVIDUAL: 4300,      // Up from $4,150 in 2024
  HSA_FAMILY: 8550,          // Up from $8,300 in 2024
  FSA: 3300,                 // Up from $3,200 in 2024
  CONTRIB_401K_EMPLOYEE: 23500,  // Employee contribution limit (up from $23,000 in 2024)
  CONTRIB_401K_TOTAL: 70000,     // Combined employee + employer contributions (up from $69,000 in 2024)
};
import {
  OCCUPATIONS,
  METRO_AREAS,
  REGIONS,
  getOccupationById,
  getMetroAreaById,
  getAverageSalaryForLocation,
  type RegionId,
} from "@/lib/salary-data";

interface Benefit {
  id: string;
  name: string;
  amount: number;
}

interface CommonBenefit {
  id: string;
  name: string;
  defaultAmount: number;
  description: string;
  tooltipEstimate: string;
  enabled: boolean;
  amount: number;
}

const COMMON_BENEFITS: Omit<CommonBenefit, "enabled" | "amount">[] = [
  { id: "health", name: "Health Insurance", defaultAmount: 12000, description: "Medical coverage", tooltipEstimate: "Typical employer contribution: $8,000-$15,000/year for individual coverage, $15,000-$25,000 for family coverage" },
  { id: "dental", name: "Dental Insurance", defaultAmount: 1500, description: "Dental coverage", tooltipEstimate: "Typical employer contribution: $500-$2,000/year. Average is around $1,200-$1,500 annually" },
  { id: "vision", name: "Vision Insurance", defaultAmount: 500, description: "Vision coverage", tooltipEstimate: "Typical employer contribution: $200-$800/year. Average is around $400-$600 annually" },
  { id: "401k", name: "401(k) Match", defaultAmount: 7500, description: "Employer retirement contribution", tooltipEstimate: "Common match: 50% of first 6% or 100% of first 3-5% of salary. Average total match: $5,000-$10,000/year" },
  { id: "commuter", name: "Commuter Benefits", defaultAmount: 3000, description: "Transit/parking benefits", tooltipEstimate: "Pre-tax benefit up to $315/month ($3,780/year) for transit or parking. Many employers offer $100-$300/month" },
  { id: "gym", name: "Gym Membership", defaultAmount: 1200, description: "Fitness/wellness", tooltipEstimate: "Typical benefit: $30-$150/month ($360-$1,800/year). Some offer free memberships or on-site gyms" },
  { id: "learning", name: "Learning & Development", defaultAmount: 2000, description: "Education/courses budget", tooltipEstimate: "Typical annual budget: $1,000-$5,000 for courses, conferences, or certifications" },
  { id: "home-office", name: "Home Office Stipend", defaultAmount: 1000, description: "WFH equipment", tooltipEstimate: "One-time or annual stipend: $500-$2,000 for desk, chair, monitor, etc." },
  { id: "phone", name: "Phone/Internet", defaultAmount: 1200, description: "Communication expenses", tooltipEstimate: "Typical monthly stipend: $50-$150/month ($600-$1,800/year) for phone and internet" },
  { id: "life", name: "Life Insurance", defaultAmount: 500, description: "Life insurance coverage", tooltipEstimate: "Employer-paid basic coverage (1-2x salary) costs $200-$800/year. Additional voluntary coverage available" },
  { id: "disability", name: "Disability Insurance", defaultAmount: 800, description: "Short/long-term disability", tooltipEstimate: "Typical employer cost: $400-$1,200/year for short and long-term disability coverage" },
  { id: "hsa", name: "HSA/FSA Contribution", defaultAmount: 1000, description: "Health savings account", tooltipEstimate: "Employer HSA contribution: $500-$2,000/year. FSA contribution varies, often matches employee contribution up to a limit" },
  { id: "meals", name: "Meals/Food Stipend", defaultAmount: 2400, description: "Daily meals or snacks", tooltipEstimate: "Free meals/snacks value: $10-$25/day ($2,400-$6,000/year for 5 days/week)" },
  { id: "wellness", name: "Wellness Stipend", defaultAmount: 1000, description: "General wellness budget", tooltipEstimate: "Flexible wellness benefit: $500-$2,000/year for fitness, mental health, massage, etc." },
];

export default function Home() {
  const [cashCompensation, setCashCompensation] = useState<string>("");
  const [hasEquity, setHasEquity] = useState<boolean>(false);
  const [numberOfShares, setNumberOfShares] = useState<string>("");
  const [strikePrice, setStrikePrice] = useState<string>("");
  const [fairMarketValue, setFairMarketValue] = useState<string>("");
  
  // 401(k) separate state
  const [has401k, setHas401k] = useState<boolean>(false);
  const [match401kType, setMatch401kType] = useState<"percentage" | "amount">("percentage");
  const [match401k, setMatch401k] = useState<string>("");
  
  // New: occupation and location
  const [occupationId, setOccupationId] = useState<string>("");
  const [customJobTitle, setCustomJobTitle] = useState<string>("");
  const [metroAreaId, setMetroAreaId] = useState<string>("");
  const [regionId, setRegionId] = useState<RegionId>("national");
  
  const [commonBenefits, setCommonBenefits] = useState<CommonBenefit[]>(
    COMMON_BENEFITS.filter(b => b.id !== "401k").map(b => ({ ...b, enabled: false, amount: b.defaultAmount }))
  );
  
  const [customBenefits, setCustomBenefits] = useState<Benefit[]>([]);

  const addCustomBenefit = () => {
    setCustomBenefits([
      ...customBenefits,
      { id: Date.now().toString(), name: "", amount: 0 },
    ]);
  };

  const removeCustomBenefit = (id: string) => {
    setCustomBenefits(customBenefits.filter((benefit) => benefit.id !== id));
  };

  const updateCustomBenefitName = (id: string, name: string) => {
    setCustomBenefits(
      customBenefits.map((benefit) =>
        benefit.id === id ? { ...benefit, name } : benefit
      )
    );
  };

  const updateCustomBenefitAmount = (id: string, amount: number) => {
    setCustomBenefits(
      customBenefits.map((benefit) =>
        benefit.id === id ? { ...benefit, amount } : benefit
      )
    );
  };

  const handleCustomBenefitAmountChange = (id: string, value: string) => {
    // Allow empty string or just a minus sign while typing
    if (value === "" || value === "-") {
      updateCustomBenefitAmount(id, 0);
      return;
    }
    // Parse the value, but only update if it's a valid number
    const numValue = Number(value);
    if (!isNaN(numValue) && isFinite(numValue) && value.trim() !== "") {
      updateCustomBenefitAmount(id, numValue);
    }
  };

  const toggleCommonBenefit = (id: string, enabled: boolean) => {
    setCommonBenefits(
      commonBenefits.map((benefit) =>
        benefit.id === id ? { ...benefit, enabled } : benefit
      )
    );
  };

  const updateCommonBenefitAmount = (id: string, amount: number) => {
    setCommonBenefits(
      commonBenefits.map((benefit) =>
        benefit.id === id ? { ...benefit, amount } : benefit
      )
    );
  };

  const handleCommonBenefitAmountChange = (id: string, value: string) => {
    // Allow empty string or just a minus sign while typing
    if (value === "" || value === "-") {
      updateCommonBenefitAmount(id, 0);
      return;
    }
    // Parse the value, but only update if it's a valid number
    const numValue = Number(value);
    if (!isNaN(numValue) && isFinite(numValue) && value.trim() !== "") {
      updateCommonBenefitAmount(id, numValue);
    }
  };

  // Calculations
  const cash = parseFloat(cashCompensation) || 0;
  const shares = parseFloat(numberOfShares) || 0;
  const strike = parseFloat(strikePrice) || 0;
  const fmv = parseFloat(fairMarketValue) || 0;
  
  const enabledCommonBenefitsTotal = commonBenefits
    .filter(b => b.enabled)
    .reduce((sum, b) => sum + b.amount, 0);
  
  const customBenefitsTotal = customBenefits.reduce((sum, b) => sum + b.amount, 0);
  
  const match401kValue = has401k 
    ? match401kType === "percentage" 
      ? (cash * (parseFloat(match401k) || 0)) / 100
      : (parseFloat(match401k) || 0)
    : 0;
  
  // IRS limit validations
  const exceeds401kLimit = match401kValue > IRS_LIMITS.CONTRIB_401K_TOTAL;
  
  const hsaFsaBenefit = commonBenefits.find(b => b.id === "hsa");
  const hsaFsaAmount = hsaFsaBenefit?.enabled ? hsaFsaBenefit.amount : 0;
  const exceedsHsaFsaLimit = hsaFsaAmount > IRS_LIMITS.HSA_FAMILY; // Using family limit as the maximum
  
  const totalBenefits = enabledCommonBenefitsTotal + customBenefitsTotal + match401kValue;
  
  const equityValue = hasEquity ? shares * (fmv - strike) : 0;
  const totalCompensation = cash + equityValue + totalBenefits;

  // Benchmark calculations
  const occupation = occupationId ? getOccupationById(occupationId) : undefined;
  const metroArea = metroAreaId ? getMetroAreaById(metroAreaId) : undefined;
  
  const marketSalary = occupation 
    ? getAverageSalaryForLocation(occupation, metroAreaId, regionId)
    : 0;
  
  const salaryDifference = cash - marketSalary;
  const salaryDifferencePercent = marketSalary > 0 
    ? ((salaryDifference / marketSalary) * 100)
    : 0;

  // Display job title (custom or predefined)
  const displayJobTitle = occupationId === "other" && customJobTitle 
    ? customJobTitle 
    : occupation?.title || "";

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  // Group occupations by category
  const occupationsByCategory = OCCUPATIONS.reduce((acc, occ) => {
    if (!acc[occ.category]) {
      acc[occ.category] = [];
    }
    acc[occ.category].push(occ);
    return acc;
  }, {} as Record<string, typeof OCCUPATIONS>);

  return (
    <TooltipProvider>
      <div className="min-h-screen py-12 px-4" style={{ background: 'linear-gradient(to bottom right, #F5F7FD, #E7E5E2)' }}>
        <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight" style={{ color: '#0A1F44' }}>
            Compensation Calculator
          </h1>
          <p className="text-muted-foreground text-lg">
            Calculate your total compensation package including equity and benefits
          </p>
        </div>

        {/* Location & Occupation Card */}
        <Card className="border-l-4" style={{ borderLeftColor: '#0A1F44' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
              <MapPin className="h-5 w-5" style={{ color: '#6A9FB5' }} />
              Location & Role
            </CardTitle>
            <CardDescription>
              Select your role and location to see how your compensation compares to market averages
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="occupation">Job Title</Label>
                <Select value={occupationId} onValueChange={setOccupationId}>
                  <SelectTrigger id="occupation">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(occupationsByCategory).map(([category, occs]) => (
                      <div key={category}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {category}
                        </div>
                        {occs.map((occ) => (
                          <SelectItem key={occ.id} value={occ.id}>
                            {occ.title}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
                {occupationId === "other" && (
                  <div className="pt-2">
                    <Input
                      id="custom-job-title"
                      placeholder="Enter your job title"
                      value={customJobTitle}
                      onChange={(e) => setCustomJobTitle(e.target.value)}
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="metro">Metro Area (Optional)</Label>
                <Select 
                  value={metroAreaId || "none"} 
                  onValueChange={(value) => {
                    const actualValue = value === "none" ? "" : value;
                    setMetroAreaId(actualValue);
                    if (actualValue) {
                      const metro = getMetroAreaById(actualValue);
                      if (metro) {
                        setRegionId(metro.region);
                      }
                    }
                  }}
                >
                  <SelectTrigger id="metro">
                    <SelectValue placeholder="Select metro area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">National Average</SelectItem>
                    {REGIONS.filter(r => r.id !== "national").map((region) => (
                      <div key={region.id}>
                        <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                          {region.name}
                        </div>
                        {METRO_AREAS.filter(m => m.region === region.id).map((metro) => (
                          <SelectItem key={metro.id} value={metro.id}>
                            {metro.name}, {metro.state}
                          </SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {metroArea && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Cost of Living Index:</span>
                  <span className="font-semibold">
                    {metroArea.costOfLivingIndex} 
                    <span className="text-xs text-muted-foreground ml-1">
                      ({metroArea.costOfLivingIndex > 100 ? '+' : ''}{metroArea.costOfLivingIndex - 100}% vs national avg)
                    </span>
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Living in {metroArea.name} typically costs {metroArea.costOfLivingIndex > 100 ? 'more' : 'less'} than the national average
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Cash Compensation Card */}
        <Card className="border-l-4" style={{ borderLeftColor: '#6A9FB5' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#6A9FB5' }} />
              Cash Compensation
            </CardTitle>
            <CardDescription>
              Your annual base salary before taxes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="cash">Annual Salary</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="cash"
                  type="text"
                  inputMode="numeric"
                  placeholder="150000"
                  className="pl-7"
                  value={cashCompensation}
                  onChange={(e) => {
                    const value = e.target.value;
                    // Only allow digits, empty string, or valid number format
                    if (value === "" || /^\d*\.?\d*$/.test(value)) {
                      setCashCompensation(value);
                    }
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Equity Card (Optional) */}
        <Card className="border-l-4" style={{ borderLeftColor: '#928F9A' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
                  <TrendingUp className="h-5 w-5" style={{ color: '#928F9A' }} />
                  Equity (Optional)
                </CardTitle>
                <CardDescription>
                  Include equity compensation if you receive stock options or grants
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-equity"
                  checked={hasEquity}
                  onCheckedChange={(checked) => setHasEquity(checked as boolean)}
                />
                <Label htmlFor="has-equity" className="cursor-pointer font-normal">
                  I receive equity
                </Label>
              </div>
            </div>
          </CardHeader>
          {hasEquity && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shares">Number of Shares</Label>
                  <Input
                    id="shares"
                    type="text"
                    inputMode="numeric"
                    placeholder="10000"
                    value={numberOfShares}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setNumberOfShares(value);
                      }
                    }}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="strike">Strike Price (per share)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      id="strike"
                      type="text"
                      inputMode="decimal"
                      placeholder="1.00"
                      className="pl-7"
                      value={strikePrice}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value === "" || /^\d*\.?\d*$/.test(value)) {
                          setStrikePrice(value);
                        }
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fmv">Fair Market Value (per share)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="fmv"
                    type="text"
                    inputMode="decimal"
                    placeholder="5.00"
                    className="pl-7"
                    value={fairMarketValue}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setFairMarketValue(value);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Current value of each share (from latest 409A valuation or last funding round)
                </p>
              </div>
            </CardContent>
          )}
        </Card>

        {/* 401(k) Card (Optional) */}
        <Card className="border-l-4" style={{ borderLeftColor: '#6A9FB5' }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
                  <DollarSign className="h-5 w-5" style={{ color: '#6A9FB5' }} />
                  401(k) Match (Optional)
                </CardTitle>
                <CardDescription>
                  Include employer 401(k) matching contributions
                </CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="has-401k"
                  checked={has401k}
                  onCheckedChange={(checked) => setHas401k(checked as boolean)}
                />
                <Label htmlFor="has-401k" className="cursor-pointer font-normal">
                  I receive 401(k) match
                </Label>
              </div>
            </div>
          </CardHeader>
          {has401k && (
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg">
                <Label className="text-sm font-medium">Match Type:</Label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="match-percentage"
                      checked={match401kType === "percentage"}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setMatch401kType("percentage");
                          setMatch401k("");
                        }
                      }}
                    />
                    <Label htmlFor="match-percentage" className="cursor-pointer font-normal">
                      Percentage of salary
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="match-amount"
                      checked={match401kType === "amount"}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setMatch401kType("amount");
                          setMatch401k("");
                        }
                      }}
                    />
                    <Label htmlFor="match-amount" className="cursor-pointer font-normal">
                      Fixed dollar amount
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="401k-match">
                  {match401kType === "percentage" ? "Match Percentage" : "Annual Employer Match"}
                </Label>
                <div className="relative">
                  {match401kType === "amount" && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                  )}
                  {match401kType === "percentage" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  )}
                  <Input
                    id="401k-match"
                    type="text"
                    inputMode={match401kType === "percentage" ? "numeric" : "numeric"}
                    placeholder={match401kType === "percentage" ? "5" : "7500"}
                    className={match401kType === "amount" ? "pl-7" : "pr-7"}
                    value={match401k}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value === "" || /^\d*\.?\d*$/.test(value)) {
                        setMatch401k(value);
                      }
                    }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {match401kType === "percentage" 
                    ? `Enter the percentage of your salary that your employer matches (e.g., 5 for 5%)${cash > 0 ? `. This equals ${formatCurrency(match401kValue)} annually.` : ""}`
                    : "The total amount your employer contributes to your 401(k) annually"}
                </p>
                {exceeds401kLimit && (
                  <div className="flex items-start gap-2 p-3 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                    <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-amber-800 dark:text-amber-200">
                      <strong>Warning:</strong> This 401(k) contribution ({formatCurrency(match401kValue)}) exceeds the IRS annual limit of {formatCurrency(IRS_LIMITS.CONTRIB_401K_TOTAL)} for combined employee and employer contributions ({IRS_LIMITS.YEAR}).
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Common Benefits Card */}
        <Card className="border-l-4" style={{ borderLeftColor: '#928F9A' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
              <DollarSign className="h-5 w-5" style={{ color: '#928F9A' }} />
              Employer-Paid Benefits (Optional)
            </CardTitle>
            <CardDescription>
              Select any additional benefits you receive and adjust the annual values
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
                {commonBenefits.map((benefit) => (
                  <div
                    key={benefit.id}
                    className="flex items-start space-x-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <Checkbox
                      id={`common-${benefit.id}`}
                      checked={benefit.enabled}
                      onCheckedChange={(checked) =>
                        toggleCommonBenefit(benefit.id, checked as boolean)
                      }
                      className="mt-1"
                    />
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <Label
                              htmlFor={`common-${benefit.id}`}
                              className={`cursor-pointer ${!benefit.enabled && "text-muted-foreground"}`}
                            >
                              {benefit.name}
                            </Label>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground transition-colors"
                                  onClick={(e) => e.preventDefault()}
                                >
                                  <HelpCircle className="h-3.5 w-3.5" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="right" className="max-w-xs">
                                <p className="text-sm">{benefit.tooltipEstimate}</p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {benefit.description}
                          </p>
                        </div>
                        <div className="w-32">
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                              $
                            </span>
                            <Input
                              type="text"
                              inputMode="numeric"
                              placeholder="0"
                              className="h-8 pl-5 text-sm"
                              value={benefit.enabled ? (benefit.amount === 0 ? "" : String(benefit.amount)) : ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                  handleCommonBenefitAmountChange(
                                    benefit.id,
                                    val
                                  );
                                }
                              }}
                              onBlur={(e) => {
                                // Ensure we have a valid number on blur
                                const val = e.target.value.trim();
                                if (val === "" || val === "-") {
                                  updateCommonBenefitAmount(benefit.id, 0);
                                }
                              }}
                              disabled={!benefit.enabled}
                            />
                          </div>
                        </div>
                      </div>
                      {benefit.id === "hsa" && benefit.enabled && exceedsHsaFsaLimit && (
                        <div className="flex items-start gap-2 p-2 mt-2 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                          <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-amber-800 dark:text-amber-200">
                            <strong>Warning:</strong> This exceeds the IRS annual HSA family limit of {formatCurrency(IRS_LIMITS.HSA_FAMILY)} (individual: {formatCurrency(IRS_LIMITS.HSA_INDIVIDUAL)}) or FSA limit of {formatCurrency(IRS_LIMITS.FSA)} ({IRS_LIMITS.YEAR}).
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            {/* Custom Benefits Section */}
            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">Custom Benefits</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addCustomBenefit}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add Custom
                </Button>
              </div>

              {customBenefits.length > 0 && (
                <div className="space-y-3">
                  {customBenefits.map((benefit) => (
                    <div
                      key={benefit.id}
                      className="grid grid-cols-1 md:grid-cols-[2fr,1fr,auto] gap-2 items-end p-3 rounded-lg border bg-card"
                    >
                      <div className="space-y-2">
                        <Label htmlFor={`benefit-name-${benefit.id}`}>
                          Benefit Name
                        </Label>
                        <Input
                          id={`benefit-name-${benefit.id}`}
                          placeholder="e.g., Pet Insurance"
                          value={benefit.name}
                          onChange={(e) =>
                            updateCustomBenefitName(benefit.id, e.target.value)
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`benefit-amount-${benefit.id}`}>
                          Annual Value
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            $
                          </span>
                          <Input
                            id={`benefit-amount-${benefit.id}`}
                            type="text"
                            inputMode="numeric"
                            placeholder="0"
                            className="pl-7"
                            value={benefit.amount === 0 ? "" : String(benefit.amount)}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (val === "" || /^\d*\.?\d*$/.test(val)) {
                                handleCustomBenefitAmountChange(
                                  benefit.id,
                                  val
                                );
                              }
                            }}
                            onBlur={(e) => {
                              // Ensure we have a valid number on blur
                              const val = e.target.value.trim();
                              if (val === "" || val === "-") {
                                updateCustomBenefitAmount(benefit.id, 0);
                              }
                            }}
                          />
                        </div>
                      </div>

                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCustomBenefit(benefit.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Card */}
        <Card className="border-2" style={{ borderColor: '#0A1F44', backgroundColor: '#F5F7FD' }}>
          <CardHeader>
            <CardTitle style={{ color: '#0A1F44' }}>Total Compensation Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Cash Compensation</span>
                <span className="font-semibold">{formatCurrency(cash)}</span>
              </div>
              
              <div className="flex justify-between items-center py-2 border-t">
                <div className="space-y-1">
                  <span className="text-muted-foreground">Equity Value</span>
                  {shares > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {shares.toLocaleString()} shares × ({formatCurrency(fmv)} - {formatCurrency(strike)})
                    </p>
                  )}
                </div>
                <span className="font-semibold">{formatCurrency(equityValue)}</span>
              </div>

              {match401kValue > 0 && (
                <div className="flex justify-between items-center py-2 border-t">
                  <span className="text-muted-foreground">401(k) Match</span>
                  <span className="font-semibold">{formatCurrency(match401kValue)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-2 border-t">
                <span className="text-muted-foreground">Employer-Paid Benefits</span>
                <span className="font-semibold">{formatCurrency(enabledCommonBenefitsTotal + customBenefitsTotal)}</span>
              </div>

              {/* Show enabled common benefits */}
              {commonBenefits.filter(b => b.enabled && b.amount > 0).length > 0 && (
                <div className="pl-4 space-y-1 pb-2">
                  {commonBenefits
                    .filter(b => b.enabled && b.amount > 0)
                    .map((benefit) => (
                      <div
                        key={benefit.id}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>• {benefit.name}</span>
                        <span>{formatCurrency(benefit.amount)}</span>
                      </div>
                    ))}
                </div>
              )}

              {/* Show custom benefits */}
              {customBenefits.filter(b => b.amount > 0).length > 0 && (
                <div className="pl-4 space-y-1 pb-2">
                  {customBenefits
                    .filter(b => b.amount > 0)
                    .map((benefit) => (
                      <div
                        key={benefit.id}
                        className="flex justify-between text-sm text-muted-foreground"
                      >
                        <span>• {benefit.name || "Unnamed benefit"}</span>
                        <span>{formatCurrency(benefit.amount)}</span>
                      </div>
                    ))}
                </div>
              )}

              <div className="flex justify-between items-center py-4 border-t-2 border-primary/20">
                <span className="text-xl font-bold">Total Compensation</span>
                <span className="text-2xl font-bold text-primary">
                  {formatCurrency(totalCompensation)}
                </span>
              </div>
            </div>

            {/* Visualization */}
            {totalCompensation > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="font-semibold text-sm">Compensation Mix</h4>
                <div className="space-y-2">
                  {cash > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Cash</span>
                        <span className="text-muted-foreground">
                          {((cash / totalCompensation) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500"
                          style={{ width: `${(cash / totalCompensation) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {equityValue > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Equity</span>
                        <span className="text-muted-foreground">
                          {((equityValue / totalCompensation) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-green-500"
                          style={{
                            width: `${(equityValue / totalCompensation) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}

                  {totalBenefits > 0 && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Benefits</span>
                        <span className="text-muted-foreground">
                          {((totalBenefits / totalCompensation) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-500"
                          style={{
                            width: `${(totalBenefits / totalCompensation) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Market Comparison Card */}
        {occupation && marketSalary > 0 && cash > 0 && (
          <Card className="border-2" style={{ borderColor: '#6A9FB5' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#0A1F44' }}>
                <Briefcase className="h-5 w-5" style={{ color: '#6A9FB5' }} />
                Market Comparison
              </CardTitle>
              <CardDescription>
                How your compensation compares to market averages{displayJobTitle && ` for ${displayJobTitle}`}
                {metroArea && ` in ${metroArea.name}`}
                {occupationId === "other" && !customJobTitle && " (enter your job title above for personalized comparison)"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Your Cash Salary
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(cash)}</div>
                </div>

                <div className="p-4 rounded-lg bg-muted/50 space-y-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Market Average
                  </div>
                  <div className="text-2xl font-bold">{formatCurrency(marketSalary)}</div>
                </div>

                <div className={`p-4 rounded-lg space-y-1 ${
                  salaryDifference >= 0 
                    ? 'bg-green-50 dark:bg-green-950/20' 
                    : 'bg-red-50 dark:bg-red-950/20'
                }`}>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide">
                    Difference
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-2xl font-bold ${
                      salaryDifference >= 0 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {formatPercent(salaryDifferencePercent)}
                    </div>
                    {salaryDifference >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatCurrency(Math.abs(salaryDifference))} {salaryDifference >= 0 ? 'above' : 'below'} market
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900">
                <div className="flex gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                      {salaryDifference >= 0 
                        ? "You're earning above the market average! 🎉" 
                        : "Your base salary is below market average"}
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {salaryDifference >= 0 
                        ? `Your cash compensation is ${formatPercent(salaryDifferencePercent)} higher than the ${occupationId === "other" ? "regional average" : `typical ${displayJobTitle}`}${metroArea ? ` in ${metroArea.name}` : ''}.`
                        : `Consider negotiating or focusing on total comp (equity + benefits). The ${occupationId === "other" ? "regional average" : "market average"} is ${formatCurrency(marketSalary)}${metroArea ? ` for ${metroArea.name}` : ''}.`}
                    </p>
                  </div>
                </div>
              </div>

              {metroArea && metroArea.costOfLivingIndex !== 100 && (
                <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      Cost of Living Adjustment
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-300">
                      {metroArea.name} has a cost of living index of {metroArea.costOfLivingIndex}{' '}
                      ({metroArea.costOfLivingIndex > 100 ? '+' : ''}{metroArea.costOfLivingIndex - 100}% vs national average).
                      Your {formatCurrency(cash)} has roughly the same purchasing power as{' '}
                      <span className="font-semibold">
                        {formatCurrency(cash / (metroArea.costOfLivingIndex / 100))}
                      </span>{' '}
                      in an average-cost US city.
                    </p>
                    <p className="text-xs text-amber-600 dark:text-amber-400 pt-2 border-t border-amber-200 dark:border-amber-800">
                      <strong>Source:</strong>{' '}
                      <a
                        href={metroArea.costOfLivingSource.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-amber-800 dark:hover:text-amber-200 inline-flex items-center gap-1"
                      >
                        {metroArea.costOfLivingSource.name}
                        <svg
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Data Sources Footer */}
        <Card className="bg-muted/30">
          <CardContent className="py-6">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Data Sources
              </h4>
              <p className="text-sm text-muted-foreground">
                Salary benchmarks and compensation data are based on the following sources:
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.bls.gov/bls/blswage.htm"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    BLS - Overview of Wage Data by Area and Occupation
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.coli.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    Council for Community and Economic Research (C2ER) - Cost of Living Index
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.bea.gov/data/prices-inflation/regional-price-parities-state-and-metro-area"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    U.S. Bureau of Economic Analysis - Regional Price Parities
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.bls.gov/oes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline inline-flex items-center gap-1"
                  >
                    U.S. Bureau of Labor Statistics - Occupational Employment and Wage Statistics (OEWS)
                    <svg
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                      />
                    </svg>
                  </a>
                </li>
              </ul>
              <p className="text-xs text-muted-foreground pt-2 border-t">
                <strong>Disclaimer:</strong> This calculator provides estimates based on aggregated market data 
                and should be used for informational purposes only. Actual compensation varies by company, 
                experience level, and individual circumstances. Always verify with official sources and consult 
                with professionals for specific advice.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center py-6">
          <p className="text-sm text-muted-foreground">
            Vibecoded with ❤️ by{" "}
            <a
              href="https://www.linkedin.com/in/aubrey-brueckner/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Aubrey
            </a>
            . Have feedback?{" "}
            <a
              href="mailto:founders@slipstream.team"
              className="text-primary hover:underline font-medium"
            >
              Get in touch
            </a>
            .
          </p>
        </div>
        </div>
    </div>
    </TooltipProvider>
  );
}

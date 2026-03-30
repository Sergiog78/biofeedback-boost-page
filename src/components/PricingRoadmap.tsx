import { useState, useEffect } from "react";
import { getCurrentTier, PRICING_TIERS, formatPrice, type CurrentTierInfo } from "@/lib/pricing-tiers";
import { Check, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface PricingRoadmapProps {
  compact?: boolean;
}

const PricingRoadmap = ({ compact = false }: PricingRoadmapProps) => {
  const [tierInfo, setTierInfo] = useState<CurrentTierInfo>(getCurrentTier());

  useEffect(() => {
    const interval = setInterval(() => {
      setTierInfo(getCurrentTier());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { tier: currentTier, nextTier, timeRemaining, isAfterCourse } = tierInfo;

  return (
    <div className="space-y-4">
      {/* Tier stepper */}
      <div className="space-y-0">
        {PRICING_TIERS.map((t, i) => {
          const isPast = t.endDate.getTime() <= new Date().getTime() && !isAfterCourse;
          const isCurrent = t.index === currentTier.index;
          const isFuture = !isPast && !isCurrent;

          return (
            <div key={i} className="flex items-stretch gap-3">
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border-2 transition-all",
                    isPast && "bg-muted border-muted-foreground/30 text-muted-foreground",
                    isCurrent && "bg-accent border-accent text-accent-foreground scale-110 shadow-md",
                    isFuture && "bg-background border-border text-muted-foreground"
                  )}
                >
                  {isPast ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                {i < PRICING_TIERS.length - 1 && (
                  <div
                    className={cn(
                      "w-0.5 flex-1 min-h-[1.5rem]",
                      isPast ? "bg-muted-foreground/30" : isCurrent ? "bg-accent/50" : "bg-border"
                    )}
                  />
                )}
              </div>

              {/* Tier content */}
              <div className={cn(
                "flex-1 pb-4 transition-all",
                compact ? "pb-3" : "pb-5"
              )}>
                <div className={cn(
                  "rounded-lg px-3 py-2 transition-all",
                  isCurrent && "bg-accent/10 border border-accent/20",
                  isPast && "opacity-60"
                )}>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        isCurrent ? "text-accent" : "text-muted-foreground"
                      )}>
                        {t.label}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] bg-accent text-accent-foreground px-1.5 py-0.5 rounded-full font-bold animate-pulse">
                          ORA
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isPast ? (
                        <span className="text-sm text-muted-foreground line-through">
                          €{t.basePrice} + IVA
                        </span>
                      ) : (
                        <span className={cn(
                          "font-semibold",
                          isCurrent ? "text-lg text-foreground" : "text-sm text-muted-foreground"
                        )}>
                          €{t.basePrice} + IVA
                        </span>
                      )}
                    </div>
                  </div>
                  {!compact && (
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      €{t.basePrice} + IVA 22%
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Countdown */}
      {nextTier && !isAfterCourse && timeRemaining.totalMs > 0 && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-accent uppercase tracking-wide">
              Il prezzo aumenta tra
            </span>
          </div>
          <div className="grid grid-cols-4 gap-2 text-center">
            {[
              { value: timeRemaining.days, label: "Giorni" },
              { value: timeRemaining.hours, label: "Ore" },
              { value: timeRemaining.minutes, label: "Min" },
              { value: timeRemaining.seconds, label: "Sec" },
            ].map(({ value, label }) => (
              <div key={label} className="bg-background rounded-md py-2 border">
                <div className="text-xl font-bold text-foreground tabular-nums">
                  {String(value).padStart(2, "0")}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  {label}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <span>Prossimo prezzo:</span>
            <span className="font-semibold text-foreground">€{nextTier.basePrice} + IVA</span>
            <ArrowRight className="w-3 h-3" />
          </div>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            👉 Dopo questo aumento, non sarà più possibile accedere a questo prezzo
          </p>
        </div>
      )}
    </div>
  );
};

export default PricingRoadmap;

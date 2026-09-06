import { useEffect, useRef, useState } from "react";
import { Mic, Square } from "lucide-react";
import { cn } from "@/lib/utils";

const MOCK_TRANSCRIPT = [
  "I need to request",
  "I need to request prior authorisation",
  "I need to request prior authorisation for a gallbladder",
  "I need to request prior authorisation for a gallbladder removal scheduled next Tuesday.",
];

export function VoiceInput({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [listening, setListening] = useState(false);
  const [step, setStep] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!listening) return;
    timer.current = setInterval(() => {
      setStep((s) => {
        const next = Math.min(s + 1, MOCK_TRANSCRIPT.length);
        if (next === MOCK_TRANSCRIPT.length) {
          setListening(false);
          onTranscript(MOCK_TRANSCRIPT[MOCK_TRANSCRIPT.length - 1]);
        }
        return next;
      });
    }, 900);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [listening, onTranscript]);

  const partial = step > 0 ? MOCK_TRANSCRIPT[Math.min(step, MOCK_TRANSCRIPT.length) - 1] : "";

  return (
    <div className="flex items-start gap-4 rounded-md border border-border bg-card p-4">
      <button
        type="button"
        aria-label={listening ? "Stop dictation" : "Start dictation"}
        onClick={() => {
          setStep(0);
          setListening((v) => !v);
        }}
        className={cn(
          "relative grid size-11 shrink-0 place-items-center rounded-full transition-colors",
          listening ? "bg-risk text-risk-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
        )}
      >
        {listening ? <Square className="size-4" aria-hidden /> : <Mic className="size-4" aria-hidden />}
        {listening ? <span className="mic-ring absolute inset-0 rounded-full bg-risk/40" aria-hidden /> : null}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[13px] font-semibold">Voice request</span>
          <span className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
            {listening ? "Listening" : "Mocked transcription"}
          </span>
        </div>
        <p className="mt-1.5 min-h-[36px] text-[13px] text-muted-foreground">
          {partial || "Dictate your request — speech-to-text is simulated until the backend exists."}
        </p>
        {listening ? (
          <div className="mt-2 flex items-end gap-1" aria-hidden>
            {[3, 6, 4, 8, 5, 7, 3, 6].map((h, i) => (
              <span
                key={i}
                className="w-1 animate-pulse rounded-full bg-primary/70"
                style={{ height: `${h * 3}px`, animationDelay: `${i * 90}ms` }}
              />
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}

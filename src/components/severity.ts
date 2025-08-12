export type Polarity = "goodHigh" | "goodLow" | "neutral";

/** Map any label to a tone token, respecting domain polarity. */
export function getBandTone(label: string, polarity: Polarity = "goodHigh"): "danger"|"warn"|"neutral"|"good"|"best" {
  const l = label.trim().toLowerCase();

  const has = (xs: string[]) => xs.some(k => l === k || l.includes(k));

  const LOW      = ["extremely low","very low","low","severe","severely elevated","clinically significant"];
  const LOWISH   = ["low average","borderline","below average","moderate","moderately elevated"];
  const AVERAGE  = ["average","typical","within normal limits","wnl","normal"];
  const HIGHISH  = ["high average","above average","mild","mildly elevated"];
  const HIGH     = ["very high","extremely high","superior","very superior"];

  const is = (group: string[]) => has(group);

  let tone: "danger"|"warn"|"neutral"|"good"|"best" = "neutral";

  if (is(LOW))      tone = (polarity === "goodHigh") ? "danger" : "best";
  else if (is(LOWISH)) tone = (polarity === "goodHigh") ? "warn"   : "good";
  else if (is(AVERAGE)) tone = "neutral";
  else if (is(HIGHISH)) tone = (polarity === "goodHigh") ? "good"  : "warn";
  else if (is(HIGH))    tone = (polarity === "goodHigh") ? "best"  : "danger";

  return tone;
}

/** Final background color (alpha tint) for a chip */
export function getBandColor(label: string, polarity: Polarity = "goodHigh"): string {
  const tone = getBandTone(label, polarity);
  const map: Record<ReturnType<typeof getBandTone>, string> = {
    danger:  "var(--tone-danger)",
    warn:    "var(--tone-warn)",
    neutral: "var(--tone-neutral)",
    good:    "var(--tone-good)",
    best:    "var(--tone-best)",
  };
  return map[tone];
}
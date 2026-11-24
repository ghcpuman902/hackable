import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";
import { generateReportMarkdown, reportWhitelist } from "@/lib/reason";

/* Public samples only. Never read the private _agent goldens here (Mangle t157u). */
const people = {
  "tim-cook": { name: "Tim Cook", directory: "eval/golden" },
  "jensen-huang": { name: "Jensen Huang", directory: "eval/golden" },
};

const personId = z.enum(["tim-cook", "jensen-huang"]);
const compareRequest = z.object({ person: personId });
const rawReport = z.object({
  items: z.array(z.object({
    source_url: z.string().nullable().optional(),
    isThisPerson: z.boolean(),
  })),
});

function fixturePath(person: z.infer<typeof personId>, suffix: string) {
  return join(process.cwd(), people[person].directory, person + suffix);
}

async function readFixture(person: z.infer<typeof personId>, suffix: string) {
  try {
    return await readFile(fixturePath(person, suffix), "utf8");
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") return null;
    throw error;
  }
}

function evaluateReport(markdown: string, raw: z.infer<typeof rawReport>) {
  const urls = raw.items.flatMap((item) => item.source_url ? [item.source_url] : []);
  const namesakes = raw.items.flatMap((item) =>
    item.isThisPerson === false && item.source_url ? [item.source_url] : [],
  );
  const allowed = new Set([...urls, ...reportWhitelist()]);
  const links = [...markdown.matchAll(/(?:https?:\/\/[^\s<>]+|(?<=\]\()<?[^\s)>]+|(?<=\]: )<?[^\s>\[]+)/g)].map(([url]) => {
    let trimmed = url.replace(/^</, "").replace(/[.,;!?]+$/, "");
    while (trimmed.endsWith(")") && trimmed.split(")").length > trimmed.split("(").length) {
      trimmed = trimmed.slice(0, -1);
    }
    return trimmed;
  });
  const cards = [...markdown.matchAll(/^ {0,3}>\s*\[!(WARNING|CAUTION|TIP|NOTE|IMPORTANT)\]/gim)];
  const blocks = markdown
    .replace(/^ {0,3}\[[^\]\r\n]+\]:[^\r\n]*$/gm, "")
    .trim()
    .split(/\r?\n[ \t]*\r?\n/)
    .filter(Boolean);
  return [
    { label: "Approved links only", pass: links.every((url) => allowed.has(url)) },
    { label: "Namesake links excluded", pass: namesakes.every((url) => !markdown.includes(url)) },
    { label: "No headings", pass: !/^ {0,3}#{1,6}(?:\s|$)|^\S.*\n {0,3}(?:=+|-+)\s*$/m.test(markdown) },
    { label: "At most three cards", pass: cards.length <= 3 },
    { label: "Tip present", pass: cards.some((card) => card[1].toUpperCase() === "TIP") },
    { label: "At most six blocks", pass: blocks.length <= 6 },
    { label: "No dashes", pass: !/[–—]|\S[ \t]+-[ \t]+\S/.test(markdown) },
  ];
}

export async function loadGoldenReports() {
  const reports = await Promise.all(personId.options.map(async (person) => {
    const [raw, expected] = await Promise.all([
      readFixture(person, ".raw.json"),
      readFixture(person, ".expected.md"),
    ]);
    if (raw === null) return null;
    const golden = expected ?? (await readFixture(person, ".golden.md"))
      ?.replace(/^# Grader notes[^]*$/m, "").trimEnd();
    if (golden == null) return null;

    let evidence;
    try {
      evidence = rawReport.parse(JSON.parse(raw));
    } catch {
      throw new Error("Invalid compare fixture.");
    }

    return {
      person,
      name: people[person].name,
      golden,
      checks: evaluateReport(golden, evidence),
    };
  }));
  return reports.filter((report) => report !== null);
}

export async function POST(request: Request) {
  const body = compareRequest.safeParse(await request.json().catch(() => null));
  if (!body.success) return Response.json({ error: "Unknown person." }, { status: 400 });

  try {
    const { person } = body.data;
    const file = await readFixture(person, ".raw.json");
    if (file === null) return Response.json({ error: "Report unavailable." }, { status: 404 });

    const raw: unknown = JSON.parse(file);
    const evidence = rawReport.parse(raw);
    const markdown = (await generateReportMarkdown(raw)).trim();
    if (markdown) {
      return Response.json({ markdown, checks: evaluateReport(markdown, evidence) }, {
        headers: { "Cache-Control": "no-store" },
      });
    }
  } catch {
    // Keep fixture contents and provider errors out of logs and responses.
  }

  return Response.json({ error: "Could not generate the report." }, { status: 502 });
}

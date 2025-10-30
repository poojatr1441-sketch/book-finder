// src/lib/resourceSearch.ts
export type ResourceTypeKey =
  | "study_guide"
  | "textbook"
  | "lecture_notes"
  | "past_papers"
  | "problem_sets"
  | "reference"
  | "open_textbook"
  | "case_studies";

type ResourceMapEntry = {
  slugs: string[]; // preferred subject slugs to try with subject=...
  keywords: string[]; // keywords used in full-text q= fallback
};

export const RESOURCE_MAP: Record<ResourceTypeKey, ResourceMapEntry> = {
  study_guide: {
    slugs: ["study guides", "study-guides"],
    keywords: ["study guide", "revision guide", "exam guide", "study notes"],
  },
  textbook: {
    slugs: ["textbooks", "text-book", "text books"],
    keywords: ["textbook", "coursebook", "introduction to", "for students"],
  },
  lecture_notes: {
    slugs: ["lecture notes", "lecture-notes"],
    keywords: ["lecture notes", "class notes", "course notes", "lecture"],
  },
  past_papers: {
    slugs: ["past papers", "exam papers", "previous year papers"],
    keywords: [
      "past papers",
      "exam paper",
      "question paper",
      "previous year paper",
    ],
  },
  problem_sets: {
    slugs: ["problem sets", "exercise problems"],
    keywords: [
      "problem set",
      "exercise problems",
      "worked problems",
      "practice problems",
    ],
  },
  reference: {
    slugs: ["reference", "handbooks", "dictionaries", "encyclopedias"],
    keywords: ["reference", "handbook", "dictionary", "encyclopedia"],
  },
  open_textbook: {
    slugs: ["open textbooks", "open-textbooks", "open educational resources"],
    keywords: [
      "open textbook",
      "open educational resources",
      "open access textbook",
    ],
  },
  case_studies: {
    slugs: ["case studies", "case-studies"],
    keywords: [
      "case study",
      "case studies",
      "business case study",
      "clinical case",
    ],
  },
};

export type SearchOptions = {
  subjectSlug?: string; // UI subject selection (e.g., "science", "history")
  limit?: number; // how many results to fetch per attempt
  minResults?: number; // minimum acceptable result count before stopping
  maxAttempts?: number; // safety cap on attempts
  clientSideFilter?: (item: any) => boolean; // optional heuristic filter
};

/**
 * Build an ordered list of query strings to try for the given resource type + subject.
 * Each item is an object that describes the query and how to interpret it.
 */
export function buildQueryAttempts(
  resourceType: ResourceTypeKey,
  opts: SearchOptions = {}
) {
  const map = RESOURCE_MAP[resourceType];
  const subject = opts.subjectSlug?.trim();
  const attempts: {
    type: "subject" | "keyword";
    q: string;
    description: string;
  }[] = [];

  // First: subject-first attempts combining resource slugs with subject if provided
  for (const slug of map.slugs) {
    if (subject) {
      // Try combining resource slug and subject as subject filters
      attempts.push({
        type: "subject",
        q: `subject:${encodeURIComponent(slug)}+subject:${encodeURIComponent(
          subject
        )}`,
        description: `subject:${slug} AND subject:${subject}`,
      });
    }
    // Try resource slug alone as subject
    attempts.push({
      type: "subject",
      q: `subject:${encodeURIComponent(slug)}`,
      description: `subject:${slug}`,
    });
  }

  // Then: keyword fallbacks (q= full text)
  const keywordPhrase = map.keywords.map((k) => `"${k}"`).join(" OR ");
  if (subject) {
    attempts.push({
      type: "keyword",
      q: `${encodeURIComponent(`${keywordPhrase} ${subject}`)}`,
      description: `q: (${map.keywords.join(" OR ")}) ${subject}`,
    });
    attempts.push({
      type: "keyword",
      q: `${encodeURIComponent(`${keywordPhrase}`)}`,
      description: `q: (${map.keywords.join(" OR ")})`,
    });
  } else {
    attempts.push({
      type: "keyword",
      q: `${encodeURIComponent(`${keywordPhrase}`)}`,
      description: `q: (${map.keywords.join(" OR ")})`,
    });
  }

  return attempts;
}

/**
 * Run the smart search: try queries in order and return the first result set meeting minResults.
 * Falls back to last attempt's results if none reach minResults.
 */
export async function runSmartSearch(
  resourceType: ResourceTypeKey,
  opts: SearchOptions = {}
) {
  const attempts = buildQueryAttempts(resourceType, opts);
  const limit = opts.limit ?? 20;
  const minResults = opts.minResults ?? 6;
  const maxAttempts = Math.min(
    opts.maxAttempts ?? attempts.length,
    attempts.length
  );

  let lastResults: any[] = [];

  for (let i = 0; i < maxAttempts; i++) {
    const a = attempts[i];
    // build Open Library search URL
    // subject queries use /search.json?subject=... (Open Library accepts multiple subject params)
    let url = "";
    if (a.type === "subject") {
      // a.q already holds encoded "subject:slug" pairs joined by +; convert to &subject=slug style
      const parts = decodeURIComponent(a.q)
        .split("+")
        .map((p) => p.replace(/^subject:/, ""));
      const params = new URLSearchParams();
      for (const p of parts) params.append("subject", p);
      params.set("limit", String(limit));
      url = `https://openlibrary.org/search.json?${params.toString()}`;
    } else {
      // keyword q: use q=...
      const params = new URLSearchParams();
      params.set("q", decodeURIComponent(a.q));
      params.set("limit", String(limit));
      url = `https://openlibrary.org/search.json?${params.toString()}`;
    }

    try {
      const res = await fetch(url);
      if (!res.ok) {
        lastResults = [];
        continue;
      }
      const data = await res.json();
      let docs: any[] = Array.isArray(data.docs) ? data.docs : [];

      // optional client-side heuristic filtering
      if (opts.clientSideFilter) docs = docs.filter(opts.clientSideFilter);

      lastResults = docs;

      if (docs.length >= minResults) {
        return { docs, attempt: i + 1, description: a.description, url };
      }

      // small delay between attempts to avoid rapid-fire requests (100-220ms)
      await new Promise((r) => setTimeout(r, 120 + i * 30));
    } catch (e) {
      // on network error continue to next attempt
      lastResults = [];
      continue;
    }
  }

  // fallback: return whatever the last attempt produced (even if empty)
  return {
    docs: lastResults,
    attempt: maxAttempts,
    description: "fallback",
    url: undefined,
  };
}

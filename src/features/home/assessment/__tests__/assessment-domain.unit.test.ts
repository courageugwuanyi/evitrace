import { describe, expect, it, vi } from "vitest";
import {
  triggerAssessmentPdfDownload,
  type Assessment,
} from "@/features/home/assessment/assessment-domain";

function makeAssessmentWithMaliciousInput(): Assessment {
  return {
    id: `a-1"><script>alert("id")</script>`,
    dateCompleted: "2026-06-28T12:00:00.000Z",
    reviewPeriod: `Q2 <img src=x onerror=alert("period")>`,
    status: "Finalized",
    engineerName: `Eve <script>alert("eng")</script>`,
    managerName: `Mallory <svg onload=alert("mgr")>`,
    overallReadinessScore: 77,
    oneOnOneTopics: [],
    categories: [
      {
        categoryId: "cat-1",
        categoryName: `Security <script>alert("cat")</script>`,
        summary: "",
        categoryCurrentAvg: 3,
        categoryTarget: 4,
        questions: [
          {
            questionId: "q-1",
            questionText: `Q <img src=x onerror=alert("q")>`,
            previousScore: 2,
            currentScore: 3,
            targetScore: 4,
            justification: "",
            attachedEvidenceIds: [],
          },
        ],
      },
    ],
  };
}

describe("triggerAssessmentPdfDownload", () => {
  it("escapes dynamic HTML before writing printable document", () => {
    const write = vi.fn();
    const printable = {
      document: {
        write,
        close: vi.fn(),
      },
      focus: vi.fn(),
      print: vi.fn(),
    };
    const previousWindow = (globalThis as { window?: unknown }).window;
    const openSpy = vi.fn().mockReturnValue(printable as unknown as Window);
    (globalThis as { window: { open: typeof openSpy } }).window = {
      open: openSpy,
    };

    triggerAssessmentPdfDownload(makeAssessmentWithMaliciousInput());

    expect(openSpy).toHaveBeenCalled();
    expect(write).toHaveBeenCalledTimes(1);

    const html = String(write.mock.calls[0]?.[0] ?? "");
    expect(html).not.toContain(`<script>alert("eng")</script>`);
    expect(html).not.toContain(`<img src=x onerror=alert("q")>`);
    expect(html).toContain("Eve &lt;script&gt;alert(&quot;eng&quot;)&lt;/script&gt;");
    expect(html).toContain("Q &lt;img src=x onerror=alert(&quot;q&quot;)&gt;");
    if (previousWindow === undefined) {
      delete (globalThis as { window?: unknown }).window;
    } else {
      (globalThis as { window: unknown }).window = previousWindow;
    }
  });
});

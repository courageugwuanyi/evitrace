import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth";
import type { Database } from "@/lib/database.types";
import { supabase } from "@/lib/supabase";

export type UnifiedFramework = {
  id: string;
  name: string;
  matrix: unknown;
  categories: string[];
  subcategoriesMap: Record<string, string[]>;
  isSystemDefault?: boolean;
};

type FrameworkContextValue = {
  currentFramework: UnifiedFramework | null;
  categories: string[];
  getQuestionsForCategory: (categoryName: string) => string[];
  isLoading: boolean;
};

const FrameworkContext = createContext<FrameworkContextValue | null>(null);

function cleanText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function toCategoryLabel(key: string): string {
  const normalized = key.replace(/[_-]+/g, " ").trim();
  if (!normalized) return "";
  return normalized
    .split(/\s+/)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ");
}

function uniqueStrings(values: string[]): string[] {
  const seen = new Set<string>();
  const unique: string[] = [];
  for (const value of values) {
    const next = value.trim();
    if (!next) continue;
    const lower = next.toLowerCase();
    if (seen.has(lower)) continue;
    seen.add(lower);
    unique.push(next);
  }
  return unique;
}

function normalizeCategoryRootMatrix(matrix: Record<string, unknown>) {
  const rawCategories = matrix.categories;
  if (!rawCategories || typeof rawCategories !== "object" || Array.isArray(rawCategories)) return null;

  const subcategoriesMap: Record<string, string[]> = {};
  const categories: string[] = [];

  for (const [rawName, payload] of Object.entries(rawCategories as Record<string, unknown>)) {
    const categoryName = cleanText(rawName);
    if (!categoryName) continue;
    categories.push(categoryName);

    if (Array.isArray(payload)) {
      subcategoriesMap[categoryName] = uniqueStrings(payload.map((item) => cleanText(item)));
      continue;
    }

    if (payload && typeof payload === "object") {
      const rawItems = (payload as Record<string, unknown>).items;
      const items = Array.isArray(rawItems)
        ? uniqueStrings(rawItems.map((item) => cleanText(item)))
        : [];
      subcategoriesMap[categoryName] = items;
      continue;
    }

    subcategoriesMap[categoryName] = [];
  }

  return {
    categories: uniqueStrings(categories),
    subcategoriesMap,
  };
}

function normalizeLevelMatrix(matrix: Record<string, unknown>) {
  const levelKeys = ["junior", "mid", "senior"];
  const hasLevelRoot = levelKeys.some(
    (levelKey) => matrix[levelKey] && typeof matrix[levelKey] === "object" && !Array.isArray(matrix[levelKey]),
  );
  if (!hasLevelRoot) return null;

  const merged: Record<string, string[]> = {};
  for (const levelKey of levelKeys) {
    const level = matrix[levelKey];
    if (!level || typeof level !== "object" || Array.isArray(level)) continue;
    for (const [rawCategoryKey, payload] of Object.entries(level as Record<string, unknown>)) {
      const categoryLabel = toCategoryLabel(rawCategoryKey);
      if (!categoryLabel) continue;
      if (!merged[categoryLabel]) merged[categoryLabel] = [];
      if (!Array.isArray(payload)) continue;
      for (const item of payload) {
        const question = cleanText(item);
        if (question) merged[categoryLabel].push(question);
      }
    }
  }

  const categories = uniqueStrings(Object.keys(merged));
  const subcategoriesMap = categories.reduce<Record<string, string[]>>((acc, category) => {
    acc[category] = uniqueStrings(merged[category] ?? []);
    return acc;
  }, {});

  return { categories, subcategoriesMap };
}

function normalizeFramework(
  framework: Pick<UnifiedFramework, "id" | "name" | "isSystemDefault"> & { matrix: unknown },
): UnifiedFramework {
  const matrix =
    framework.matrix && typeof framework.matrix === "object" && !Array.isArray(framework.matrix)
      ? (framework.matrix as Record<string, unknown>)
      : null;

  if (!matrix) {
    return {
      id: framework.id,
      name: framework.name,
      matrix: framework.matrix,
      categories: [],
      subcategoriesMap: {},
      isSystemDefault: framework.isSystemDefault,
    };
  }

  const fromCategoryRoot = normalizeCategoryRootMatrix(matrix);
  if (fromCategoryRoot) {
    return {
      id: framework.id,
      name: framework.name,
      matrix: framework.matrix,
      categories: fromCategoryRoot.categories,
      subcategoriesMap: fromCategoryRoot.subcategoriesMap,
      isSystemDefault: framework.isSystemDefault,
    };
  }

  const fromLevelRoot = normalizeLevelMatrix(matrix);
  if (fromLevelRoot) {
    return {
      id: framework.id,
      name: framework.name,
      matrix: framework.matrix,
      categories: fromLevelRoot.categories,
      subcategoriesMap: fromLevelRoot.subcategoriesMap,
      isSystemDefault: framework.isSystemDefault,
    };
  }

  return {
    id: framework.id,
    name: framework.name,
    matrix: framework.matrix,
    categories: [],
    subcategoriesMap: {},
    isSystemDefault: framework.isSystemDefault,
  };
}

type ProfileActiveFrameworkRow = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "active_framework_id"
>;
type FrameworkSelectRow = Pick<
  Database["public"]["Tables"]["competency_frameworks"]["Row"],
  "id" | "name" | "matrix" | "is_system_default"
>;

export function FrameworkProvider({ children }: { children: React.ReactNode }) {
  const { userId } = useAuth();

  const { data: currentFramework = null, isLoading } = useQuery({
    queryKey: ["active-framework-context", userId],
    enabled: Boolean(userId),
    queryFn: async (): Promise<UnifiedFramework | null> => {
      if (!userId) return null;

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("active_framework_id")
        .eq("id", userId)
        .maybeSingle<ProfileActiveFrameworkRow>();
      if (profileError) throw profileError;

      const activeFrameworkId = (profile?.active_framework_id as string | null) ?? null;
      if (activeFrameworkId) {
        const { data: activeFramework, error: activeFrameworkError } = await supabase
          .from("competency_frameworks")
          .select("id,name,matrix,is_system_default")
          .eq("id", activeFrameworkId)
          .maybeSingle<FrameworkSelectRow>();
        if (activeFrameworkError) throw activeFrameworkError;
        if (activeFramework) {
          return normalizeFramework({
            id: cleanText(activeFramework.id),
            name: cleanText(activeFramework.name) || "Unnamed Framework",
            matrix: activeFramework.matrix,
            isSystemDefault: Boolean(activeFramework.is_system_default),
          });
        }
      }

      const { data: fallbackFramework, error: fallbackError } = await supabase
        .from("competency_frameworks")
        .select("id,name,matrix,is_system_default")
        .or(`is_system_default.eq.true,user_id.eq.${userId}`)
        .order("is_system_default", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle<FrameworkSelectRow>();
      if (fallbackError) throw fallbackError;
      if (!fallbackFramework) return null;

      return normalizeFramework({
        id: cleanText(fallbackFramework.id),
        name: cleanText(fallbackFramework.name) || "Unnamed Framework",
        matrix: fallbackFramework.matrix,
        isSystemDefault: Boolean(fallbackFramework.is_system_default),
      });
    },
  });

  const categories = useMemo(() => currentFramework?.categories ?? [], [currentFramework]);
  const getQuestionsForCategory = useCallback(
    (categoryName: string) => currentFramework?.subcategoriesMap[categoryName] ?? [],
    [currentFramework],
  );

  const value = useMemo<FrameworkContextValue>(
    () => ({
      currentFramework,
      categories,
      getQuestionsForCategory,
      isLoading,
    }),
    [categories, currentFramework, getQuestionsForCategory, isLoading],
  );

  return <FrameworkContext.Provider value={value}>{children}</FrameworkContext.Provider>;
}

export function useFrameworkContext(): FrameworkContextValue {
  const context = useContext(FrameworkContext);
  if (!context) throw new Error("useFrameworkContext must be used inside <FrameworkProvider>.");
  return context;
}

export function useFramework(): FrameworkContextValue {
  return useFrameworkContext();
}

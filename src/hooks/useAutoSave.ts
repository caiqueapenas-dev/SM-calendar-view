"use client";

import { useEffect, useRef } from "react";
import { supabase } from "@/lib/supabaseClient";

interface AutoSaveOptions {
  key: string;
  data: any;
  delay?: number;
  userId?: string;
}

export function useAutoSave({ key, data, delay = 2000, userId }: AutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  const previousDataRef = useRef<string>();

  useEffect(() => {
    const dataString = JSON.stringify(data);
    
    // Skip if data hasn't changed
    if (dataString === previousDataRef.current) return;
    
    previousDataRef.current = dataString;

    // Clear previous timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(async () => {
      try {
        if (userId) {
          // Save to database
          await supabase.from("drafts").upsert({
            id: `${userId}_${key}`,
            user_id: userId,
            draft_key: key,
            content: data,
            updated_at: new Date().toISOString(),
          });
        } else {
          // Fallback to localStorage
          localStorage.setItem(`draft_${key}`, dataString);
        }
        console.log("✅ Auto-saved:", key);
      } catch (error) {
        console.error("❌ Auto-save failed:", error);
      }
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, key, delay, userId]);
}

export async function loadDraft(key: string, userId?: string): Promise<any | null> {
  try {
    if (userId) {
      const { data } = await supabase
        .from("drafts")
        .select("content")
        .eq("id", `${userId}_${key}`)
        .single();

      return data?.content || null;
    } else {
      const saved = localStorage.getItem(`draft_${key}`);
      return saved ? JSON.parse(saved) : null;
    }
  } catch {
    return null;
  }
}

export async function clearDraft(key: string, userId?: string) {
  try {
    if (userId) {
      await supabase.from("drafts").delete().eq("id", `${userId}_${key}`);
    } else {
      localStorage.removeItem(`draft_${key}`);
    }
  } catch (error) {
    console.error("Error clearing draft:", error);
  }
}


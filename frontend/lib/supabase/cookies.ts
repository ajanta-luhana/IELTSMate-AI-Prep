import type { CookieOptions } from "@supabase/ssr";

/** Shape of the cookies Supabase asks us to write. Typed explicitly because newer
 *  @supabase/ssr versions don't let TypeScript infer it from the options object. */
export type CookieToSet = { name: string; value: string; options: CookieOptions };

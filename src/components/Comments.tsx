import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Send, Trash2, User as UserIcon } from "lucide-react";

type CommentRow = {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
};

type Author = { display_name: string | null; avatar_url: string | null };

export function Comments({ blogSlug, postId }: { blogSlug?: string; postId?: string }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [rows, setRows] = useState<CommentRow[]>([]);
  const [authors, setAuthors] = useState<Record<string, Author>>({});
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  async function load() {
    let q = supabase.from("post_comments").select("id,user_id,content,created_at").order("created_at", { ascending: false }).limit(100);
    q = blogSlug ? q.eq("blog_slug", blogSlug) : q.eq("post_id", postId!);
    const { data } = await q;
    const list = (data ?? []) as CommentRow[];
    setRows(list);
    const ids = [...new Set(list.map((c) => c.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id,display_name,avatar_url").in("id", ids);
      const map: Record<string, Author> = {};
      (profs ?? []).forEach((p) => { map[p.id] = { display_name: p.display_name, avatar_url: p.avatar_url }; });
      setAuthors(map);
    }
    setLoading(false);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const uid = data.session?.user.id ?? null;
      setUserId(uid);
      if (uid) load();
      else setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blogSlug, postId]);

  async function send() {
    const content = text.trim();
    if (content.length < 2) { toast.error("Escreva um comentário"); return; }
    setBusy(true);
    const { error } = await supabase.from("post_comments").insert({
      user_id: userId!,
      content: content.slice(0, 1000),
      blog_slug: blogSlug ?? null,
      post_id: postId ?? null,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setText("");
    toast.success("Comentário publicado");
    load();
  }

  async function remove(id: string) {
    const { error } = await supabase.from("post_comments").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setRows((r) => r.filter((c) => c.id !== id));
  }

  return (
    <section className="mt-14">
      <h2 className="flex items-center gap-2 text-2xl font-black text-white">
        <MessageSquare className="h-5 w-5 text-accent" /> Comentários
        {rows.length > 0 && <span className="text-base font-medium text-white/50">({rows.length})</span>}
      </h2>

      {!userId ? (
        <div className="glass-panel mt-5 p-6 text-center">
          <p className="text-white/70 text-sm">Entre na sua conta para comentar e participar da comunidade.</p>
          <Link to="/auth" className="mt-4 inline-flex rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-[position:100%_0]">
            Entrar
          </Link>
        </div>
      ) : (
        <div className="glass-panel mt-5 p-5">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            maxLength={1000}
            placeholder="Escreva um comentário..."
            className="w-full rounded-xl bg-white/5 border border-white/15 px-4 py-3 text-white placeholder:text-white/40 outline-none focus:border-primary focus:ring-2 focus:ring-primary/30 transition"
          />
          <div className="mt-3 flex justify-end">
            <button onClick={send} disabled={busy}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-[position:100%_0] disabled:opacity-60">
              <Send className="h-4 w-4" /> {busy ? "Enviando..." : "Comentar"}
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading && <p className="text-sm text-white/50">Carregando comentários...</p>}
        {!loading && userId && rows.length === 0 && <p className="text-sm text-white/50">Nenhum comentário ainda. Seja o primeiro.</p>}
        {rows.map((c) => {
          const a = authors[c.user_id];
          return (
            <article key={c.id} className="glass rounded-2xl p-4 flex gap-3 hover-lift">
              <span className="relative shrink-0">
                <span className="absolute inset-0 rounded-full rainbow-ring blur-[1px]" />
                <span className="relative m-[2px] grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-[oklch(0.14_0.07_260)]">
                  {a?.avatar_url ? <img src={a.avatar_url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4 text-white" />}
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-semibold text-white truncate">{a?.display_name ?? "Usuário"}</span>
                  <span className="text-white/40 text-xs">{new Date(c.created_at).toLocaleDateString("pt-BR")}</span>
                  {c.user_id === userId && (
                    <button onClick={() => remove(c.id)} aria-label="Apagar comentário" className="ml-auto text-white/40 hover:text-destructive transition">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="mt-1 text-sm text-white/80 whitespace-pre-wrap break-words">{c.content}</p>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

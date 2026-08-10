import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  ThumbsUp, ThumbsDown, MessageSquare, ImagePlus, Send, Trash2, UserPlus, UserCheck,
  Store, Sparkles, Tag, ExternalLink, Loader2, User as UserIcon,
} from "lucide-react";
import { Comments } from "@/components/Comments";
import { Reveal } from "@/components/Reveal";

export const Route = createFileRoute("/_authenticated/comunidade")({
  head: () => ({
    meta: [
      { title: "Comunidade & Marketplace — Diamante.dev" },
      { name: "description", content: "Rede social interna da Diamante.dev: publique projetos, interaja e negocie sites no marketplace." },
      { property: "og:title", content: "Comunidade & Marketplace — Diamante.dev" },
      { property: "og:description", content: "Poste projetos, curta, comente, siga perfis e anuncie sites à venda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComunidadePage,
});

type Profile = { id: string; display_name: string | null; username: string | null; avatar_url: string | null; bio: string | null };
type Post = {
  id: string; user_id: string; content: string; media_url: string | null; media_type: string | null; created_at: string;
};
type Listing = {
  id: string; user_id: string; title: string; description: string; price_cents: number;
  category: string; status: string; demo_url: string | null; image_url: string | null; created_at: string;
};

const BRL = (cents: number) => (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

function timeAgo(iso: string) {
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}min`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
}

function ComunidadePage() {
  const [tab, setTab] = useState<"feed" | "market">("feed");
  const [userId, setUserId] = useState<string | null>(null);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [media, setMedia] = useState<Record<string, string>>({});

  const [posts, setPosts] = useState<Post[]>([]);
  const [reactions, setReactions] = useState<Record<string, { up: number; down: number; mine: number }>>({});
  const [follows, setFollows] = useState<Set<string>>(new Set());
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  const hydrateProfiles = useCallback(async (ids: string[]) => {
    const missing = [...new Set(ids)].filter(Boolean);
    if (!missing.length) return;
    const { data } = await supabase.from("profiles").select("id,display_name,username,avatar_url,bio").in("id", missing);
    setProfiles((prev) => {
      const next = { ...prev };
      (data ?? []).forEach((p) => { next[p.id] = p as Profile; });
      return next;
    });
  }, []);

  const signMedia = useCallback(async (paths: string[]) => {
    const list = [...new Set(paths.filter(Boolean))] as string[];
    if (!list.length) return;
    const { data } = await supabase.storage.from("community").createSignedUrls(list, 3600);
    setMedia((prev) => {
      const next = { ...prev };
      (data ?? []).forEach((s) => { if (s.path && s.signedUrl) next[s.path] = s.signedUrl; });
      return next;
    });
  }, []);

  const loadFeed = useCallback(async (uid: string) => {
    const { data: postRows } = await supabase
      .from("community_posts").select("*").order("created_at", { ascending: false }).limit(50);
    const list = (postRows ?? []) as Post[];
    setPosts(list);
    await hydrateProfiles(list.map((p) => p.user_id));
    await signMedia(list.map((p) => p.media_url).filter(Boolean) as string[]);

    const { data: rx } = await supabase.from("post_reactions").select("post_id,user_id,value");
    const agg: Record<string, { up: number; down: number; mine: number }> = {};
    (rx ?? []).forEach((r) => {
      const e = (agg[r.post_id] ??= { up: 0, down: 0, mine: 0 });
      if (r.value > 0) e.up++; else e.down++;
      if (r.user_id === uid) e.mine = r.value;
    });
    setReactions(agg);

    const { data: f } = await supabase.from("follows").select("following_id").eq("follower_id", uid);
    setFollows(new Set((f ?? []).map((r) => r.following_id)));
  }, [hydrateProfiles, signMedia]);

  const loadMarket = useCallback(async () => {
    const { data } = await supabase.from("listings").select("*").order("created_at", { ascending: false }).limit(60);
    const list = (data ?? []) as Listing[];
    setListings(list);
    await hydrateProfiles(list.map((l) => l.user_id));
    await signMedia(list.map((l) => l.image_url).filter(Boolean) as string[]);
  }, [hydrateProfiles, signMedia]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      const uid = data.user?.id ?? null;
      setUserId(uid);
      if (uid) { await Promise.all([loadFeed(uid), loadMarket()]); }
      setLoading(false);
    })();
  }, [loadFeed, loadMarket]);

  async function react(postId: string, value: number) {
    if (!userId) return;
    const current = reactions[postId]?.mine ?? 0;
    if (current === value) {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
    } else {
      await supabase.from("post_reactions").delete().eq("post_id", postId).eq("user_id", userId);
      const { error } = await supabase.from("post_reactions").insert({ post_id: postId, user_id: userId, value });
      if (error) { toast.error(error.message); return; }
    }
    setReactions((prev) => {
      const e = { ...(prev[postId] ?? { up: 0, down: 0, mine: 0 }) };
      if (e.mine === 1) e.up--; if (e.mine === -1) e.down--;
      if (e.mine === value) e.mine = 0;
      else { e.mine = value; if (value === 1) e.up++; else e.down++; }
      return { ...prev, [postId]: e };
    });
  }

  async function toggleFollow(target: string) {
    if (!userId || target === userId) return;
    if (follows.has(target)) {
      await supabase.from("follows").delete().eq("follower_id", userId).eq("following_id", target);
      setFollows((s) => { const n = new Set(s); n.delete(target); return n; });
    } else {
      const { error } = await supabase.from("follows").insert({ follower_id: userId, following_id: target });
      if (error) { toast.error(error.message); return; }
      setFollows((s) => new Set(s).add(target));
      toast.success("Você começou a seguir esse perfil");
    }
  }

  async function removePost(id: string) {
    const { error } = await supabase.from("community_posts").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setPosts((p) => p.filter((x) => x.id !== id));
    toast.success("Publicação removida");
  }

  async function removeListing(id: string) {
    const { error } = await supabase.from("listings").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    setListings((l) => l.filter((x) => x.id !== id));
    toast.success("Anúncio removido");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 pb-20">
      <section className="pt-8 md:pt-12">
        <Reveal className="max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-medium text-white/90">
            <Sparkles className="h-3.5 w-3.5 text-accent" /> Rede social interna
          </span>
          <h1 className="mt-5 text-4xl font-black leading-[1.05] sm:text-5xl text-white">
            Comunidade <span className="text-gradient">Diamante</span>
          </h1>
          <p className="mt-4 text-lg text-white/70">
            Publique projetos, interaja com outros criadores e negocie sites prontos no marketplace.
          </p>
        </Reveal>

        <div className="mt-8 inline-flex gap-1 rounded-full glass p-1">
          {([["feed", "Feed", Sparkles], ["market", "Marketplace", Store]] as const).map(([k, label, Icon]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ${
                tab === k ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25" : "text-white/75 hover:text-white"
              }`}
            >
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>
      </section>

      {loading ? (
        <div className="mt-10 flex items-center gap-2 text-white/60"><Loader2 className="h-4 w-4 animate-spin" /> Carregando comunidade...</div>
      ) : tab === "feed" ? (
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <Composer userId={userId!} onDone={() => loadFeed(userId!)} />
            <div className="mt-6 space-y-5">
              {posts.length === 0 && <p className="glass-panel p-8 text-center text-white/65">Ainda não há publicações. Seja o primeiro!</p>}
              {posts.map((p) => (
                <PostCard
                  key={p.id}
                  post={p}
                  author={profiles[p.user_id]}
                  mediaUrl={p.media_url ? media[p.media_url] : undefined}
                  mine={p.user_id === userId}
                  stats={reactions[p.id] ?? { up: 0, down: 0, mine: 0 }}
                  following={follows.has(p.user_id)}
                  onReact={react}
                  onFollow={toggleFollow}
                  onDelete={removePost}
                />
              ))}
            </div>
          </div>
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="glass-panel p-6">
              <h2 className="font-bold text-white">Perfis para seguir</h2>
              <ul className="mt-4 space-y-3">
                {Object.values(profiles).filter((p) => p.id !== userId).slice(0, 6).map((p) => (
                  <li key={p.id} className="flex items-center gap-3">
                    <Avatar url={p.avatar_url} size={9} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-white">{p.display_name ?? "Usuário"}</div>
                      <div className="truncate text-xs text-white/50">@{p.username ?? "diamante"}</div>
                    </div>
                    <button onClick={() => toggleFollow(p.id)}
                      className="rounded-full glass px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-white/15">
                      {follows.has(p.id) ? "Seguindo" : "Seguir"}
                    </button>
                  </li>
                ))}
                {Object.values(profiles).filter((p) => p.id !== userId).length === 0 && (
                  <li className="text-sm text-white/55">Nenhum perfil ainda por aqui.</li>
                )}
              </ul>
            </div>
            <div className="glass-panel p-6">
              <h2 className="font-bold text-white">Regras da casa</h2>
              <ul className="mt-3 space-y-2 text-sm text-white/65">
                <li>• Conteúdo profissional, sem spam.</li>
                <li>• Anuncie apenas sites que você pode entregar.</li>
                <li>• Respeite direitos autorais das imagens.</li>
              </ul>
              <Link to="/perfil" className="mt-5 inline-flex rounded-full glass px-4 py-2 text-xs font-semibold text-white">
                Editar meu perfil
              </Link>
            </div>
          </aside>
        </div>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <ListingForm userId={userId!} onDone={loadMarket} />
          <div className="grid gap-5 sm:grid-cols-2">
            {listings.length === 0 && <p className="glass-panel p-8 text-center text-white/65 sm:col-span-2">Nenhum site à venda ainda.</p>}
            {listings.map((l) => (
              <article key={l.id} className="flex flex-col glass-panel overflow-hidden hover-lift">
                {l.image_url && media[l.image_url] && (
                  <img src={media[l.image_url]} alt={l.title} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                )}
                <div className="flex flex-1 flex-col p-6">
                  <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider text-accent">
                    <Tag className="h-3.5 w-3.5" /> {l.category}
                    {l.status !== "ativo" && <span className="rounded-full bg-white/10 px-2 py-0.5 text-white/70">{l.status}</span>}
                  </div>
                  <h3 className="mt-2 text-lg font-bold text-white">{l.title}</h3>
                  <p className="mt-2 flex-1 text-sm text-white/65">{l.description}</p>
                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-2xl font-black text-white">{BRL(l.price_cents)}</span>
                    <div className="flex items-center gap-2">
                      {l.demo_url && (
                        <a href={l.demo_url} target="_blank" rel="noopener noreferrer"
                           className="inline-flex items-center gap-1 rounded-full glass px-3 py-1.5 text-xs font-semibold text-white">
                          Demo <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {l.user_id === userId && (
                        <button onClick={() => removeListing(l.id)} aria-label="Remover anúncio"
                          className="grid h-8 w-8 place-items-center rounded-full glass text-white/70 hover:text-white">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2 border-t border-white/10 pt-4">
                    <Avatar url={profiles[l.user_id]?.avatar_url} size={8} />
                    <span className="text-xs text-white/60">
                      {profiles[l.user_id]?.display_name ?? "Vendedor"} · {timeAgo(l.created_at)}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Avatar({ url, size = 10 }: { url?: string | null; size?: number }) {
  return (
    <span className="relative grid place-items-center shrink-0">
      <span className="absolute inset-0 rounded-full rainbow-ring opacity-90 blur-[1px]" />
      <span className={`relative m-[2px] grid place-items-center overflow-hidden rounded-full bg-[oklch(0.14_0.07_260)] ring-2 ring-white/10`}
            style={{ height: `${size * 0.25}rem`, width: `${size * 0.25}rem` }}>
        {url ? <img src={url} alt="" className="h-full w-full object-cover" /> : <UserIcon className="h-4 w-4 text-white" />}
      </span>
    </span>
  );
}

function Composer({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function publish() {
    const content = text.trim();
    if (content.length < 3) { toast.error("Escreva algo antes de publicar"); return; }
    setBusy(true);
    let media_url: string | null = null;
    let media_type: string | null = null;
    if (file) {
      if (file.size > 25 * 1024 * 1024) { toast.error("Arquivo acima de 25MB"); setBusy(false); return; }
      const ext = file.name.split(".").pop() ?? "bin";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("community").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); setBusy(false); return; }
      media_url = path;
      media_type = file.type.startsWith("video") ? "video" : "image";
    }
    const { error } = await supabase.from("community_posts").insert({ user_id: userId, content: content.slice(0, 2000), media_url, media_type });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setText(""); setFile(null);
    if (inputRef.current) inputRef.current.value = "";
    toast.success("Publicado!");
    onDone();
  }

  return (
    <div className="glass-panel p-6">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder="Compartilhe um projeto, uma dica ou um site à venda..."
        className="w-full resize-none rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-full glass px-4 py-2 text-sm font-medium text-white/85 transition hover:text-white">
          <ImagePlus className="h-4 w-4" /> {file ? file.name.slice(0, 22) : "Foto ou vídeo"}
          <input ref={inputRef} type="file" accept="image/*,video/*" className="hidden"
                 onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        </label>
        <button onClick={publish} disabled={busy}
          className="ml-auto inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-[position:100%_0] disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publicar
        </button>
      </div>
    </div>
  );
}

function PostCard({
  post, author, mediaUrl, mine, stats, following, onReact, onFollow, onDelete,
}: {
  post: Post; author?: Profile; mediaUrl?: string; mine: boolean;
  stats: { up: number; down: number; mine: number }; following: boolean;
  onReact: (id: string, v: number) => void; onFollow: (id: string) => void; onDelete: (id: string) => void;
}) {
  const [openComments, setOpenComments] = useState(false);
  return (
    <article className="glass-panel overflow-hidden">
      <header className="flex items-center gap-3 p-5">
        <Avatar url={author?.avatar_url} size={11} />
        <div className="min-w-0 flex-1">
          <div className="truncate font-semibold text-white">{author?.display_name ?? "Usuário"}</div>
          <div className="truncate text-xs text-white/50">@{author?.username ?? "diamante"} · {timeAgo(post.created_at)}</div>
        </div>
        {!mine && (
          <button onClick={() => onFollow(post.user_id)}
            className="inline-flex items-center gap-1.5 rounded-full glass px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15">
            {following ? <><UserCheck className="h-3.5 w-3.5" /> Seguindo</> : <><UserPlus className="h-3.5 w-3.5" /> Seguir</>}
          </button>
        )}
        {mine && (
          <button onClick={() => onDelete(post.id)} aria-label="Excluir publicação"
            className="grid h-9 w-9 place-items-center rounded-full glass text-white/65 transition hover:text-white">
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </header>

      <p className="whitespace-pre-wrap px-5 pb-4 text-white/85">{post.content}</p>

      {mediaUrl && (
        post.media_type === "video"
          ? <video src={mediaUrl} controls playsInline className="w-full bg-black/40" />
          : <img src={mediaUrl} alt="" loading="lazy" className="w-full object-cover" />
      )}

      <footer className="flex flex-wrap items-center gap-2 p-4">
        <button onClick={() => onReact(post.id, 1)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
            stats.mine === 1 ? "bg-gradient-to-r from-primary to-accent text-primary-foreground" : "glass text-white/80 hover:text-white"}`}>
          <ThumbsUp className="h-4 w-4" /> {stats.up}
        </button>
        <button onClick={() => onReact(post.id, -1)}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition active:scale-95 ${
            stats.mine === -1 ? "bg-white/25 text-white" : "glass text-white/80 hover:text-white"}`}>
          <ThumbsDown className="h-4 w-4" /> {stats.down}
        </button>
        <button onClick={() => setOpenComments((o) => !o)}
          className="inline-flex items-center gap-2 rounded-full glass px-4 py-2 text-sm font-semibold text-white/80 transition hover:text-white">
          <MessageSquare className="h-4 w-4" /> Comentários
        </button>
      </footer>

      {openComments && <div className="border-t border-white/10 px-5 pb-6"><Comments postId={post.id} /></div>}
    </article>
  );
}

function ListingForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "").trim();
    const description = String(fd.get("description") ?? "").trim();
    const price = Number(String(fd.get("price") ?? "0").replace(/\D/g, ""));
    if (title.length < 3 || description.length < 10 || !price) {
      toast.error("Preencha título, descrição e preço");
      return;
    }
    setBusy(true);
    let image_url: string | null = null;
    const file = fd.get("image") as File | null;
    if (file && file.size > 0) {
      const ext = file.name.split(".").pop() ?? "jpg";
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("community").upload(path, file, { contentType: file.type });
      if (error) { toast.error(error.message); setBusy(false); return; }
      image_url = path;
    }
    const { error } = await supabase.from("listings").insert({
      user_id: userId,
      title: title.slice(0, 120),
      description: description.slice(0, 1000),
      price_cents: price * 100,
      category: String(fd.get("category") ?? "landing"),
      demo_url: String(fd.get("demo_url") ?? "").trim() || null,
      image_url,
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    formRef.current?.reset();
    toast.success("Anúncio publicado no marketplace");
    onDone();
  }

  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white placeholder:text-white/40 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30";

  return (
    <form ref={formRef} onSubmit={submit} className="glass-panel h-fit space-y-3 p-6 lg:sticky lg:top-24">
      <h2 className="text-lg font-black text-white">Anunciar um site</h2>
      <input name="title" placeholder="Título do site" className={input} />
      <textarea name="description" rows={3} placeholder="Descrição, stack, o que está incluso..." className={`${input} resize-none`} />
      <div className="grid grid-cols-2 gap-3">
        <input name="price" inputMode="numeric" placeholder="Preço (R$)" className={input} />
        <select name="category" defaultValue="landing" className={`${input} [&>option]:bg-[oklch(0.16_0.08_260)]`}>
          <option value="landing">Landing Page</option>
          <option value="institucional">Institucional</option>
          <option value="ecommerce">E-commerce</option>
          <option value="premium">Premium</option>
          <option value="template">Template</option>
        </select>
      </div>
      <input name="demo_url" placeholder="Link de demonstração (opcional)" className={input} />
      <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-dashed border-white/20 px-4 py-3 text-sm text-white/70">
        <ImagePlus className="h-4 w-4" /> Imagem de capa
        <input name="image" type="file" accept="image/*" className="hidden" />
      </label>
      <button type="submit" disabled={busy}
        className="w-full rounded-xl bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] px-5 py-3 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition hover:bg-[position:100%_0] disabled:opacity-60">
        {busy ? "Publicando..." : "Publicar anúncio"}
      </button>
    </form>
  );
}

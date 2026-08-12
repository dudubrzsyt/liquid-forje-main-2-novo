import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FloatingSocial } from "@/components/FloatingSocial";
import { ShaderBg } from "@/components/ShaderBg";
import { supabase } from "@/integrations/supabase/client";
import { applySettings, loadSettings } from "@/lib/site-settings";
import { motion } from "framer-motion";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel max-w-md text-center p-10 rounded-xl shadow-xl backdrop-blur-md"
      >
        <motion.h1
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-7xl font-black bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 bg-clip-text text-transparent"
        >
          404
        </motion.h1>
        <h2 className="mt-4 text-2xl font-bold text-white">Página não encontrada</h2>
        <p className="mt-2 text-sm text-gray-300">
          Essa rota não existe ou foi movida.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:scale-105 transition-transform duration-300"
        >
          Voltar ao início
        </Link>
      </motion.div>
    </div>
  );
}

export function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4 bg-gradient-to-br from-gray-900 via-black to-gray-800">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="glass-panel max-w-md text-center p-10 rounded-xl shadow-xl backdrop-blur-md"
      >
        <h1 className="text-2xl font-bold text-red-400 animate-pulse">Ops, algo deu errado!</h1>
        <p className="mt-2 text-sm text-gray-300">
          Tente novamente ou volte para a página inicial.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="rounded-full bg-gradient-to-r from-green-500 to-emerald-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all"
          >
            Tentar de novo
          </motion.button>
          <motion.a
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            href="/"
            className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-md hover:shadow-lg transition-all"
          >
            Início
          </motion.a>
        </div>
      </motion.div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Diamante.dev — Sites modernos que vendem" },
      { name: "description", content: "Criação de sites modernos e sofisticados: landing pages, institucionais, e-commerce e projetos premium. Feito por Igor Eduardo, desenvolvedor full-stack." },
      { name: "author", content: "Igor Eduardo Pinheiro de Araujo" },
      { name: "theme-color", content: "#0b1030" },
      { property: "og:title", content: "Diamante.dev — Sites modernos que vendem" },
      { property: "og:description", content: "Landing pages, institucionais, e-commerce e projetos premium com design sofisticado e performance real." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700;800&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();

  useEffect(() => { applySettings(loadSettings()); }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        router.invalidate();
        if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
      }
    });
    return () => sub.subscription.unsubscribe();
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ShaderBg />
      <SiteHeader />
      <main className="pt-[4.5rem] sm:pt-20">
        <Outlet />
      </main>
      <SiteFooter />
      <FloatingSocial />
      <Toaster theme="dark" position="top-center" richColors />
    </QueryClientProvider>
  );
}

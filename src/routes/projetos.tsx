import { createFileRoute } from "@tanstack/react-router";
import { Reveal } from "@/components/Reveal";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  ArrowUpDown,
  Download,
  FolderKanban,
  Briefcase,
  Wallet,
  Clock,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Check,
  X,
  Save,
  Inbox,
} from "lucide-react";

export const Route = createFileRoute("/projetos")({
  component: PersonalProjectsPage,
});

type ProjectStatus = "em_andamento" | "concluido" | "pausado" | "cancelado";
type SortKey = "recent" | "value_desc" | "value_asc" | "due_date" | "status";

interface ClientProject {
  id: string;
  clientName: string;
  projectType: string;
  value: number;
  startDate: string;
  dueDate: string;
  status: ProjectStatus;
  notes: string;
  createdAt: string;
}

const STORAGE_KEY = "projetos-pessoais:list";

const PROJECT_TYPES = [
  "Landing Page",
  "Site Institucional",
  "E-commerce",
  "Sistema Web",
  "Aplicativo Mobile",
  "Outro",
];

const STATUS_OPTIONS: { value: ProjectStatus; label: string; icon: LucideIcon; classes: string }[] = [
  { value: "em_andamento", label: "Em andamento", icon: Clock, classes: "bg-sky-50 text-sky-600 border-sky-200" },
  { value: "concluido", label: "Concluído", icon: CheckCircle2, classes: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  { value: "pausado", label: "Pausado", icon: PauseCircle, classes: "bg-amber-50 text-amber-600 border-amber-200" },
  { value: "cancelado", label: "Cancelado", icon: XCircle, classes: "bg-red-50 text-red-600 border-red-200" },
];

function formatBRL(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

function formatDate(value: string) {
  if (!value) return "-";
  const [year, month, day] = value.split("-");
  return `${day}/${month}/${year}`;
}

function emptyForm() {
  return {
    clientName: "",
    projectType: "",
    value: "",
    startDate: "",
    dueDate: "",
    status: "em_andamento" as ProjectStatus,
    notes: "",
  };
}

function inputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-3 py-2 text-sm text-black shadow-sm outline-none transition-colors focus:border-primary ${
    hasError ? "border-red-400" : "border-gray-200"
  }`;
}

function Field({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-red-600">{error}</span>}
    </label>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <Icon className="h-4 w-4 text-primary" />
      <div className="mt-2 text-lg font-bold text-black">{value}</div>
      <div className="text-xs text-gray-600">{label}</div>
    </div>
  );
}

const iconButtonClass =
  "rounded-lg border border-gray-200 p-1.5 text-gray-600 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1";

function PersonalProjectsPage() {
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmingDeleteId, setConfirmingDeleteId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("recent");

  // Carrega os dados salvos ao montar a página
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setProjects(JSON.parse(raw));
    } catch {
      // dados corrompidos no localStorage — ignora e começa do zero
    } finally {
      setLoaded(true);
    }
  }, []);

  // Persiste no localStorage sempre que a lista mudar (após o carregamento inicial)
  useEffect(() => {
    if (!loaded || typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
  }, [projects, loaded]);

  function validate(values: typeof form) {
    const nextErrors: Record<string, string> = {};
    if (!values.clientName.trim()) nextErrors.clientName = "Informe o nome do cliente.";
    if (!values.projectType) nextErrors.projectType = "Selecione o tipo de projeto.";
    const numericValue = Number(values.value);
    if (!values.value || Number.isNaN(numericValue) || numericValue <= 0) {
      nextErrors.value = "Informe um valor numérico maior que zero.";
    }
    if (!values.startDate) nextErrors.startDate = "Informe a data de início.";
    if (!values.dueDate) nextErrors.dueDate = "Informe a data de entrega.";
    if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
      nextErrors.dueDate = "A entrega não pode ser antes do início.";
    }
    return nextErrors;
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const numericValue = Number(form.value);

    if (editingId) {
      setProjects((prev) =>
        prev.map((p) => (p.id === editingId ? { ...p, ...form, value: numericValue } : p))
      );
    } else {
      const newProject: ClientProject = {
  id: Date.now().toString() + Math.random().toString(36).substring(2, 9), // substitui crypto.randomUUID()
  ...form,
  value: numericValue,
  createdAt: new Date().toISOString(),
};
setProjects((prev) => [newProject, ...prev]);
    }

    

    setForm(emptyForm());
    setErrors({});
    setEditingId(null);
  }

  function handleEdit(project: ClientProject) {
    setEditingId(project.id);
    setConfirmingDeleteId(null);
    setForm({
      clientName: project.clientName,
      projectType: project.projectType,
      value: String(project.value),
      startDate: project.startDate,
      dueDate: project.dueDate,
      status: project.status,
      notes: project.notes,
    });
    setErrors({});
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleCancelEdit() {
    setEditingId(null);
    setForm(emptyForm());
    setErrors({});
  }

  function handleDelete(id: string) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setConfirmingDeleteId(null);
    if (editingId === id) handleCancelEdit();
  }

  function handleExport() {
    const blob = new Blob([JSON.stringify(projects, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "projetos-pessoais.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    const list = projects.filter(
      (p) =>
        !term ||
        p.clientName.toLowerCase().includes(term) ||
        p.projectType.toLowerCase().includes(term)
    );

    const statusOrder = STATUS_OPTIONS.map((s) => s.value);

    return [...list].sort((a, b) => {
      switch (sortKey) {
        case "value_desc":
          return b.value - a.value;
        case "value_asc":
          return a.value - b.value;
        case "due_date":
          return a.dueDate.localeCompare(b.dueDate);
        case "status":
          return statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status);
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
  }, [projects, search, sortKey]);

  const stats = useMemo(() => {
    const total = projects.length;
    const totalValue = projects.reduce((sum, p) => sum + p.value, 0);
    const inProgress = projects.filter((p) => p.status === "em_andamento").length;
    const done = projects.filter((p) => p.status === "concluido").length;
    return { total, totalValue, inProgress, done };
  }, [projects]);

  function statusMeta(status: ProjectStatus) {
    return STATUS_OPTIONS.find((s) => s.value === status) ?? STATUS_OPTIONS[0];
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white py-16 text-black sm:py-20">
      <style>{`
        @keyframes projectRowIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .project-row-enter { animation: projectRowIn 0.3s ease-out; }
      `}</style>

      {/* Glow decorativo de fundo */}
      <div className="pointer-events-none absolute -top-24 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-accent/10 blur-3xl sm:h-96 sm:w-96" />

      <div className="relative mx-auto max-w-5xl px-4">
        {/* Cabeçalho */}
        <Reveal>
          <div className="text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white/70 px-4 py-1.5 text-xs font-medium text-gray-600 shadow-sm backdrop-blur-sm sm:text-sm">
              <FolderKanban className="h-3.5 w-3.5 text-accent" />
              Painel pessoal
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-black sm:text-5xl">
              Meus{" "}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                projetos
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-lg text-base text-gray-600">
              Cadastre clientes, acompanhe prazos e valores — tudo salvo direto no seu navegador.
            </p>
          </div>
        </Reveal>

        {/* Estatísticas */}
        <Reveal>
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={Briefcase} label="Projetos" value={String(stats.total)} />
            <StatCard icon={Wallet} label="Valor total" value={formatBRL(stats.totalValue)} />
            <StatCard icon={Clock} label="Em andamento" value={String(stats.inProgress)} />
            <StatCard icon={CheckCircle2} label="Concluídos" value={String(stats.done)} />
          </div>
        </Reveal>

        {/* Formulário */}
        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="mt-10 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-black">
                {editingId ? "Editar projeto" : "Novo projeto"}
              </h2>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-sm font-medium text-gray-600 transition-colors hover:text-black"
                >
                  <X className="h-4 w-4" />
                  Cancelar edição
                </button>
              )}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <Field label="Nome do cliente" error={errors.clientName}>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) => setForm((f) => ({ ...f, clientName: e.target.value }))}
                  placeholder="Ex: João Silva"
                  className={inputClass(!!errors.clientName)}
                />
              </Field>

              <Field label="Tipo de projeto" error={errors.projectType}>
                <select
                  value={form.projectType}
                  onChange={(e) => setForm((f) => ({ ...f, projectType: e.target.value }))}
                  className={inputClass(!!errors.projectType)}
                >
                  <option value="">Selecione...</option>
                  {PROJECT_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Valor (R$)" error={errors.value}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.value}
                  onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                  placeholder="Ex: 897"
                  className={inputClass(!!errors.value)}
                />
              </Field>

              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ProjectStatus }))}
                  className={inputClass(false)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Data de início" error={errors.startDate}>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                  className={inputClass(!!errors.startDate)}
                />
              </Field>

              <Field label="Data de entrega" error={errors.dueDate}>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm((f) => ({ ...f, dueDate: e.target.value }))}
                  className={inputClass(!!errors.dueDate)}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field label="Observações">
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Detalhes adicionais sobre o projeto..."
                    rows={3}
                    className={inputClass(false)}
                  />
                </Field>
              </div>
            </div>

            <button
              type="submit"
              className="group relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-sm font-semibold text-white shadow-md shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-white"
            >
              <span className="absolute inset-0 -translate-x-full bg-white/20 transition-transform duration-500 group-hover:translate-x-full" />
              {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {editingId ? "Salvar alterações" : "Salvar projeto"}
            </button>
          </form>
        </Reveal>

        {/* Barra de busca e ordenação */}
        <Reveal>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por cliente ou tipo..."
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-black shadow-sm outline-none transition-colors focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <select
                  value={sortKey}
                  onChange={(e) => setSortKey(e.target.value as SortKey)}
                  className="rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm text-black shadow-sm outline-none transition-colors focus:border-primary"
                >
                  <option value="recent">Mais recentes</option>
                  <option value="value_desc">Maior valor</option>
                  <option value="value_asc">Menor valor</option>
                  <option value="due_date">Prazo mais próximo</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <button
                type="button"
                onClick={handleExport}
                disabled={projects.length === 0}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-black shadow-sm transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                Exportar
              </button>
            </div>
          </div>
        </Reveal>

        {/* Lista de projetos */}
        <Reveal>
          <div className="mt-6">
            {filteredSorted.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
                <Inbox className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-3 text-sm font-medium text-gray-600">
                  {projects.length === 0
                    ? "Nenhum projeto cadastrado ainda."
                    : "Nenhum projeto encontrado pra essa busca."}
                </p>
              </div>
            ) : (
              <>
                {/* Tabela — desktop */}
                <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm sm:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-600">
                      <tr>
                        <th className="px-5 py-3">Cliente</th>
                        <th className="px-5 py-3">Tipo</th>
                        <th className="px-5 py-3">Valor</th>
                        <th className="px-5 py-3">Início</th>
                        <th className="px-5 py-3">Entrega</th>
                        <th className="px-5 py-3">Status</th>
                        <th className="px-5 py-3 text-right">Ações</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredSorted.map((project) => {
                        const meta = statusMeta(project.status);
                        const StatusIcon = meta.icon;
                        return (
                          <tr key={project.id} className="project-row-enter transition-colors hover:bg-gray-50">
                            <td className="px-5 py-4">
                              <div className="font-medium text-black">{project.clientName}</div>
                              {project.notes && (
                                <div
                                  className="mt-0.5 max-w-[220px] truncate text-xs text-gray-500"
                                  title={project.notes}
                                >
                                  {project.notes}
                                </div>
                              )}
                            </td>
                            <td className="px-5 py-4 text-gray-600">{project.projectType}</td>
                            <td className="px-5 py-4 font-medium text-black">{formatBRL(project.value)}</td>
                            <td className="px-5 py-4 text-gray-600">{formatDate(project.startDate)}</td>
                            <td className="px-5 py-4 text-gray-600">{formatDate(project.dueDate)}</td>
                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.classes}`}
                              >
                                <StatusIcon className="h-3.5 w-3.5" />
                                {meta.label}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center justify-end gap-2">
                                {confirmingDeleteId === project.id ? (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleDelete(project.id)}
                                      className={`${iconButtonClass} border-transparent bg-red-600 text-white hover:bg-red-700`}
                                      aria-label="Confirmar exclusão"
                                    >
                                      <Check className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmingDeleteId(null)}
                                      className={`${iconButtonClass} hover:bg-gray-100`}
                                      aria-label="Cancelar exclusão"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => handleEdit(project)}
                                      className={`${iconButtonClass} hover:border-primary hover:text-primary`}
                                      aria-label="Editar"
                                    >
                                      <Pencil className="h-4 w-4" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setConfirmingDeleteId(project.id)}
                                      className={`${iconButtonClass} hover:border-red-300 hover:text-red-600`}
                                      aria-label="Excluir"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cards — mobile */}
                <div className="grid gap-4 sm:hidden">
                  {filteredSorted.map((project) => {
                    const meta = statusMeta(project.status);
                    const StatusIcon = meta.icon;
                    return (
                      <div
                        key={project.id}
                        className="project-row-enter rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-semibold text-black">{project.clientName}</div>
                            <div className="text-sm text-gray-600">{project.projectType}</div>
                          </div>
                          <span
                            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${meta.classes}`}
                          >
                            <StatusIcon className="h-3.5 w-3.5" />
                            {meta.label}
                          </span>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <div className="text-xs text-gray-500">Valor</div>
                            <div className="font-medium text-black">{formatBRL(project.value)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Entrega</div>
                            <div className="font-medium text-black">{formatDate(project.dueDate)}</div>
                          </div>
                        </div>

                        {project.notes && <p className="mt-3 text-sm text-gray-600">{project.notes}</p>}

                        <div className="mt-4 flex gap-2">
                          {confirmingDeleteId === project.id ? (
                            <>
                              <button
                                type="button"
                                onClick={() => handleDelete(project.id)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-600 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
                              >
                                <Check className="h-4 w-4" />
                                Confirmar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteId(null)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600"
                              >
                                Cancelar
                              </button>
                            </>
                          ) : (
                            <>
                              <button
                                type="button"
                                onClick={() => handleEdit(project)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-primary hover:text-primary"
                              >
                                <Pencil className="h-4 w-4" />
                                Editar
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmingDeleteId(project.id)}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-200 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-red-300 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                                Excluir
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Reveal>
      </div>
    </div>
  );
}
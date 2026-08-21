import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { listContactMessages, markContactRead } from "@/lib/contact.functions";
import { toast } from "sonner";
import { Mail, MailOpen } from "lucide-react";

export const Route = createFileRoute("/_authenticated/messages")({
  component: MessagesPage,
});

function MessagesPage() {
  const list = useServerFn(listContactMessages);
  const markFn = useServerFn(markContactRead);
  const qc = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["contact_messages"],
    queryFn: () => list(),
  });

  const mark = useMutation({
    mutationFn: (vars: { id: string; is_read: boolean }) => markFn({ data: vars }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["contact_messages"] }),
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed to update"),
  });

  return (
    <div className="p-6 md:p-10 text-[var(--ls-text)]">
      <div className="flex items-center gap-3 mb-8">
        <Mail className="h-6 w-6" />
        <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight">Contact Messages</h1>
      </div>

      {isLoading && <p className="text-ls-text-muted">Loading...</p>}
      {error && (
        <p className="text-red-400">
          {error instanceof Error ? error.message : "Failed to load messages."}
        </p>
      )}
      {data && data.length === 0 && (
        <p className="text-ls-text-muted">No messages yet. Submissions from the public Contact form will appear here.</p>
      )}

      <div className="grid gap-4 max-w-4xl">
        {data?.map((msg) => (
          <div
            key={msg.id}
            className={`rounded-2xl p-6 border ${
              msg.is_read ? "border-ls-border bg-ls-surface-elevated" : "border-primary/40 bg-primary/[0.04]"
            }`}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h3 className="font-medium text-ls-text text-lg">{msg.name}</h3>
                <a href={`mailto:${msg.email}`} className="text-ls-text-muted hover:text-ls-text text-sm">
                  {msg.email}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-ls-text/40 text-xs whitespace-nowrap">
                  {new Date(msg.created_at).toLocaleString()}
                </span>
                <button
                  onClick={() => mark.mutate({ id: msg.id, is_read: !msg.is_read })}
                  className="text-ls-text-muted hover:text-ls-text transition-colors"
                  title={msg.is_read ? "Mark as unread" : "Mark as read"}
                >
                  {msg.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <p className="text-[var(--ls-text)] whitespace-pre-wrap leading-relaxed">{msg.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

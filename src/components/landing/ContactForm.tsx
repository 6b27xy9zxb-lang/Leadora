import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { useServerFn } from "@tanstack/react-start";
import { submitContactMessage } from "@/lib/contact.functions";
import { FadeIn } from "./FadeIn";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const submit = useServerFn(submitContactMessage);

  const m = useMutation({
    mutationFn: (data: { name: string; email: string; message: string }) =>
      submit({ data }),
    onSuccess: () => {
      toast.success("Message sent", { description: "We'll get back to you soon." });
      setName(""); setEmail(""); setMessage("");
    },
    onError: (err) => {
      toast.error("Couldn't send", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    },
  });

  return (
    <FadeIn delay={0.2}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim() || !email.trim() || !message.trim()) {
            toast.error("Fill in all fields");
            return;
          }
          if (message.length > 2000) {
            toast.error("Message is too long (max 2000 characters)");
            return;
          }
          m.mutate({ name: name.trim(), email: email.trim(), message: message.trim() });
        }}
        className="rounded-3xl p-6 sm:p-8 border border-ls-border bg-ls-surface-elevated flex flex-col gap-4"
      >
        <h3 className="text-2xl font-black text-ls-text uppercase tracking-tight">Send us a message</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={100}
            required
            className="bg-ls-surface-elevated border border-ls-border rounded-xl px-4 py-3 text-ls-text placeholder:text-ls-text/30 focus:outline-none focus:border-ls-border-strong transition-colors"
          />
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={255}
            required
            className="bg-ls-surface-elevated border border-ls-border rounded-xl px-4 py-3 text-ls-text placeholder:text-ls-text/30 focus:outline-none focus:border-ls-border-strong transition-colors"
          />
        </div>
        <textarea
          placeholder="Tell us about your project..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          maxLength={2000}
          required
          rows={5}
          className="bg-ls-surface-elevated border border-ls-border rounded-xl px-4 py-3 text-ls-text placeholder:text-ls-text/30 focus:outline-none focus:border-ls-border-strong transition-colors resize-none"
        />
        <div className="flex items-center justify-between gap-4">
          <span className="text-ls-text/40 text-xs">{message.length}/2000</span>
          <button
            type="submit"
            disabled={m.isPending}
            className="btn-gradient text-ls-text uppercase tracking-wider text-sm font-medium px-8 py-3 rounded-full disabled:opacity-50 transition-opacity"
          >
            {m.isPending ? "Sending..." : "Send Message"}
          </button>
        </div>
      </form>
    </FadeIn>
  );
}

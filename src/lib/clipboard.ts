export async function copyToClipboard(text: string): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Clipboard is not available outside a browser environment.");
  }

  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (err) {
      console.warn("navigator.clipboard.writeText failed, falling back to execCommand", err);
    }
  }

  const textArea = document.createElement("textarea");
  textArea.value = text;
  textArea.setAttribute("readonly", "");
  textArea.style.position = "fixed";
  textArea.style.top = "-9999px";
  textArea.style.left = "-9999px";
  textArea.style.opacity = "0";

  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();

  try {
    const success = document.execCommand("copy");
    document.body.removeChild(textArea);
    if (!success) {
      throw new Error("document.execCommand('copy') returned false.");
    }
  } catch (err) {
    document.body.removeChild(textArea);
    throw err instanceof Error ? err : new Error("Fallback clipboard copy failed.");
  }
}

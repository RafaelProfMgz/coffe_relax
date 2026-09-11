export default function TerminalLog({ text }: { text: string }) {
  return (
    <div className="terminal-log" role="status" aria-live="polite">
      <span className="prompt">~</span>
      <span className="text">{text}</span>
      <span className="cursor-blink" aria-hidden />
    </div>
  );
}

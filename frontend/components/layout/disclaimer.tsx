/** Required legal text (brief §28–29). Shown in the footer and on every results screen. */
export function Disclaimer({ className }: { className?: string }) {
  return (
    <p className={className ?? "text-xs text-muted-foreground"}>
      IELTSMate provides AI-generated practice feedback and <strong>estimated</strong> scores for educational purposes
      only. Scores are not official IELTS scores and are not a substitute for an official IELTS examination. IELTSMate is
      an independent IELTS preparation platform and is not affiliated with or endorsed by IELTS, Cambridge, IDP, or the
      British Council.
    </p>
  );
}

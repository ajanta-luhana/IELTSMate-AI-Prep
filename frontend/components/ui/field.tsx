import { Input } from "@/components/ui/input";

type Props = React.InputHTMLAttributes<HTMLInputElement> & { label: string; name: string };

/** Label + input pair with correct a11y wiring. */
export function Field({ label, name, ...props }: Props) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>
      <Input id={name} name={name} {...props} />
    </div>
  );
}

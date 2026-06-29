import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listFarms, type FarmRow } from "@/lib/services/farms.functions";

export function useFarms() {
  return useQuery({ queryKey: ["farms"], queryFn: () => listFarms() });
}

export function FarmSelector({
  value,
  onChange,
  className,
}: {
  value?: string;
  onChange: (id: string) => void;
  className?: string;
}) {
  const q = useFarms();
  const farms: FarmRow[] = q.data?.items ?? [];
  if (q.isLoading) return null;
  if (farms.length === 0) return null;
  if (farms.length === 1) return null;
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={className ?? "w-[220px]"}>
        <SelectValue placeholder="Select farm" />
      </SelectTrigger>
      <SelectContent>
        {farms.map((f) => (
          <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

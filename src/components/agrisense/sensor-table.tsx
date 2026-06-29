import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  SensorDeviceRow,
  SensorReadingRow,
} from "@/lib/services/agrisense.server";

/**
 * SensorTable — chronological list of incoming readings. Only real rows are
 * displayed. Caller decides whether to show empty state.
 */
export function SensorTable({
  readings,
  devices,
}: {
  readings: SensorReadingRow[];
  devices: SensorDeviceRow[];
}) {
  const byId = new Map(devices.map((d) => [d.id, d]));
  return (
    <div className="surface-card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Device</TableHead>
            <TableHead>Sensor</TableHead>
            <TableHead className="text-right">Value</TableHead>
            <TableHead>Recorded</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {readings.map((r) => {
            const d = byId.get(r.device_id);
            return (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  {d?.device_name ?? r.device_id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-xs">{r.sensor_type}</TableCell>
                <TableCell className="text-right font-mono text-xs">
                  {r.value}
                  {r.unit ? ` ${r.unit}` : ""}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(r.recorded_at).toLocaleString()}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

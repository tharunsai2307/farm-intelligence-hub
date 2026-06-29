import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { registerSensorDevice } from "@/lib/services/agrisense.service";

/**
 * DeviceRegistration
 *
 * Dialog form used to onboard new IoT devices. Does **not** simulate readings —
 * the device must POST to `/api/agrisense/sensors` to publish data.
 */
const DEVICE_TYPES = [
  { value: "esp32", label: "ESP32" },
  { value: "arduino", label: "Arduino" },
  { value: "lora", label: "LoRa" },
  { value: "mqtt", label: "MQTT" },
  { value: "weather_station", label: "Weather Station" },
  { value: "soil_probe", label: "Soil Probe" },
  { value: "camera", label: "Field Camera" },
  { value: "other", label: "Other" },
] as const;

type DeviceTypeValue = (typeof DEVICE_TYPES)[number]["value"];

export function DeviceRegistration({
  farmId,
  triggerLabel = "Register Device",
}: {
  farmId: string;
  triggerLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState<DeviceTypeValue>("esp32");
  const [manufacturer, setManufacturer] = useState("");
  const [serial, setSerial] = useState("");
  const [firmware, setFirmware] = useState("");
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () =>
      registerSensorDevice({
        data: {
          farm_id: farmId,
          device_name: name.trim(),
          device_type: type,
          manufacturer: manufacturer.trim() || null,
          serial_number: serial.trim() || null,
          firmware_version: firmware.trim() || null,
        },
      }),
    onSuccess: (res) => {
      if (!res.success) {
        toast.error(res.error);
        return;
      }
      toast.success("Device registered");
      qc.invalidateQueries({ queryKey: ["agrisense", "devices"] });
      setOpen(false);
      setName("");
      setSerial("");
      setManufacturer("");
      setFirmware("");
    },
    onError: (e) => toast.error(e instanceof Error ? e.message : "Failed"),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Register a sensor device</DialogTitle>
          <DialogDescription>
            Identify a physical device so AgriSense can accept its readings. The device must POST to
            <code className="mx-1 rounded bg-muted px-1 text-[11px]">/api/agrisense/sensors</code>
            with a bearer token to publish data.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name.trim()) {
              toast.error("Device name is required");
              return;
            }
            mutation.mutate();
          }}
          className="grid gap-3"
        >
          <div className="grid gap-1.5">
            <Label htmlFor="dev-name">Name</Label>
            <Input
              id="dev-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="North field soil probe"
              required
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dev-type">Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as DeviceTypeValue)}>
              <SelectTrigger id="dev-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEVICE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="dev-manu">Manufacturer</Label>
              <Input
                id="dev-manu"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="Optional"
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="dev-serial">Serial number</Label>
              <Input
                id="dev-serial"
                value={serial}
                onChange={(e) => setSerial(e.target.value)}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="dev-fw">Firmware version</Label>
            <Input
              id="dev-fw"
              value={firmware}
              onChange={(e) => setFirmware(e.target.value)}
              placeholder="e.g. 1.2.0"
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? "Registering…" : "Register"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

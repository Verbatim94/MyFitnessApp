"use client";

import { Download, RotateCcw, Upload } from "lucide-react";
import type { ChangeEvent } from "react";
import { Card, FieldLabel, Input, Pill, PrimaryButton, SectionHeader } from "@/components/ui";
import { exportAppData, useAppStore } from "@/lib/store";
import { isSupabaseClientConfigured } from "@/lib/supabase/config";
import { formatDateLabel } from "@/lib/utils";

export function SettingsScreen() {
  const { data, dispatch, syncError, syncState, lastSyncedAt } = useAppStore();

  const onImport = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        dispatch({ type: "import-data", payload: JSON.parse(String(reader.result)) });
      } catch {
        window.alert("Import failed. Please use a valid Phase export file.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-4">
      <Card>
        <SectionHeader title="Supabase sync" caption="Optional cloud backup on top of local-first storage." />
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Pill tone={syncState === "synced" ? "success" : syncState === "error" ? "warning" : "default"}>
              {syncState}
            </Pill>
            <span className="text-sm text-muted-foreground">
              {isSupabaseClientConfigured()
                ? "Client env detected"
                : "Add Supabase env values to enable remote sync"}
            </span>
          </div>
          <div className="rounded-3xl border border-white/8 bg-card-2/60 p-4 text-sm text-muted-foreground">
            {lastSyncedAt
              ? `Last remote sync: ${formatDateLabel(lastSyncedAt)}`
              : "No remote sync completed yet."}
            {syncError ? ` Error: ${syncError}` : ""}
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Profile and phase" caption="Make the app easy to rename later." />
        <div className="space-y-4">
          <div>
            <FieldLabel>App name</FieldLabel>
            <Input
              value={data.settings.appName}
              onChange={(event) => dispatch({ type: "update-settings", patch: { appName: event.target.value } })}
            />
          </div>
          <div>
            <FieldLabel>Current phase</FieldLabel>
            <Input
              value={data.settings.currentPhase}
              onChange={(event) => dispatch({ type: "update-settings", patch: { currentPhase: event.target.value } })}
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Nutrition targets" caption="Calendar mode resolves whether ON or OFF is active." />
        <div className="space-y-5">
          <TargetEditor title="ON day" prefix="onTargets" />
          <TargetEditor title="OFF day" prefix="offTargets" />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <FieldLabel>Fiber target</FieldLabel>
              <Input
                type="number"
                value={data.settings.fiberTarget}
                onChange={(event) => dispatch({ type: "update-settings", patch: { fiberTarget: Number(event.target.value) } })}
              />
            </div>
            <div>
              <FieldLabel>Water target (L)</FieldLabel>
              <Input
                type="number"
                step="0.1"
                value={data.settings.waterTargetLiters}
                onChange={(event) => dispatch({ type: "update-settings", patch: { waterTargetLiters: Number(event.target.value) } })}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Supplements and templates" caption="Seeded for the MVP and easy to extend later." />
        <div className="space-y-4">
          <div>
            <FieldLabel>Supplement list</FieldLabel>
            <Input
              value={data.settings.supplementList.join(", ")}
              onChange={(event) =>
                dispatch({
                  type: "update-settings",
                  patch: { supplementList: event.target.value.split(",").map((item) => item.trim()).filter(Boolean) }
                })
              }
            />
          </div>
          <div className="rounded-3xl border border-white/8 bg-card-2/60 p-4 text-sm text-muted-foreground">
            Training templates included: Upper A, Lower A, Upper B, Lower B. Storage is local-first and structured so templates can move to Supabase later without changing UI contracts.
          </div>
          <div>
            <FieldLabel>Preferred weekly schedule</FieldLabel>
            <Input
              value={data.settings.preferredWeeklySchedule.join(", ")}
              onChange={(event) =>
                dispatch({
                  type: "update-settings",
                  patch: {
                    preferredWeeklySchedule: event.target.value
                      .split(",")
                      .map((item) => item.trim().toLowerCase())
                      .filter(Boolean) as typeof data.settings.preferredWeeklySchedule
                  }
                })
              }
            />
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader title="Data tools" caption="Export or reset the local MVP safely." />
        <div className="grid gap-3">
          <PrimaryButton onClick={() => exportAppData(data)} className="w-full justify-center">
            <Download className="h-4 w-4" />
            Export JSON
          </PrimaryButton>
          <label className="flex h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/4 text-sm font-semibold text-foreground">
            <Upload className="h-4 w-4" />
            Import JSON
            <input type="file" accept="application/json" className="hidden" onChange={onImport} />
          </label>
          <button
            type="button"
            onClick={() => dispatch({ type: "reset-data" })}
            className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-danger/20 bg-danger/10 text-sm font-semibold text-danger"
          >
            <RotateCcw className="h-4 w-4" />
            Reset data
          </button>
        </div>
      </Card>
    </div>
  );
}

function TargetEditor({ title, prefix }: { title: string; prefix: "onTargets" | "offTargets" }) {
  const { data, dispatch } = useAppStore();
  const target = data.settings[prefix];

  return (
    <div>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="grid grid-cols-2 gap-3">
        {(["calories", "protein", "carbs", "fats", "fiber"] as const).map((key) => (
          <div key={key}>
            <FieldLabel>{key}</FieldLabel>
            <Input
              type="number"
              value={target[key]}
              onChange={(event) =>
                dispatch({
                  type: "update-settings",
                  patch: {
                    [prefix]: { ...target, [key]: Number(event.target.value) }
                  }
                })
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
}

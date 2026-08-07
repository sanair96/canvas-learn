import { createFileRoute } from "@tanstack/react-router"
import { useDeferredValue, useState } from "react"

import { StarField } from "./-component/StarField"

import { Label } from "#/components/ui/label"
import {
  RadioGroup,
  RadioGroupItem,
} from "#/components/ui/radio-group"
import { Slider } from "#/components/ui/slider"
import {
  Field,
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "#/components/ui/field"
import ThemeToggle from "#/components/ThemeToggle"

export const Route = createFileRoute("/starfield")({
  component: RouteComponent,
})

type ForceType = "attract" | "repel"

interface StarFieldSettings {
  forceDirection: ForceType
  numStars: number
  influenceRadius: number
  innerInfluenceRadius: number
  maxAcceleration: number
  dampingFactor: number
}

const DEFAULT_SETTINGS: StarFieldSettings = {
  forceDirection: "attract",
  numStars: 10_000,
  influenceRadius: 50,
  innerInfluenceRadius: 10,
  maxAcceleration: 100,
  dampingFactor: 0.9,
}

const getSliderValue = (value: number | number[]) =>
  Array.isArray(value) ? value[0] : value

function RouteComponent() {
  const [settings, setSettings] =
    useState<StarFieldSettings>(DEFAULT_SETTINGS)

  const deferredNumStars = useDeferredValue(settings.numStars)

  const updateSetting = <K extends keyof StarFieldSettings>(
    key: K,
    value: StarFieldSettings[K],
  ) => {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }))
  }

  return (
    <div className="relative min-h-screen grid">
      <StarField
        forceDirection={settings.forceDirection}
        influenceRadius={settings.influenceRadius}
        innerInfluenceRadius={settings.innerInfluenceRadius}
        numStars={deferredNumStars}
        maxAcceleration={settings.maxAcceleration}
        dampingFactor={settings.dampingFactor}
      />

      <div className="absolute top-4 left-4 z-10 w-80 rounded-xl border bg-background text-foreground p-5 backdrop-blur">
        <FieldSet>
          <FieldLegend className="w-full flex justify-between items-center"><span>Starfield Controls</span><span><ThemeToggle/></span></FieldLegend>

          <Field>
            <Label>Force direction</Label>

            <RadioGroup
              className="flex gap-4"
              value={settings.forceDirection}
              onValueChange={(value) =>
                updateSetting("forceDirection", value as ForceType)
              }
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="attract" id="attract" />
                <Label htmlFor="attract">Attract</Label>
              </div>

              <div className="flex items-center gap-2">
                <RadioGroupItem value="repel" id="repel" />
                <Label htmlFor="repel">Repel</Label>
              </div>
            </RadioGroup>
          </Field>

          <SliderField
            label="Number of stars"
            value={settings.numStars}
            min={100}
            max={15_000}
            step={100}
            onChange={(value) => updateSetting("numStars", value)}
          />

          <SliderField
            label="Influence radius"
            value={settings.influenceRadius}
            min={10}
            max={300}
            step={1}
            suffix="px"
            onChange={(value) =>
              updateSetting("influenceRadius", value)
            }
          />

          <SliderField
            label="Inner influence radius"
            value={settings.innerInfluenceRadius}
            min={0}
            max={settings.influenceRadius}
            step={1}
            suffix="px"
            onChange={(value) =>
              updateSetting("innerInfluenceRadius", value)
            }
          />

          <SliderField
            label="Max acceleration"
            value={settings.maxAcceleration}
            min={0}
            max={2_000}
            step={10}
            onChange={(value) =>
              updateSetting("maxAcceleration", value)
            }
          />

          <SliderField
            label="Damping factor"
            value={settings.dampingFactor}
            min={0}
            max={1}
            step={0.01}
            formatValue={(value) => value.toFixed(2)}
            onChange={(value) =>
              updateSetting("dampingFactor", value)
            }
          />
        </FieldSet>
      </div>
    </div>
  )
}

interface SliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  step?: number
  suffix?: string
  formatValue?: (value: number) => string
  onChange: (value: number) => void
}

function SliderField({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  formatValue,
  onChange,
}: SliderFieldProps) {
  const displayValue = formatValue?.(value) ?? value

  return (
    <Field>
      <div className="flex items-center justify-between">
        <Label>{label}</Label>

        <FieldDescription>
          {displayValue}
          {suffix}
        </FieldDescription>
      </div>

      <Slider
        value={value}
        min={min}
        max={max}
        step={step}
        onValueChange={(value) => {
          onChange(getSliderValue(value as number))
        }}
      />
    </Field>
  )
}
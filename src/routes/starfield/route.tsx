import { createFileRoute } from "@tanstack/react-router";
import { useDeferredValue, useState } from "react";

import ThemeToggle from "#/components/ThemeToggle";
import {
  Field,
  FieldDescription,
  FieldLegend,
  FieldSet,
} from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import {
  RadioGroup,
  RadioGroupItem,
} from "#/components/ui/radio-group";
import { Slider } from "#/components/ui/slider";
import { ChevronDown, ChevronUp } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { StarField } from "./-component/StarField";
import { Separator } from "#/components/ui/separator";

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

const getSliderValue = (value: number | readonly number[]) =>
  Array.isArray(value) ? value[0] : value

function RouteComponent() {
  const [settings, setSettings] =
    useState<StarFieldSettings>(DEFAULT_SETTINGS)
  const [expanded, setExpanded] = useState<boolean>(true)


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
        dampingFactor={1-settings.dampingFactor}
      />

      <div className="absolute top-4 right-4 z-10 w-80 rounded-xl border bg-background text-foreground backdrop-blur">
        <FieldSet className="gap-0">
          <FieldLegend className="w-full flex justify-between items-center px-5 pt-5"><span>Starfield Controls</span><span><ThemeToggle /></span></FieldLegend>
          <Separator />
          <motion.div
            className="overflow-hidden"
            animate={{
              height: expanded ? 'auto' : 0,
            }}
          >

            <motion.div className="flex flex-col gap-4 p-5">

              <Field className="">
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
            </motion.div>
          </motion.div>

          <Separator className="m-0 p-0" />
          <motion.button className="w-full h-full flex text-foreground items-center justify-center hover:bg-gray-100 active:bg-gray-200 transition-all rounded-sm py-2 rounded-t-none"
            whileTap={{
              scale: 0.98
            }}
            onClick={() => setExpanded(prevState => !prevState)}
          >
            <AnimatePresence mode="popLayout">
              {expanded && <motion.span
                initial={{ translateY: -10, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}

                exit={{ translateY: -10, opacity: 0 }}><ChevronUp /></motion.span>}
            </AnimatePresence>
            <AnimatePresence mode="popLayout">
              {!expanded && <motion.span
                initial={{ translateY: 10, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                exit={{ translateY: 10, opacity: 0 }}><ChevronDown /></motion.span>}
            </AnimatePresence>

          </motion.button>
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
          onChange(getSliderValue(value))
        }}
      />
    </Field>
  )
}
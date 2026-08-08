import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ChevronDown, ChevronUp } from "lucide-react"

import DrawArea from "./-component/-DrawArea"

import ThemeToggle from "#/components/ThemeToggle"
import {
    Field,
    FieldDescription,
    FieldLegend,
    FieldSet,
} from "#/components/ui/field"
import { Label } from "#/components/ui/label"
import {
    RadioGroup,
    RadioGroupItem,
} from "#/components/ui/radio-group"
import { Slider } from "#/components/ui/slider"
import { Separator } from "#/components/ui/separator"

export const Route = createFileRoute("/practice")({
    component: RouteComponent,
})

export type DrawConfig = {
    shape: "rect" | 'circ'
    strokeWidth: number
    radii: number
}

const DEFAULT_CONFIG: DrawConfig = {
    shape: "rect",
    strokeWidth: 10,
    radii: 10,
}

const getSliderValue = (value: number | readonly number[]) =>
    Array.isArray(value) ? value[0] : value

function RouteComponent() {
    const [config, setConfig] = useState(DEFAULT_CONFIG)
    const [expanded, setExpanded] = useState(true)

    const updateConfig = <K extends keyof DrawConfig>(
        key: K,
        value: DrawConfig[K],
    ) => {
        setConfig((current) => ({
            ...current,
            [key]: value,
        }))
    }

    return (
        <div className="relative h-screen w-full">
            <DrawArea
                shape={config.shape}
                strokeWidth={config.strokeWidth}
                radii={config.radii}
            />

            <div className="absolute top-4 right-4 z-10 w-80 rounded-xl border bg-background text-foreground backdrop-blur">
                <FieldSet className="gap-0">
                    <motion.div>
                        <FieldLegend className="flex w-full items-center justify-between px-5 pt-5">
                            <span>Draw Controls</span>

                            <ThemeToggle />
                        </FieldLegend>

                        <Separator />

                        <motion.div
                            className="overflow-hidden"
                            animate={{
                                height: expanded ? "auto" : 0,
                            }}
                        >
                            <motion.div className="flex flex-col gap-4 p-5">
                                <Field>
                                    <Label>Shape</Label>

                                    <RadioGroup
                                        className="flex gap-4"
                                        value={config.shape}
                                        onValueChange={(value) =>
                                            updateConfig(
                                                "shape",
                                                value as DrawConfig["shape"],
                                            )
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem
                                                value="rect"
                                                id="rect"
                                            />

                                            <Label htmlFor="rect">
                                                Rectangle
                                            </Label>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <RadioGroupItem
                                                value="circ"
                                                id="circ"
                                            />

                                            <Label htmlFor="rect">
                                                Circle
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </Field>

                                <SliderField
                                    label="Stroke width"
                                    value={config.strokeWidth}
                                    min={1}
                                    max={50}
                                    step={1}
                                    suffix="px"
                                    onChange={(value) =>
                                        updateConfig("strokeWidth", value)
                                    }
                                />
                                <motion.div animate={{height: config.shape === 'circ' ? 0:'auto', opacity: config.shape === 'circ' ? 0:1}}>
                                    <SliderField
                                        label="Corner radius"
                                        value={config.radii}
                                        min={0}
                                        max={100}
                                        step={1}
                                        suffix="px"
                                        onChange={(value) =>
                                            updateConfig("radii", value)
                                        }
                                    />
                                </motion.div>
                            </motion.div>
                        </motion.div>

                        <Separator />

                        <motion.button
                            type="button"
                            className="flex w-full items-center justify-center rounded-b-xl py-2 text-foreground transition-colors hover:bg-muted"
                            whileTap={{
                                scale: 0.98,
                            }}
                            onClick={() =>
                                setExpanded((current) => !current)
                            }
                        >
                            <AnimatePresence
                                mode="wait"
                                initial={false}
                            >
                                {expanded ? (
                                    <motion.span
                                        key="expanded"
                                        initial={{
                                            y: -10,
                                            opacity: 0,
                                        }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        exit={{
                                            y: -10,
                                            opacity: 0,
                                        }}
                                    >
                                        <ChevronUp />
                                    </motion.span>
                                ) : (
                                    <motion.span
                                        key="collapsed"
                                        initial={{
                                            y: 10,
                                            opacity: 0,
                                        }}
                                        animate={{
                                            y: 0,
                                            opacity: 1,
                                        }}
                                        exit={{
                                            y: 10,
                                            opacity: 0,
                                        }}
                                    >
                                        <ChevronDown />
                                    </motion.span>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    </motion.div>
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
    const displayValue =
        formatValue?.(value) ?? value

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
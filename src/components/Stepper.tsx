"use client";

import React from "react";
import { Check } from "lucide-react";

export type StepperStep = { label: string };

export type StepperProps = {
  steps: StepperStep[];
  currentStep?: number;
  subProgress?: number;
  onStepChange?: (nextStep: number) => void;
};

/* ---------- Progress helpers ---------- */

function getStepWeights(totalSteps: number): number[] {
  if (totalSteps <= 1) return [100];

  const base = 100 / totalSteps;
  const small = base / 2;
  const middleCount = totalSteps - 2;
  const middle =
    middleCount > 0 ? (100 - small * 2) / middleCount : 100 - small * 2;

  return Array.from({ length: totalSteps }, (_, i) =>
    i === 0 || i === totalSteps - 1 ? small : middle
  );
}

function getProgress(currentStepNumber: number, totalSteps: number, subProgress: number = 0) {
  // console.log("CURRENT STEP NUMBER -> ",currentStepNumber, totalSteps, subProgress);
  const weights = getStepWeights(totalSteps);
  if (currentStepNumber <= 2) {
    const firstStepWeight = weights[0];
    // console.log("FIRST STEP WEIGHT -> ",(subProgress / 100) * firstStepWeight);
    return (subProgress / 100) * firstStepWeight;
  }
  const baseProgress = weights.slice(0, currentStepNumber - 1).reduce((a, b) => a + b, 0);
  
  const currentStepWeight = weights[currentStepNumber - 1] || 0;
  const additionalProgress = (subProgress / 100) * currentStepWeight;
  
  return baseProgress + additionalProgress;
}

/* ---------------------- Stepper ---------------------- */

export default function Stepper({
  steps,
  currentStep = 0,
  subProgress = 0,
  onStepChange,
}: StepperProps) {
  
  const isControlled = typeof onStepChange === "function";
  const [internalStep, setInternalStep] = React.useState(currentStep);

  React.useEffect(() => {
    if (!isControlled) setInternalStep(currentStep);
  }, [currentStep, isControlled]);

  const rawIndex = isControlled ? currentStep : internalStep;
  const totalSteps = steps.length;
  const currentStepNumber = Math.min(totalSteps, Math.max(1, rawIndex + 1));

  const progress = Math.min(
    100,
    Math.max(
      0,
      Math.round(getProgress(currentStepNumber, totalSteps, subProgress))
    )
  );

  const setStepIndex = (index: number) => {
    // Allow clicking on all steps now - logic handled in onStepChange
    isControlled ? onStepChange?.(index) : setInternalStep(index);
  };
  // console.log("PROGRESS -> ",progress);
  return (
    <div className="w-[90%] px-4 md:px-8 pb-4">
      <div className="relative flex items-center justify-center min-h-5">
        {/* Progress line container*/}
        <div id="progress-line" className="absolute w-full">
          {/* BASE LINE */}
          <div className="absolute left-0 right-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-300" />

          {/* PROGRESS LINE */}
          <div
            className="absolute left-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Steps container */}
        <div
          id="steps-container"
          className="relative z-10 h-10 flex w-full items-center justify-between"
        >
          {/* STEPS */}
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = stepNumber < currentStepNumber;
            const isActive = stepNumber === currentStepNumber;

            return (
              <div
                key={index}
                className="relative z-10 flex flex-col items-center w-1 overflow-visible max-sm:w-8"
              >
                <button
                  onClick={() => setStepIndex(index)}
                  className={`
              flex h-9 w-9 md:h-10 md:w-10 items-center justify-center
              rounded-full font-semibold transition-all mt-6
              ${
                isCompleted || isActive
                  ? "bg-primary text-white"
                  : "bg-gray-300 text-gray-600"
              }
              ${isActive ? "ring-4 ring-primary/30" : ""}
            `}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4 md:h-5 md:w-5" />
                  ) : (
                    stepNumber
                  )}
                </button>

                <span
                  className={`mt-2 text-xs md:text-sm whitespace-nowrap ${
                    isActive ? "font-semibold text-black" : "text-gray-600"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

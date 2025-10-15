// ABOUTME: Artifact Chest Calculator page for calculating upgrade requirements
// ABOUTME: Allows users to input current artifact levels and see chest requirements to reach level 100

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatTitle } from "~/config/site";
import {
  calculateArtifactUpgrade,
  type ColorTier,
} from "~/lib/artifact-calculations";
import type { Route } from "./+types/artifact-calculator";

export const meta = (_: Route.MetaArgs) => {
  return [
    { title: formatTitle("Artifact Chest Calculator") },
    {
      name: "description",
      content:
        "Calculate the number of artifact chests needed to upgrade your heroes' artifacts to level 100",
    },
  ];
};

const COLOR_LABELS: Record<ColorTier, string> = {
  white: "White",
  green: "Green",
  blue: "Blue",
  violet: "Violet",
  orange: "Orange",
};

const COLOR_STYLES: Record<ColorTier, string> = {
  white: "bg-gray-100 text-gray-800 border-gray-300",
  green: "bg-green-100 text-green-800 border-green-300",
  blue: "bg-blue-100 text-blue-800 border-blue-300",
  violet: "bg-purple-100 text-purple-800 border-purple-300",
  orange: "bg-orange-100 text-orange-800 border-orange-300",
};

interface ArtifactInputProps {
  label: string;
  description: string;
  value: number;
  onChange: (value: number) => void;
}

function ArtifactInput({
  label,
  description,
  value,
  onChange,
}: ArtifactInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value);
    if (!isNaN(val) && val >= 1 && val <= 100) {
      onChange(val);
    } else if (e.target.value === "") {
      onChange(1);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase()}>{label}</Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <Input
        id={label.toLowerCase()}
        type="number"
        min={1}
        max={100}
        value={value}
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
}

interface ArtifactResultsProps {
  title: string;
  currentLevel: number;
}

function ArtifactResults({ title, currentLevel }: ArtifactResultsProps) {
  if (currentLevel === 100) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Artifact is already at maximum level!
          </p>
        </CardContent>
      </Card>
    );
  }

  const result = calculateArtifactUpgrade(currentLevel);

  // Filter out colors with 0 chests needed
  const relevantColors = (
    ["white", "green", "blue", "violet", "orange"] as ColorTier[]
  ).filter((color) => result.chests[color] > 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>
          From level {currentLevel} to level 100
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Chests */}
        <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
          <div className="text-sm font-medium text-muted-foreground">
            Total Chests Needed
          </div>
          <div className="text-3xl font-bold text-primary">
            {result.totalChests}
          </div>
        </div>

        {/* Breakdown by color */}
        <div className="space-y-3">
          <div className="text-sm font-medium text-muted-foreground">
            Breakdown by Color
          </div>
          {relevantColors.map((color) => (
            <div
              key={color}
              className={`p-3 rounded-lg border ${COLOR_STYLES[color]}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{COLOR_LABELS[color]}</span>
                <span className="text-lg font-bold">
                  {result.chests[color]} chests
                </span>
              </div>
              <div className="text-sm opacity-80">
                {result.components[color]} components needed
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function ArtifactCalculator() {
  const [weaponLevel, setWeaponLevel] = useState(1);
  const [bookLevel, setBookLevel] = useState(1);
  const [ringLevel, setRingLevel] = useState(1);

  return (
    <div className="container max-w-6xl mx-auto p-4 md:p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Artifact Chest Calculator
        </h1>
        <p className="text-muted-foreground">
          Calculate how many artifact chests you need to open to upgrade your
          heroes' artifacts to level 100.
        </p>
      </div>

      {/* Input Section */}
      <Card>
        <CardHeader>
          <CardTitle>Current Artifact Levels</CardTitle>
          <CardDescription>
            Enter the current levels for each artifact type (1-100)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <ArtifactInput
              label="Weapon"
              description="Artifact Essences"
              value={weaponLevel}
              onChange={setWeaponLevel}
            />
            <ArtifactInput
              label="Book"
              description="Artifact Scrolls"
              value={bookLevel}
              onChange={setBookLevel}
            />
            <ArtifactInput
              label="Ring"
              description="Artifact Metals"
              value={ringLevel}
              onChange={setRingLevel}
            />
          </div>
        </CardContent>
      </Card>

      {/* Results Section */}
      <div className="grid gap-6 md:grid-cols-3">
        <ArtifactResults title="Weapon (Essences)" currentLevel={weaponLevel} />
        <ArtifactResults title="Book (Scrolls)" currentLevel={bookLevel} />
        <ArtifactResults title="Ring (Metals)" currentLevel={ringLevel} />
      </div>

      {/* Information Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-muted-foreground">
          <p>
            Each artifact can be upgraded from level 1 to 100 using colored
            components obtained from artifact-specific chests.
          </p>
          <div className="space-y-1">
            <p className="font-medium text-foreground">Chest Yields:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>White chests: 12 components</li>
              <li>Green chests: 7 components</li>
              <li>Blue chests: 4 components</li>
              <li>Violet chests: 3 components</li>
              <li>Orange chests: 2 components</li>
            </ul>
          </div>
          <p>
            The calculator automatically determines which color tiers you need
            and calculates the total number of chests required, always rounding
            up to ensure you have enough components.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

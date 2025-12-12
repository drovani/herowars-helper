// ABOUTME: Skin Upgrade Calculator page for calculating upgrade requirements
// ABOUTME: Allows users to input current skin levels and see chest requirements to reach level 60

import { useState } from "react";
import { Button } from "~/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { formatTitle } from "~/config/site";
import {
    calculateSkinUpgrade,
    getOtherSkinNames,
    type SkinType,
} from "~/lib/skin-calculations";
import type { Route } from "./+types/skin-calculator";

export const meta = (_: Route.MetaArgs) => {
    return [
        { title: formatTitle("Skin Upgrade Calculator") },
        {
            name: "description",
            content:
                "Calculate the number of skin stone chests needed to upgrade your hero's skins to level 60",
        },
    ];
};

interface SkinRow {
    name: string;
    type: SkinType;
}

// Define all skin types in the required order
const SKIN_ROWS: SkinRow[] = [
    { name: "Default", type: "default" },
    { name: "Champion", type: "champion" },
    ...getOtherSkinNames()
        .sort()
        .map((name) => ({
            name,
            type: "other" as SkinType,
        })),
    { name: "Winter", type: "winter" },
];

export default function SkinCalculator() {
    // State for each skin's current level
    const [skinLevels, setSkinLevels] = useState<Record<string, number | "">>(
        () => {
            const initialState: Record<string, number | ""> = {};
            SKIN_ROWS.forEach((row) => {
                initialState[row.name] = 0;
            });
            return initialState;
        }
    );

    // State for unlock cost toggle
    const [includeUnlockCost, setIncludeUnlockCost] = useState(false);

    const handleLevelChange = (skinName: string, value: string) => {
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 0 && numValue <= 60) {
            setSkinLevels((prev) => ({ ...prev, [skinName]: numValue }));
        } else if (value === "") {
            setSkinLevels((prev) => ({ ...prev, [skinName]: "" }));
        }
    };

    const handleClear = () => {
        const clearedState: Record<string, number | ""> = {};
        SKIN_ROWS.forEach((row) => {
            clearedState[row.name] = 0;
        });
        setSkinLevels(clearedState);
    };

    // Calculate totals
    const totals = SKIN_ROWS.reduce(
        (acc, row) => {
            const level = skinLevels[row.name];
            if (level === "" || level === 0) return acc;

            const result = calculateSkinUpgrade(row.type, level, { includeUnlockCost });
            acc.stones += result.stones;
            acc.smallChests += result.smallChests;
            acc.largeChests += result.largeChests;
            return acc;
        },
        { stones: 0, smallChests: 0, largeChests: 0 }
    );

    return (
        <div className="container max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">
                    Skin Upgrade Calculator
                </h1>
                <p className="text-muted-foreground">
                    Calculate how many skin stone chests you need to open to upgrade your
                    hero's skins to level 60.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div className="space-y-1.5">
                            <CardTitle>Skin Levels</CardTitle>
                            <CardDescription>
                                Enter the current level for each skin (0-60). Leave at 0 if you
                                don't have the skin.
                            </CardDescription>
                        </div>
                        <div className="flex flex-col gap-3 md:items-end">
                            <Button variant="outline" onClick={handleClear} className="w-full md:w-auto">
                                Clear
                            </Button>
                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="unlock-cost"
                                    checked={includeUnlockCost}
                                    onCheckedChange={(checked) => setIncludeUnlockCost(checked === true)}
                                />
                                <Label
                                    htmlFor="unlock-cost"
                                    className="text-sm font-normal cursor-pointer leading-tight"
                                >
                                    Include unlock cost for "Other" skins (5,000 stones)
                                </Label>
                            </div>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium">Skin</th>
                                    <th className="text-center p-2 font-medium w-32">
                                        Current Level
                                    </th>
                                    <th className="text-right p-2 font-medium">Stones Needed</th>
                                    <th className="text-right p-2 font-medium">
                                        Small Chests (10)
                                    </th>
                                    <th className="text-right p-2 font-medium">
                                        Large Chests (150)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {SKIN_ROWS.map((row) => {
                                    const level = skinLevels[row.name];
                                    const effectiveLevel = level === "" ? 0 : level;
                                    const result = calculateSkinUpgrade(row.type, effectiveLevel, { includeUnlockCost });

                                    return (
                                        <tr key={row.name} className="border-b hover:bg-muted/50">
                                            <td className="p-2">{row.name}</td>
                                            <td className="p-2">
                                                <Input
                                                    type="number"
                                                    min={0}
                                                    max={60}
                                                    value={level}
                                                    onChange={(e) =>
                                                        handleLevelChange(row.name, e.target.value)
                                                    }
                                                    className="w-24 mx-auto text-center"
                                                />
                                            </td>
                                            <td className="p-2 text-right font-mono">
                                                {result.stones.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right font-mono">
                                                {result.smallChests.toLocaleString()}
                                            </td>
                                            <td className="p-2 text-right font-mono">
                                                {result.largeChests.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                                <tr className="border-t-2 font-bold bg-primary/5">
                                    <td className="p-2">Total</td>
                                    <td className="p-2"></td>
                                    <td className="p-2 text-right font-mono">
                                        {totals.stones.toLocaleString()}
                                    </td>
                                    <td className="p-2 text-right font-mono">
                                        {totals.smallChests.toLocaleString()}
                                    </td>
                                    <td className="p-2 text-right font-mono">
                                        {totals.largeChests.toLocaleString()}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">How It Works</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        Each hero skin can be upgraded from level 1 to 60 using skin stones
                        obtained from skin stone chests.
                    </p>
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">Chest Yields:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>Small Skin Stone Chests: 10 stones</li>
                            <li>Large Skin Stone Chests: 150 stones</li>
                        </ul>
                    </div>
                    <div className="space-y-1">
                        <p className="font-medium text-foreground">Skin Types:</p>
                        <ul className="list-disc list-inside space-y-1 ml-2">
                            <li>
                                <strong>Default:</strong> Increases hero's main stat (30,825
                                stones total)
                            </li>
                            <li>
                                <strong>Champion:</strong> Available in Guild War Shop (54,330
                                stones total)
                            </li>
                            <li>
                                <strong>Winter:</strong> Available during Winterfest event
                                (53,412 stones total)
                            </li>
                            <li>
                                <strong>Other skins:</strong> Include Beach, Stellar,
                                Masquerade, Celestial, Cybernetic, and more (50,410 stones each
                                to level, plus 5,000 to unlock)
                            </li>
                        </ul>
                    </div>
                    <p className="text-xs italic">
                        Note: This calculator shows stones needed to level from current
                        level to 60. "Other" skin types do not include the 5,000 stone
                        unlock cost, as the calculator assumes you already have the skin.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
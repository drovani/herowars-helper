import { EquipmentRecord } from "@/data/equipment.zod";
import { equipmentDAL } from "@/lib/equipment-dal";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { Readable } from "node:stream";

function removeEmptyArrays<T>(_: string, value: T): T | undefined {
    // Check if value is an array and it's empty
    if (Array.isArray(value) && value.length === 0) {
        return undefined; // This will exclude the property
    }
    return value;
}

// Ensure dates are in ISO format when stringifying
function formatEquipmentForExport(equipment: EquipmentRecord[]): EquipmentRecord[] {
    return equipment.map((item) => ({
        ...item,
        created_at: new Date(item.created_at).toISOString(),
    }));
}

export async function loader() {
    const equipment = await equipmentDAL.getAllEquipment();
    const formattedEquipment = formatEquipmentForExport(equipment);

    const file = createReadableStreamFromReadable(
        Readable.from(JSON.stringify(formattedEquipment, removeEmptyArrays, 2))
    );

    return new Response(file, {
        headers: {
            "Content-Disposition": 'attachment; filename="equipment.json"',
            "Content-Type": "application/json",
        },
    });
}

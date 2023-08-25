import React from "react";
import { convertColorsToStyles } from "../../utils";
import { TLabel } from "../../constant/types";

function Label({ label }: { label: TLabel }) {
    const { value, color } = label;
    return (
        <div
            className={`border rounded-lg px-2 text-sm ${convertColorsToStyles(
                color
            )}`}
        >
            {value}
        </div>
    );
}

export default Label;

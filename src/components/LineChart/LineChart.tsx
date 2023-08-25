import { linearGradientDef } from "@nivo/core";
import { ResponsiveLine } from "@nivo/line";
import moment from "moment";
import { useEffect, useState } from "react";
import { convertColorsToStyles, parseChartData } from "../../utils";

const LineChart = ({ data /* see data tab */ }: { data: any }) => {
    const [activeTimeBucket, setActiveTimeBucket] = useState("weekly");
    const [activeLabels, setActiveLabels] = useState<{
        [key: string]: boolean;
    }>({});
    const currentlyActiveLabels = () =>
        Object.keys(activeLabels).filter((v) => activeLabels[v]);
    useEffect(() => {
        setActiveLabels((labels) => ({ ...labels, [data?.[0]?.id]: true }));
    }, [data]);

    return (
        <div>
            <div className="flex justify-between">
                <h1 className="text-xl font-bold">Performance</h1>
                <div className="space-x-2 hidden">
                    {["daily", "weekly", "monthly", "all"].map((l) => (
                        <div
                            key={Math.random()}
                            onClick={() => setActiveTimeBucket(l)}
                            className={`capitalize px-4 py-1 rounded-2xl cursor-pointer ${
                                activeTimeBucket === l
                                    ? "text-blue-600 font-bold bg-blue-100"
                                    : "text-gray-500"
                            }`}
                        >
                            {l}
                        </div>
                    ))}
                </div>
            </div>
            <div className="my-4">
                <div className="flex space-x-2">
                    {data.map((d: any) => (
                        <div
                            key={Math.random()}
                            onClick={() => {
                                if (d.id in activeLabels) {
                                    setActiveLabels({
                                        ...activeLabels,
                                        [d.id]: !activeLabels[d.id],
                                    });
                                } else {
                                    setActiveLabels({
                                        ...activeLabels,
                                        [d.id]: true,
                                    });
                                }
                            }}
                            className={`px-2 select-none cursor-pointer border rounded-lg ${
                                activeLabels[d.id]
                                    ? convertColorsToStyles(d.color)
                                    : "bg-gray-100"
                            }`}
                        >
                            {d.id}
                        </div>
                    ))}
                </div>
            </div>
            <div className="h-96 mt-12">
                <ResponsiveLine
                    data={parseChartData({
                        series: data,
                        activeLabels: currentlyActiveLabels(),
                    })}
                    colors={({ color }) => {
                        return color;
                    }}
                    defs={[
                        // using helpers
                        // will inherit colors from current element
                        linearGradientDef("gradientA", [
                            { offset: 0, color: "inherit" },
                            { offset: 100, color: "inherit", opacity: 0 },
                        ]),
                        // using plain object
                        {
                            id: "gradientC",
                            type: "linearGradient",
                            colors: [
                                { offset: 0, color: "inherit" },
                                { offset: 100, color: "#ffffff", opacity: 0 },
                            ],
                        },
                    ]}
                    fill={[{ match: "*", id: "gradientC" }]}
                    margin={{ top: 100, right: 20, bottom: 50, left: 20 }}
                    xScale={{ type: "time" }}
                    yScale={{
                        type: "linear",
                        min: 0,
                        max: 10,
                        stacked: false,
                        reverse: false,
                    }}
                    curve="catmullRom"
                    axisTop={null}
                    axisRight={null}
                    axisBottom={{
                        tickSize: 5,
                        tickValues: "every day",
                        format: (value) => {
                            return moment(value).format("DD MMM");
                        },
                        tickPadding: 5,
                        tickRotation: 0,
                    }}
                    axisLeft={null}
                    enableGridX={false}
                    lineWidth={3}
                    enablePoints={true}
                    pointSize={10}
                    pointColor={{ from: "color", modifiers: [] }}
                    pointBorderWidth={2}
                    pointBorderColor={{ from: "serieColor" }}
                    pointLabelYOffset={-12}
                    enableArea={true}
                    areaOpacity={0.4}
                    enableSlices="x"
                    useMesh={true}
                    legends={[]}
                />
            </div>
        </div>
    );
};

export default LineChart;

// make sure parent container have a defined height when using
// responsive component, otherwise height will be 0 and
// no chart will be rendered.
// website examples showcase many properties,
// you'll often use just a few of them.

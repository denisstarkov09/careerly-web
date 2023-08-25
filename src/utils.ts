import { Datum, Serie } from "@nivo/line";
import moment from "moment";
import _ from "underscore";

const getMinDate = (serie: Serie): Date => {
    const minDate =
        (_.min(serie.data, (d) => new Date(d.x?.toString() || "")) as Datum)
            .x || "";
    return new Date(minDate || "");
};

const getMaxDate = (serie: Serie): Date => {
    const maxDate =
        (_.max(serie.data, (d) => new Date(d.x?.toString() || "")) as Datum)
            .x || "";
    return new Date(maxDate || "");
};

const getMinDateFromSeries = (series: Serie[]) => {
    // find the minimum of all the minimums
    const minDate = _.min(
        // convert all series into their minimum date
        _.map(series, (serie) =>
            // for a given serie find the minimum date
            getMinDate(serie)
        )
    );

    return minDate;
};
const getMaxDateFromSeries = (series: Serie[]) => {
    const maxDate = _.max(_.map(series, (serie) => getMaxDate(serie)));
    return maxDate;
};

type Grouping = "day" | "week" | "month";
// Find min and max dates from all series and then interpolate missing null values
export const parseChartData = ({
    series,
    grouping,
    activeLabels,
}: {
    series: Serie[];
    grouping?: Grouping;
    activeLabels?: string[];
}) => {
    const filteredSeries = series.filter((s) =>
        activeLabels?.includes(s.id as string)
    );
    const minDate = getMinDateFromSeries(filteredSeries);
    const maxDate = getMaxDateFromSeries(filteredSeries);
    let date = moment(minDate);
    while (date.isSameOrBefore(moment(maxDate))) {
        for (let s in filteredSeries) {
            if (!filteredSeries[s].data.some((d) => moment(d.x).isSame(date))) {
                filteredSeries[s].data.push({ x: date.toDate(), y: null });
            }
        }
        date.add(1, "day");
    }
    // values were added to end, so need to re-sort them
    const sorted = filteredSeries.map((s) => {
        return {
            data: _.sortBy(s.data, (d: Datum) => d.x),
            id: s.id,
            key: s.key,
            color: s.color,
        } as Serie;
    });

    return sorted;
};

// todo find a way to make grouping/bucketing work
// need to choose a methodology of how to handle missing values if averaging
export const groupedBy = (serie: Serie, group?: string) => {
    switch (group) {
        case "day":
            return _.groupBy(serie.data, (item) =>
                moment(item.x).format("YYYYMMDD")
            );
        case "week":
            return _.groupBy(serie.data, (item) =>
                moment(item.x).format("YYYYW")
            );
        case "month":
            return _.groupBy(serie.data, (item) =>
                moment(item.x).format("YYYYMM")
            );
        case "default":
            return _.groupBy(serie.data, (item) =>
                moment(item.x).format("YYYYMMDD")
            );
    }
};

export const SUPPORTED_LABEL_COLORS = [
    "red",
    "blue",
    "yellow",
    "green",
    "purple",
];

export const convertColorsToStyles = (color: string) => {
    switch (color) {
        case "red":
            return "bg-red-100 border-red-500";
        case "blue":
            return "bg-blue-100 border-blue-500";
        case "yellow":
            return "bg-yellow-100 border-yellow-500";
        case "green":
            return "bg-green-100 border-green-500";
        case "purple":
            return "bg-purple-100 border-purple-500";
        default:
            return "bg-blue-100 border-blue-500";
    }
};

let verbs: string[],
    nouns: string[],
    adjectives: string[],
    adverbs: string[],
    preposition: string[];
nouns = [
    "bird",
    "clock",
    "boy",
    "plastic",
    "duck",
    "teacher",
    "old lady",
    "professor",
    "hamster",
    "dog",
];
verbs = [
    "kicked",
    "ran",
    "flew",
    "dodged",
    "sliced",
    "rolled",
    "died",
    "breathed",
    "slept",
    "killed",
];
adjectives = [
    "beautiful",
    "lazy",
    "professional",
    "lovely",
    "dumb",
    "rough",
    "soft",
    "hot",
    "vibrating",
    "slimy",
];
adverbs = [
    "slowly",
    "elegantly",
    "precisely",
    "quickly",
    "sadly",
    "humbly",
    "proudly",
    "shockingly",
    "calmly",
    "passionately",
];
preposition = [
    "down",
    "into",
    "up",
    "on",
    "upon",
    "below",
    "above",
    "through",
    "across",
    "towards",
];

export function sentence() {
    var rand1 = Math.floor(Math.random() * 10);
    var rand2 = Math.floor(Math.random() * 10);
    var rand3 = Math.floor(Math.random() * 10);
    var rand4 = Math.floor(Math.random() * 10);
    var rand5 = Math.floor(Math.random() * 10);
    var rand6 = Math.floor(Math.random() * 10);
    //                var randCol = [rand1,rand2,rand3,rand4,rand5];
    //                var i = randGen();
    return (
        "The " +
        adjectives[rand1] +
        " " +
        nouns[rand2] +
        " " +
        adverbs[rand3] +
        " " +
        verbs[rand4] +
        " because some " +
        nouns[rand1] +
        " " +
        adverbs[rand1] +
        " " +
        verbs[rand1] +
        " " +
        preposition[rand1] +
        " a " +
        adjectives[rand2] +
        " " +
        nouns[rand5] +
        " which, became a " +
        adjectives[rand3] +
        ", " +
        adjectives[rand4] +
        " " +
        nouns[rand6] +
        "."
    );
}

import React, {
    useCallback,
    useContext,
    createContext,
    useEffect,
    useState,
} from "react";
import { collection, doc, getDocs, query, updateDoc, where } from "firebase/firestore";
import createTrend from "trendline";
import { db } from "../firebase";
import "../App.css";
import Card from "../components/Card/Card";
import CardGroup from "../components/CardGroup/CardGroup";
import _ from "underscore";
import moment from "moment";
import searchIcon from "../assets/search-icon.png";
import Input from "../components/Input/Input";
import AddButton from "../components/Button/Button";
import LineChart from "../components/LineChart/LineChart";
import { EntriesContext } from "../Entries";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Auth";
import { PacmanLoader } from "react-spinners";
import EntryModal from "../components/Modal/Modal";
import ShareModal from "../components/ShareModal/ShareModal";
import { Entry, PersonContextType, TLabel } from "../constant/types";
import { SUPPORTED_LABEL_COLORS } from "../utils";
import Avatar from "../components/Avatar/Avatar";
import filter from "../assets/filter.svg";

export const PersonContext = createContext<PersonContextType>({
    person: "1",
});

type ChartDatum = {
    id: string;
    color: string;
    data: {
        x: Date;
        y: number;
    }[];
};

function Timeline() {
    const { person } = useParams();
    const [personEntries, setPersonEntries] = useState<Entry[]>([]);
    const { entries, setEntries } = useContext(EntriesContext);
    const { currentUser } = useContext(AuthContext);
    const [filteredEntries, setFilteredEntries] = useState<Entry[]>([]);
    const [inviteData, setInviteData] = useState<any>()
    const [loading, setLoading] = useState(false);
    const [isModal, setIsModal] = useState(false);
    const [isShare, setIsShare] = useState(false);
    const [isFetched, setFetched] = useState(false);
    const [isAccept, setIsAccept] = useState(false);
    // const [isAceepting, setAccepting] = useState(false);

    const [chartData, setChartData] = useState<ChartDatum[]>([]);
    const [summary, setSummary] = useState<string[]>([]);

    const createDataEntry = (date: string, rating: number) => {
        return {
            x: new Date(date),
            y: rating,
        };
    };

    const constructChartDataFromEntries = useCallback(() => {
        const chartDataTemp: ChartDatum[] = [];
        personEntries?.forEach((entry) => {
            const date = moment(entry.createdAt, "DD/MM/YYYY").format(
                "YYYY-MM-DD"
            );
            entry.labels.forEach((label: TLabel) => {
                // see if existing series for labels
                if (
                    chartDataTemp.findIndex(
                        (v) => v.id.toLowerCase() === label.value.toLowerCase()
                    ) !== -1
                ) {
                    // it exists so extend the existing data array
                    const index = chartDataTemp.findIndex(
                        (v) => v.id.toLowerCase() === label.value.toLowerCase()
                    );
                    chartDataTemp[index].data.push(
                        createDataEntry(date, entry.rating)
                    );
                } else {
                    // first entry of that label type so insert object for new data series
                    chartDataTemp.push({
                        id: label.value,
                        color: SUPPORTED_LABEL_COLORS[
                            Math.floor(
                                Math.random() * SUPPORTED_LABEL_COLORS.length
                            )
                        ],
                        data: [{ x: new Date(date), y: entry.rating }],
                    });
                }
            });
        });
        setChartData(chartDataTemp);
    }, [personEntries]);

    const checkAcceptable = async (userID: string) => {
        const ref = collection(db, "shared");
        const inviteQuery = query(ref, where("To", "==", userID), where("EntiryShared", "==", person), where("Claimed", "==", false), where("Deleted", "==", false))
        const inviteQuerySnapshot = await getDocs(inviteQuery)
        if (inviteQuerySnapshot.size) {
            setInviteData(inviteQuerySnapshot)
            setIsAccept(true)
        }
    }

    const getAcceptedEntries = async (userID: string) => {
        const ref = collection(db, "shared")
        const getAcceptedQuery = query(ref, where("To", "==", userID), where("EntiryShared", "==", person), where("Claimed", "==", true), where("Deleted", "==", false))
        const getAcceptedEntry = await getDocs(getAcceptedQuery)
        return getAcceptedEntry
    }

    const getEntries = async (userID: string[]) => {
        const ref = collection(db, "timelineEntry");
        const q = query(ref, where("userID", "in", userID));
        const querySnapshot = await getDocs(q);
        const entries: Entry[] = [];
        querySnapshot.forEach(async (doc) => {
            // doc.data() is never undefined for query doc snapshots
            const data = doc.data();
            const labels = JSON.parse(data.label);
            const date = moment(data.createdAt, "YYYY-MM-DD").format(
                "YYYY-MM-DD"
            );
            const personName = JSON.parse(data.person)[0].value.toLowerCase();
            const isDeleted = data.isDeleted ? true : false;
            entries.push({
                ...data,
                docID: doc?.id,
                isDeleted,
                createdAt: moment(date).format("DD/MM/YYYY"),
                person: personName,
                labels: labels,
            } as Entry);
        });
        const groupedList = _.groupBy(entries, (d) => d.person);
        return groupedList;
    }

    const fetchEntries = async (userID: string) => {
        await checkAcceptable(userID)
        const getAcceptedEntry = await getAcceptedEntries(userID)
        let acceptedIDs: any = [userID]
        if (getAcceptedEntry.size) {
            getAcceptedEntry.forEach((doc) => {
                acceptedIDs.push(doc.data().By)
            })
        }
        const groupedList = await getEntries(acceptedIDs)
        setFetched(true)
        setEntries(groupedList);
        return groupedList;
    };

    const fetch = async () => {
        setLoading(true);
        const values = await fetchEntries(currentUser?.uid as string);
        if (Object.keys(values).length) {
            setPersonEntries(values[person?.toLowerCase() || ""]);
            // setPersonEntries(values);
            setFilteredEntries(values[person?.toLowerCase() || ""]);
            setLoading(false);
        } else {
            setLoading(false);
        }
    };

    useEffect(() => {
        constructChartDataFromEntries();
    }, [constructChartDataFromEntries]);

    useEffect(() => {
        // const values = [e(), e(), e(), e(), e(), e(), e(), e()];
        if (Object.keys(entries).length === 0 && !isFetched) {
            fetch();
        } else {
            setPersonEntries(entries[person?.toLowerCase() || ""]);
            // setPersonEntries(values);
            setFilteredEntries(entries[person?.toLowerCase() || ""]);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [entries, isFetched, person]);

    const sumDown = (val: number): number => {
        let sum = 0;
        while (val > 0) {
            sum += val;
            val -= 1;
        }
        return sum;
    };

    useEffect(() => {
        const insights: any = {};
        chartData.forEach((series) => {
            const freqMap: { [num: number]: number } = {};
            let lowCount = 0;
            let highCount = 0;
            const trendData: { x: number; y: number }[] = [];
            console.log(
                "Sorted: ",
                series.data.sort((a, b) =>
                    moment(a.x).isAfter(moment(b.x)) ? -1 : 1
                )
            );
            const weightedAverage =
                series.data
                    .sort((a, b) => (moment(a.x).isAfter(moment(b.x)) ? 1 : -1))
                    .reduce((acc, val, index) => {
                        if (val.y in freqMap) {
                            freqMap[val.y]++;
                        } else {
                            freqMap[val.y] = 1;
                        }
                        if (val.y < 5) {
                            lowCount++;
                        } else {
                            highCount++;
                        }
                        trendData.push({ x: index, y: val.y });
                        // return the sum
                        return acc + val.y * index;
                    }, 0) /
                sumDown(series.data.filter((v) => v.y !== null).length);
            console.log("Weighted average: ", weightedAverage);
            // console.log(trendData);
            const trend = createTrend(trendData.reverse(), "x", "y");
            // console.log(trend);
            const valence = highCount - lowCount;
            const magnitude = Math.abs(valence) > 5 ? "strong" : "weak";
            const trendSlope = trend.slope;
            const length = series.data.filter((v) => v.y !== null).length;
            insights[series.id] = {
                slope: trendSlope,
                vector: { valence, magnitude },
                highCount,
                lowCount,
                length,
                weightedAverage,
            };
            // console.log("Series", series.id, ": ", average, ", ", freqMap);
            // console.log("Low values: ", lowCount, ", High values: ", highCount);
            // console.log("Valence: ", valence);
            // console.log("Modality: ", modality);
        });
        const summaryTemp: string[] = [];
        let max = 0;
        let maxLabel = "";
        Object.keys(insights).forEach((label) => {
            if (insights[label].length < 2) return;
            summaryTemp.push(
                `${label} has been trending
                ${insights[label].slope > 0 ? "up." : "down."}`
            );
            if (insights[label].length > max) {
                max = insights[label].length;
                maxLabel = label;
            }
        });
        if (maxLabel) {
            const valence = insights[maxLabel].vector.valence;
            summaryTemp.push(
                `${person || "This person"}
                 has the most entries about
                ${maxLabel}. And they tend to be ${valence === 0
                    ? "mixed"
                    : valence > 0
                        ? "positive"
                        : "negative"
                }.`
            );
        }
        setSummary(summaryTemp);
    }, [chartData, person]);

    const searchableEntries = personEntries?.map((e) => ({
        ...e,
        labels: e.labels.reduce(
            (accumulator, currentValue) => accumulator + currentValue.value,
            ""
        ),
        rating: e.rating.toString(),
        createdAt: e.createdAt.toString(),
    }));

    const search = (val: React.FormEvent<HTMLInputElement>) => {
        let filtered: Entry[] = [];
        searchableEntries.forEach((e, index) =>
            Object.keys(e).some((key) =>
                e[key as keyof Entry]
                    .toString()
                    .toLowerCase()
                    .includes(val.currentTarget.value.toLowerCase())
            )
                ? filtered.push(personEntries[index])
                : null
        );
        setFilteredEntries(filtered);
    };
    const groupedFilteredEntries =
        _.groupBy(
            _.sortBy(filteredEntries, "createdAt").reverse(),
            "createdAt"
        ) || [];

    const addAction = (type: 'add' | 'edit' | 'delete', newEntry: any) => {
        console.log('mode', type, 'newEntry', newEntry)
        switch (type) {
            case 'add':
                filteredEntries.push(newEntry as any)
                setFilteredEntries(filteredEntries)
                break;
            default:
                break;
        }
    }

    const acceptInvite = async () => {
        // setAccepting(true)
        try {
            const id: any = []
            const data: any = []
            inviteData.forEach((doc: any) => {
                id.push(doc.id)
                data.push(doc.data())
            })
            if (id.length !== 0) {
                const ref = doc(db, 'shared', id[0])
                const updateEntry = {
                    Claimed: true,
                    ClaimedAt: new Date().toLocaleString()
                }
                await updateDoc(ref, updateEntry)
                fetchEntries(data[0].By)
                setIsAccept(false)
                console.log('data>>>', data)
            }
        } catch (error) {
            console.log('acceptInvite error', error)
        }
        // setAccepting(true)
    }

    return (
        <div className="flex flex-col w-full">
            <div className="flex justify-between items-center bg-white h-24 border-b px-6 lg:px-32">
                <div className="flex items-center space-x-2">
                    <Avatar name={person} />
                    <div className="flex flex-col">
                        <h1 className="font-bold text-lg">
                            {person}'s Timeline
                        </h1>
                        {/* <p className="text-xs text-gray-500">
                            Product Designer
                        </p> */}
                    </div>
                </div>
                <div className="flex">
                    <div className="flex mr-3 px-3 items-center border rounded-xl text-gray-500 cursor-pointer">
                        <img src={filter} alt="filter icon" />
                        <span className="pl-2">Filter</span>
                    </div>
                    <div className="flex flex-row gap-row-[10px] relative">
                        <Input
                            placeholder="Search"
                            icon={searchIcon}
                            onChange={search}
                        />
                        <AddButton
                            className="bg-primary w-auto"
                            variant="contained"
                            onClick={() => setIsModal(true)}
                        >
                            + Add Entry
                        </AddButton>
                        <AddButton
                            className="bg-primary w-auto"
                            variant="contained"
                            onClick={() => setIsShare(true)}
                        >
                            Share Entry
                        </AddButton>
                        {
                            isAccept ? <AddButton
                                className="bg-primary w-auto"
                                variant="contained"
                                onClick={acceptInvite}
                            >
                                Accept Invite
                            </AddButton> : null
                        }
                        <EntryModal
                            isModal={isModal}
                            mode="timeline"
                            person={person}
                            onAction={addAction}
                            onClose={() => setIsModal(false)}
                        />
                        <ShareModal
                            isModal={isShare}
                            onClose={() => setIsShare(false)}
                        />
                    </div>
                </div>
            </div>
            <div className="flex h-full w-full items-center px-6 lg:px-32">
                <div className="w-full mt-4">
                    <div className="flex w-full space-x-2">
                        <div className="rounded-xl shadow bg-white w-1/3 pr-5 pl-7 py-4">
                            <span className="text-xl font-semibold">
                                Headlines
                            </span>
                            <div>
                                <ul className="list-disc">
                                    {summary.map((s) => (
                                        <li key={Math.random()}>{s}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                        <div className="w-3/4 rounded-xl shadow bg-white px-10 py-4">
                            <LineChart data={chartData} />
                        </div>
                    </div>
                    {loading ? (
                        <div className="w-full flex justify-center mt-32">
                            <PacmanLoader
                                color={"#4356E0"}
                                loading={loading}
                                size={40}
                                aria-label="Loading Spinner"
                                data-testid="loader"
                            />
                        </div>
                    ) : (
                        Object.keys(groupedFilteredEntries).map(
                            (date: string) => {
                                return (
                                    <CardGroup
                                        key={date + Math.random()}
                                        date={moment(date, "DD-MM-YYYY").format(
                                            "D MMM"
                                        )}
                                    >
                                        {groupedFilteredEntries[date].map(
                                            (e: Entry) => (
                                                <PersonContext.Provider
                                                    value={{
                                                        person: person
                                                            ? person
                                                            : "",
                                                    }}
                                                    key={Math.random()}
                                                >
                                                    {!e.isDeleted ? (
                                                        <Card
                                                            key={
                                                                e.title +
                                                                Math.random()
                                                            }
                                                            className="my-4"
                                                            entry={e}
                                                        />
                                                    ) : null}
                                                </PersonContext.Provider>
                                            )
                                        )}
                                    </CardGroup>
                                );
                            }
                        )
                    )}
                </div>
            </div>
        </div>
    );
}

export default Timeline;

import {
    DataGrid,
    GridColDef,
    useGridApiRef,
    GridComparatorFn,
} from "@mui/x-data-grid";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import Avatar from "../components/Avatar/Avatar";
import Input from "../components/Input/Input";
import searchIcon from "../assets/search-icon.png";
import { useContext, useEffect, useState } from "react";
import { DocumentData, QuerySnapshot, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase";
import { AuthContext } from "../Auth";
import _ from "underscore";
import { Entry } from "../constant/types";
import LinearProgress from "@mui/material/LinearProgress";
import AddButton from "../components/Button/Button";
import EntryModal from "../components/Modal/Modal";
import { EntriesContext } from "../Entries";
import chromeExtensionImage from "../assets/chrome-extension.png";
import chromeExtensionDownloadImage from "../assets/chrome-extension-download.png";

type Person = {
    id?: string;
    user: {
        name: string;
        url?: string;
        title?: string;
    };
    sharedby?: string,
    entries: string;
    lastUpdated: string;
    densityRating?: string;
    performanceRating?: string;
};

function Home() {
    const dayInMonthComparator: GridComparatorFn = (v1, v2) =>
        moment(v1, "DD/MM/YYYY").isAfter(moment(v2, "DD/MM/YYYY")) ? 1 : -1;
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);
    const { setEntries } = useContext(EntriesContext);
    const [loading, setLoading] = useState(false);
    const [showExtensionCard, setShowExtensionCard] = useState(true);
    const [isModal, setIsModal] = useState(false);

    const columns: GridColDef[] = [
        {
            field: "user",
            headerName: "Name",
            width: 250,
            flex: 0.6,
            renderCell: (params) => {
                return (
                    <>
                        <Avatar
                            src={params.value.url}
                            name={params.value.name}
                        />
                        <div className="flex flex-col ml-1">
                            <div className="font-bold">{params.value.name}</div>
                            {params.value.title && (
                                <div className="text-xs -mt-0.5 text-gray-400 w-6 text-ellipsis">
                                    {params.value.title}
                                </div>
                            )}
                        </div>
                    </>
                );
            },
        },
        {
            field: "entries",
            headerName: "Entries",
            width: 90,
            flex: 0.25,
        },
        {
            field: "lastUpdated",
            headerName: "Last Updated",
            width: 150,
            flex: 0.25,
            valueGetter: (params) => {
                return moment(params.row.lastUpdated, "DD/MM/YYYY").format(
                    "DD/MM/YYYY"
                );
            },
            sortComparator: dayInMonthComparator,
        },
        {
            field: "densityRating",
            headerName: "Density Rating",
            width: 150,
            flex: 0.25,
        },
        {
            field: "performance",
            headerName: "Performance",
            description: "This column has a value getter and is not sortable.",
            sortable: false,
            flex: 0.25,
            width: 160,
        },
    ];

    const sharedColumns: GridColDef[] = [
        {
            field: "user",
            headerName: "Name",
            width: 130,
            flex: 0.6,
            renderCell: (params) => {
                return (
                    <>
                        <Avatar
                            src={params.value.url}
                            name={params.value.name}
                        />
                        <div className="flex flex-col ml-1">
                            <div className="font-bold">{params.value.name}</div>
                            {params.value.title && (
                                <div className="text-xs -mt-0.5 text-gray-400 w-6 text-ellipsis">
                                    {params.value.title}
                                </div>
                            )}
                        </div>
                    </>
                );
            },
        },
        {
            field: "sharedby",
            headerName: "Shared By",
            width: 130,
            flex: 0.45
        },
        {
            field: "entries",
            headerName: "Entries",
            width: 90,
            flex: 0.25,
        },
        {
            field: "lastUpdated",
            headerName: "Last Updated",
            width: 150,
            flex: 0.25,
            valueGetter: (params) => {
                return moment(params.row.lastUpdated, "DD/MM/YYYY").format(
                    "DD/MM/YYYY"
                );
            },
            sortComparator: dayInMonthComparator,
        },
        {
            field: "densityRating",
            headerName: "Density Rating",
            width: 150,
            flex: 0.25,
        },
        {
            field: "performance",
            headerName: "Performance",
            description: "This column has a value getter and is not sortable.",
            sortable: false,
            flex: 0.25,
            width: 160,
        },
    ];

    const [rows, setRows] = useState<Person[]>([]);
    const [sharedRows, setSharedRows] = useState<Person[]>([])

    // const rows = [
    //     {
    //         id: 1,
    //         user: {
    //             name: "Joe H",
    //             url: "https://www.sciencefriday.com/wp-content/uploads/2023/04/frogs-happy-min.jpg",
    //             title: "CEO",
    //         },
    //         entries: "15",
    //         lastUpdated: "31/3/23",
    //         densityRating: "80%",
    //         performance: "High Performance",
    //     },
    //     {
    //         id: 2,
    //         user: {
    //             name: "Joe H",
    //             title: "Intern",
    //         },
    //         entries: "15",
    //         lastUpdated: "20/02/23",
    //         densityRating: "70%",
    //         performance: "Low Performance",
    //     },
    //     {
    //         id: 3,
    //         user: {
    //             name: "Joe H",
    //             url: "https://www.sciencefriday.com/wp-content/uploads/2023/04/frogs-happy-min.jpg",
    //             title: "Designer",
    //         },
    //         entries: "15",
    //         lastUpdated: "10/2/23",
    //         densityRating: "7%",
    //         performance: "Low Performance",
    //     },
    //     {
    //         id: 4,
    //         user: {
    //             name: "Joe H",
    //             url: "https://www.sciencefriday.com/wp-content/uploads/2023/04/frogs-happy-min.jpg",
    //             title: "Director of Content",
    //         },
    //         entries: "15",
    //         lastUpdated: "05/3/22",
    //         densityRating: "100%",
    //         performance: "Low Performance",
    //     },
    //     {
    //         id: 5,
    //         user: {
    //             name: "Joe H",
    //             url: "https://www.sciencefriday.com/wp-content/uploads/2023/04/frogs-happy-min.jpg",
    //         },
    //         entries: "15",
    //         lastUpdated: "13/5/23",
    //         densityRating: "80%",
    //         performance: "High Performance",
    //     },
    // ];

    useEffect(() => {
        fetchPost();
        console.log("rows", rows);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getAcceptedEntries = async (userID?: string) => {
        if (userID) {
            const ref = collection(db, "shared")
            const userIDs: string[] = []
            const getAcceptedQuery = query(ref, where("To", "==", userID), where("Claimed", "==", true), where("Deleted", "==", false))
            const getAcceptedEntry = await getDocs(getAcceptedQuery)
            getAcceptedEntry.forEach((doc) => {
                userIDs.push(doc.data().By)
            })
            return getAcceptedEntry
        }
    }

    const getSharedEntries = async (snapshots?: QuerySnapshot<DocumentData>) => {
        const sharedEntries: Entry[] = []
        try {
            const ref = collection(db, "timelineEntry");
            if (snapshots && snapshots.size) {
                for (const doc of snapshots.docs) {
                    const q = query(ref, where("userID", "==", doc.data().By))
                    const querySnapshot = await getDocs(q)
                    for (const item of querySnapshot.docs) {
                        if (JSON.parse(item.data().person)[0].value.toLowerCase() === doc.data().EntiryShared.toLowerCase()) {
                            const data = item.data()
                            const isDeleted = data.isDeleted ? true : false
                            sharedEntries.push({
                                ...data,
                                docID: item?.id,
                                sharedBy: data?.userID,
                                isDeleted,
                                createdAt: moment(data.createdAt, "YYYY-MM-DD").format(
                                    "DD-MM-YYYY"
                                ),
                                person: JSON.parse(data.person)[0].value.toLowerCase(),
                                labels: JSON.parse(data.label),
                            } as Entry)
                        }
                    }
                }
            }
            return sharedEntries;
        } catch (error) {
            console.log('Fetch Shared Entries Error')
            return sharedEntries;
        }
    }

    const fetchPost = async () => {
        setLoading(true);
        const ref = collection(db, "timelineEntry");
        const q = query(ref, where("userID", "==", currentUser?.uid));
        const querySnapshot = await getDocs(q);
        let entries: Entry[] = [];
        console.log('currentUser', currentUser)
        const items = await getAcceptedEntries(currentUser?.uid)
        const sharedEntries = await getSharedEntries(items)
        querySnapshot.forEach(async (doc) => {
            // doc.data() is never undefined for query doc snapshots
            // console.log(doc.id, " => ", doc.data());
            const data = doc.data();
            const isDeleted = data.isDeleted ? true : false;
            entries.push({
                ...data,
                docID: doc?.id,
                isDeleted,
                createdAt: moment(data.createdAt, "YYYY-MM-DD").format(
                    "DD-MM-YYYY"
                ),
                person: JSON.parse(data.person)[0].value.toLowerCase(),
                labels: JSON.parse(data.label),
            } as Entry);
        });

        const sharedEntriesGroupedList = _.groupBy(
            sharedEntries.filter((e) => !e.isDeleted),
            (d) => d.person
        );
        console.log('sharedEntriesGroupedList', sharedEntriesGroupedList)
        const groupedList = _.groupBy(
            entries.filter((e) => !e.isDeleted),
            (d) => d.person
        );
        setEntries(groupedList);
        const rows: Person[] = [];
        const sharedRows: Person[] = [];
        Object.keys(groupedList).forEach((person, index) => {
            const personsEntries = groupedList[person].filter(
                (entry) => !entry.isDeleted
            );
            const sortedEntries = _.sortBy(personsEntries, "createdAt");
            rows.push({
                id: "" + index,
                user: { name: toCapitalCase(person) },
                entries: "" + personsEntries.length,
                lastUpdated: moment(
                    sortedEntries?.[personsEntries.length - 1]?.createdAt,
                    "DD-MM-YYYY"
                )
                    .format("DD/MM/YYYY")
                    .toString(),
                densityRating: "80%",
                performanceRating: "High Performance",
            });
        });
        Object.keys(sharedEntriesGroupedList).forEach((person, index) => {
            const personsEntries = sharedEntriesGroupedList[person].filter(
                (entry) => !entry.isDeleted
            );
            const sortedEntries = _.sortBy(personsEntries, "createdAt");
            console.log('personsEntries', personsEntries)
            sharedRows.push({
                id: "" + index,
                user: { name: toCapitalCase(person) },
                sharedby: personsEntries[0].sharedBy,
                entries: "" + personsEntries.length,
                lastUpdated: moment(
                    sortedEntries?.[personsEntries.length - 1]?.createdAt,
                    "DD-MM-YYYY"
                )
                    .format("DD/MM/YYYY")
                    .toString(),
                densityRating: "80%",
                performanceRating: "High Performance",
            });
        });
        setRows(rows)
        setSharedRows(sharedRows)
        setLoading(false);
    };

    const toCapitalCase = (str: string) =>
        str
            .split(" ")
            .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
            .reduce((acc, val) => acc + " " + val);

    const apiRef = useGridApiRef();

    useEffect(() => {
        setShowExtensionCard(
            !(localStorage.getItem("showExtensionCard") === "false")
        );
    }, []);

    const hideCard = () => {
        setShowExtensionCard(false);
        localStorage.setItem("showExtensionCard", "false");
    };

    return (
        <div className="bg-white h-fit pb-20">
            {/* <div onClick={() => console.log(apiRef.current.getSelectedRows())}>
                Selected
            </div>
            <div onClick={() => navigate("/")}>Login</div> */}
            <div className="px-6 lg:px-32 py-12 flex justify-between items-center w-full">
                <h1 className="text-2xl font-bold">Your Team</h1>
                <span className="relative flex flex-row">
                    <Input
                        placeholder="Search"
                        icon={searchIcon}
                        onChange={() => { }}
                    />
                    <AddButton
                        variant="contained"
                        onClick={() => setIsModal(true)}
                    >
                        + Add Entry
                    </AddButton>
                    <EntryModal
                        isModal={isModal}
                        mode="home"
                        onClose={() => setIsModal(false)}
                    />
                </span>
            </div>
            <hr />
            <div className={`lg:px-32 mt-4 ${rows.length === 0 && "h-64"}`}>
                <DataGrid
                    sx={{
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#EFF1F4",
                        },
                        fontFamily: "inherit",
                        borderRadius: "20px",
                    }}
                    slots={{
                        loadingOverlay: LinearProgress,
                    }}
                    loading={loading}
                    rows={rows}
                    columns={columns}
                    apiRef={apiRef}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={rows.length > 5 ? [5, 10] : []}
                    disableRowSelectionOnClick
                    onRowClick={(params) =>
                        navigate(`/timeline/${params.row.user.name}`)
                    }
                />
                <h1 className="mt-8 text-2xl font-bold py-4">Shared With You</h1>
                <DataGrid
                    sx={{
                        "& .MuiDataGrid-columnHeaders": {
                            backgroundColor: "#EFF1F4",
                        },
                        fontFamily: "inherit",
                        borderRadius: "20px",
                    }}
                    slots={{
                        loadingOverlay: LinearProgress,
                    }}
                    loading={loading}
                    rows={sharedRows}
                    columns={sharedColumns}
                    apiRef={apiRef}
                    initialState={{
                        pagination: {
                            paginationModel: { page: 0, pageSize: 5 },
                        },
                    }}
                    pageSizeOptions={rows.length > 5 ? [5, 10] : []}
                    disableRowSelectionOnClick
                    onRowClick={(params) =>
                        navigate(`/timeline/${params.row.user.name}`)
                    }
                />
                {showExtensionCard && (
                    <div className="flex relative justify-between shadow-lg bg-clip-padding backdrop-filter backdrop-blur-md bg-opacity-40 w-3/4 mt-4 rounded-xl border bg-gradient-to-tl from-[#CCDEFD] to-[#F6F8FF] p-8">
                        <div
                            className="absolute right-3 top-1 text-sm text-gray-500 font-bold cursor-pointer"
                            onClick={hideCard}
                        >
                            X
                        </div>
                        <div className="space-y-4 w-2/5">
                            <p className="text-2xl font-extrabold">
                                Step 1: Get One-Click
                                <span className="text-primary block">
                                    Evidence Gathering
                                </span>
                            </p>
                            <p>
                                Never be caught without examples of positive and
                                negative behaviour from your reports when giving
                                feedback.
                            </p>
                            <p>
                                Use our handy
                                <a
                                    className="text-blue-500"
                                    target="_blank"
                                    rel="noreferrer"
                                    href="https://chrome.google.com/webstore/detail/careerly/hggmhgodcnehgieapofeakhkogikkhkl"
                                >
                                    {" "}
                                    Chrome Extension{" "}
                                </a>
                                to build a comprehensive track record for your
                                reports. You don't need to remember anything!
                            </p>
                            <a
                                target="_blank"
                                rel="noreferrer"
                                href="https://chrome.google.com/webstore/detail/careerly/hggmhgodcnehgieapofeakhkogikkhkl"
                            >
                                <img
                                    alt="download chrome extension"
                                    className="cursor-pointer mt-4"
                                    src={chromeExtensionDownloadImage}
                                />
                            </a>
                        </div>
                        <img
                            className="h-1/2 w-1/2 self-center"
                            alt="chrome extension"
                            src={chromeExtensionImage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default Home;

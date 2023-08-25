import { useParams } from "react-router";
import { useNavigate } from "react-router-dom";
import Profile from "./Settings/Profile";

const SettingsView = ({ view }: { view?: string }) => {
    switch (view) {
        case "profile":
            return <Profile />;
        default:
            return <>Settings</>;
    }
};
const Settings = () => {
    const { view } = useParams();
    const navigate = useNavigate();
    return (
        <div className="flex h-full py-8">
            <div className="flex flex-col items-start w-1/3 lg:w-1/5 pl-4 lg:pl-36">
                <h1 className="font-bold text-2xl mb-8">Settings</h1>
                {["profile", "billing", "notifications", "team"].map((l) => (
                    <div
                        className={`capitalize py-2 px-4 my-2 w-full rounded-lg hover:bg-blue-100 ${
                            view === l
                                ? "bg-blue-200 font-semibold text-primary"
                                : "font-medium"
                        }`}
                        onClick={() => navigate(`/settings/${l}`)}
                    >
                        {l}
                    </div>
                ))}
            </div>

            <div className="flex flex-col w-3/4 pl-10">
                <SettingsView view={view} />
            </div>
        </div>
    );
};

export default Settings;

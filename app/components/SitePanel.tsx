import { Link } from "react-router";
import logo_image from "../images/hero-wars-alliance-logo.webp";
import SiteNavigation from "./SiteNavigation";

function SitePanel() {
    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link
                        to="/"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <img
                            alt="Hero Wars Helper"
                            src={logo_image}
                            className="h-12 w-12"
                            title="Not affiliated with Nexters Global LTD"
                        />
                        <span className="">Hero Wars Helper</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <SiteNavigation />
                </div>
            </div>
        </div>
    );
}

export default SitePanel;

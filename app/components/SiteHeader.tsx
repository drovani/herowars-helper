import { CircleUser, Home, PanelBottomOpen, Search } from "lucide-react";
import { useState } from "react";
import { Form, Link } from "react-router";
import { ClientOnly } from "remix-utils/client-only";
import logo_image from "../images/hero-wars-alliance-logo.webp";
import SiteNavigation from "./SiteNavigation";
import { Button } from "./ui/button";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "./ui/drawer";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

function SiteHeader() {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    return (
        <header
            className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-16 lg:px-6"
            role="banner"
        >
            <ClientOnly>
                {() => (
                    <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                        <DrawerTrigger asChild>
                            <Button
                                variant="outline"
                                size="icon"
                                className="shrink-0 md:hidden"
                            >
                                <PanelBottomOpen
                                    size={20}
                                    strokeWidth={1}
                                    className="h-5 w-5"
                                />
                                <span className="sr-only">
                                    Toggle navigation menu
                                </span>
                            </Button>
                        </DrawerTrigger>
                        <DrawerContent>
                            <DrawerHeader>
                                <DrawerTitle className="flex gap-2">
                                    <div className="flex gap-2">
                                        <Link
                                            to={"/"}
                                            className="flex items-center gap-2 text-lg font-semibold"
                                            onClick={() =>
                                                setIsDrawerOpen(false)
                                            }
                                        >
                                            <Home
                                                size={24}
                                                className="h-6 w-6"
                                            />
                                            <span className="sr-only">
                                                Hero Wars Helper
                                            </span>
                                        </Link>
                                        <Form>
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                                                />
                                                <Input
                                                    className="w-full pl-8"
                                                    placeholder="Coming soon..."
                                                    type="search"
                                                    disabled
                                                />
                                            </div>
                                        </Form>
                                    </div>
                                </DrawerTitle>
                            </DrawerHeader>
                            <SiteNavigation
                                onNavClick={() => setIsDrawerOpen(false)}
                            />
                        </DrawerContent>
                    </Drawer>
                )}
            </ClientOnly>
            <Link
                to={"/"}
                className="flex items-center space-x-3 sm:hidden"
                color="foreground"
            >
                <img
                    alt="Hero Wars Helper"
                    src={logo_image}
                    className="h-12 w-12"
                    title="Not affiliated with Nexters Global LTD"
                />
                <p className="font-bold text-2xl tracking-tight text-inherit">
                    Hero Wars Helper
                </p>
            </Link>
            <div className="w-full flex-1 hidden md:block">
                <Form>
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"
                        />
                        <Input
                            className="w-full pl-8 md:w-1/3"
                            placeholder="Coming soon..."
                            type="search"
                        />
                    </div>
                </Form>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="secondary"
                        size="icon"
                        className="rounded-full"
                    >
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    align="end"
                    className="text-muted-foreground/50"
                >
                    <DropdownMenuLabel className="cursor-default">
                        My Account
                    </DropdownMenuLabel>{" "}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Login</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}

export default SiteHeader;

// ABOUTME: Home page for Hero Wars Helper, displaying a sunset notice
// ABOUTME: since the project is no longer actively maintained.

import { Archive } from "lucide-react";
import { Link } from "react-router";

import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";

export default function Index() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">
          Hero Wars: Alliance Helper
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A fan-made companion app for Hero Wars: Alliance — now archived
        </p>
      </div>

      {/* Sunset Notice */}
      <Alert variant="destructive" className="border-2">
        <Archive className="size-5" />
        <AlertTitle className="text-lg">
          This Project Is No Longer Maintained
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-3">
          <p>
            I have stopped playing Hero Wars: Alliance and this project will no longer receive updates. The existing data remainsbrowsable as a reference, but it is outdated as the game has evolved.
          </p>
          <p>
            For more about why this project was archived, read the blog post "
            <a
              href="https://rovani.net/posts/2026/done-playing-hero-wars"
              className="font-medium underline underline-offset-4 hover:opacity-80"
              target="_blank"
            >
              Hero Wars Built Something I Never Asked For — And I am Done Playing
            </a>" for details on how Realm completely changed the game and made it less enjoyable for many players, including myself.
          </p>
        </AlertDescription>
      </Alert>

      {/* Browse Existing Data */}
      <Card>
        <CardHeader>
          <CardTitle>Browse Existing Data</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            The game data collected during active development is still available
            to browse.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              to="/heroes"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Browse Heroes
            </Link>
            <Link
              to="/equipment"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              View Equipment
            </Link>
            <Link
              to="/missions"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Mission Guide
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <footer className="text-center text-sm text-muted-foreground pt-4">
        <p>
          Hero Wars: Alliance Helper is a fan-made project and is not affiliated
          with or endorsed by the game developers.
        </p>
        <p className="mt-1">
          Created with 💜 by{" "}
          <a href="https://rovani.net" className="text-primary hover:underline">
            Rovani.net
          </a>
        </p>
      </footer>
    </div>
  );
}

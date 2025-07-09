import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";

export default function Titans() {
  const artifactRounds = [
    {
      round: "Round 1",
      items: {
        "Sigurd Weapon (Siungur's Aegis) to Level 105": true,
        "Angus Seal (Defense Seal) to Level 105": false,
        "Hyperion Weapon (Siungur's Staff) to Level 105": false,
        "Angus Crown (Earth Crown) to Level 105": false,
        "Angus Weapons (Andvari's Fists) to Level 105": false,
      },
    },
    {
      round: "Round 2",
      items: {
        "Sigurd Weapon (Siungur's Aegis) to Level 120": false,
        "Angus Seal (Defense Seal) to Level 120": false,
        "Hyperion Weapon (Siungur's Staff) to Level 120": false,
        "Angus Crown (Earth Crown) to Level 120": false,
        "Angus Weapons (Andvari's Fists) to Level 120": false,
      },
    },
    {
      round: "Round 3",
      items: {
        "Araji Weapon (Ragni's Beast) to Level 105": false,
        "Araji Seal (Attack Seal) to Level 105": false,
        "Araji Crown (Fire Crown) to Level 105": false,
      },
    },
    {
      round: "Round 4",
      items: {
        "Araji Weapon (Ragni's Beast) to Level 120": false,
        "Araji Seal (Attack Seal) to Level 120": false,
        "Araji Crown (Fire Crown) to Level 120": false,
      },
    },
  ];

  const skinPriorities = {
    "Angus & Sigurd Primordial Skin to Level 45": true,
    "Angus & Sigurd Primordial Skin to Level 55": true,
    "Hyperion, Angus, Araji, Iyari Default Skins to Level 55": true,
    "Sigurd Default Skin to level 45": true,
    "Angus & Sigurd Primordial Skin to Level 60 (Max)": true,
    "Angus, Iyari, Hyperion, Araji Default Skins to Level 60": false,
    "Sigurd Default Skin to level 60": false,
  };

  return (
    <div className="max-w-6xl p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Titan Quick Guide</CardTitle>
          <CardDescription>
            <p>Based on the{" "}
              <a
                href="https://www.reddit.com/r/HeroWarsApp/comments/1bq1r65/titan_guide_infographic_march_2024/#lightbox"
                className="text-blue-500 hover:text-blue-600"
              >
                infograph
              </a>{" "}
              created by{" "}
              <a href="https://www.reddit.com/user/FancyGamesStudio/" className="text-blue-500 hover:text-blue-600">
                FancyGamesStudio
              </a>.
            </p>
            <p>
              This guide is a work in progress and will be updated as new information becomes available. It particular, it has not been updated since the release of Verdoc, Verdant Protector.
            </p>
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-wrap gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Titan Potions Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-4">
              <li>
                <h3 className="font-medium mb-2">First Priority</h3>
                <ul className="list-disc pl-6">
                  <li>Sigurd</li>
                  <li>Angus</li>
                </ul>
              </li>
              <li>
                <h3 className="font-medium mb-2">Keep within 10 levels</h3>
                <ul className="list-disc pl-6">
                  <li>Hyperion</li>
                  <li>Araji</li>
                  <li>Iyari</li>
                  <li>Nova</li>
                </ul>
              </li>
              <li>
                <h3 className="font-medium mb-2">Support Titans</h3>
                <ul className="list-disc pl-6">
                  <li>Ignis</li>
                  <li>Moloch</li>
                </ul>
              </li>
            </ol>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Artifacts Upgrade Order</CardTitle>
          </CardHeader>
          <CardContent>
            {artifactRounds.map((round, idx) => (
              <section key={idx} className="mb-6 last:mb-0">
                <h3 className="font-semibold text-lg mb-2">{round.round}</h3>
                <ol className="list-decimal pl-6 space-y-1">
                  {Object.entries(round.items).map(([task, complete]) => (
                    <li key={task}>{complete ? <s>{task}</s> : task}</li>
                  ))}
                </ol>
              </section>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Skins Upgrade Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal space-y-2 pl-6">
              {Object.entries(skinPriorities).map(([step, complete]) => (
                <li key={step}>{complete ? <s>{step}</s> : step}</li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

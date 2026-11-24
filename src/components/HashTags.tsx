import {
  Bitcoin,
  Briefcase,
  Bug,
  Eye,
  Fingerprint,
  Ghost,
  GitCommitHorizontal,
  Hash,
  HeartCrack,
  Info,
  KeyRound,
  MapPin,
  Newspaper,
  Phone,
  PiggyBank,
  Plane,
  Tag,
  type LucideIcon,
} from "lucide-react";
import type { Profile } from "@/lib/patterns";
import "./hashtags.css";

type TagDisplay = { label: string; icon: LucideIcon };

const profileTags: Record<Profile, TagDisplay> = {
  "High Value Individual": { label: "HighNetWorthIndividual", icon: PiggyBank },
  "Target of Spies": { label: "SpyTarget", icon: Eye },
  "Crypto Worker": { label: "CryptoWorker", icon: Bitcoin },
  "Romance Target": { label: "RomanceTarget", icon: HeartCrack },
};

const noProfile: TagDisplay = { label: "NoProfile", icon: Ghost };

const flagTags = new Map<string, TagDisplay>([
  ["in-the-news", { label: "InTheNews", icon: Newspaper }],
  ["same-username-everywhere", { label: "SameUsername", icon: Fingerprint }],
  ["public-email-in-commits", { label: "PublicCommitEmail", icon: GitCommitHorizontal }],
  ["passwords-in-breaches", { label: "PasswordsInBreaches", icon: KeyRound }],
  ["stealer-log-hit", { label: "StealerLog", icon: Bug }],
  ["just-changed-jobs", { label: "JustChangedJobs", icon: Briefcase }],
  ["travel-breach", { label: "TravellingSoon", icon: Plane }],
  ["selling-online", { label: "SellingOnline", icon: Tag }],
  ["phone-number-exposed", { label: "PhoneExposed", icon: Phone }],
  ["home-address-exposed", { label: "AddressExposed", icon: MapPin }],
]);

function HashTag({ tag, flag = false }: { tag: TagDisplay; flag?: boolean }) {
  const { label, icon: EndIcon } = tag;
  return (
    <span className={flag ? "badge hashtag-pill flag" : "badge hashtag-pill"}>
      <Hash aria-hidden="true" />
      <span className="hashtag-label" aria-hidden="true">{label}</span>
      <span className="sr-only">{label.replace(/([a-z0-9])([A-Z])/g, "$1 $2")}</span>
      <EndIcon aria-hidden="true" />
    </span>
  );
}

export function ProfileTags({ profile, flags }: { profile: Profile | null; flags: string[] }) {
  return (
    <div className="tag-row">
      <HashTag tag={profile === null ? noProfile : profileTags[profile]} />
      {flags.map((id) => {
        const tag = flagTags.get(id) ?? {
          label: id.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(""),
          icon: Info,
        };
        return <HashTag key={id} tag={tag} flag />;
      })}
    </div>
  );
}

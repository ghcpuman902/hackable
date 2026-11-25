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
import { FLAG_TAG, NO_PROFILE_TAG, PROFILE_TAG } from "@/lib/report-tags";
import "./hashtags.css";

type TagDisplay = { label: string; icon: LucideIcon };

const profileTags: Record<Profile, TagDisplay> = {
  "High Value Individual": { label: PROFILE_TAG["High Value Individual"], icon: PiggyBank },
  "Target of Spies": { label: PROFILE_TAG["Target of Spies"], icon: Eye },
  "Crypto Worker": { label: PROFILE_TAG["Crypto Worker"], icon: Bitcoin },
  "Romance Target": { label: PROFILE_TAG["Romance Target"], icon: HeartCrack },
};

const noProfile: TagDisplay = { label: NO_PROFILE_TAG, icon: Ghost };

const flagTags = new Map<string, TagDisplay>([
  ["in-the-news", { label: FLAG_TAG["in-the-news"], icon: Newspaper }],
  ["same-username-everywhere", { label: FLAG_TAG["same-username-everywhere"], icon: Fingerprint }],
  ["public-email-in-commits", { label: FLAG_TAG["public-email-in-commits"], icon: GitCommitHorizontal }],
  ["passwords-in-breaches", { label: FLAG_TAG["passwords-in-breaches"], icon: KeyRound }],
  ["stealer-log-hit", { label: FLAG_TAG["stealer-log-hit"], icon: Bug }],
  ["just-changed-jobs", { label: FLAG_TAG["just-changed-jobs"], icon: Briefcase }],
  ["travelling-soon", { label: FLAG_TAG["travelling-soon"], icon: Plane }],
  ["selling-online", { label: FLAG_TAG["selling-online"], icon: Tag }],
  ["phone-number-exposed", { label: FLAG_TAG["phone-number-exposed"], icon: Phone }],
  ["home-address-exposed", { label: FLAG_TAG["home-address-exposed"], icon: MapPin }],
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

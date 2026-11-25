/* Links the demo notice dialog shows. The LinkedIn link stays hidden while its address is empty. */
export const PROJECTS_URL = "https://manglekuo.com";
export const LINKEDIN_POST_URL = "";

export type NoticeLink = { label: string; href: string };

export function demoNoticeLinks(linkedinUrl: string = LINKEDIN_POST_URL): NoticeLink[] {
  const links: NoticeLink[] = [{ label: "More of my projects", href: PROJECTS_URL }];
  if (linkedinUrl.trim()) links.push({ label: "Read the LinkedIn post", href: linkedinUrl.trim() });
  return links;
}

export const TAVILY_URL = "https://tavily.com";
export const NEBIUS_TOKEN_FACTORY_URL = "https://nebius.com/services/token-factory";

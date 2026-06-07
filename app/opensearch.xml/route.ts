import { siteConfig } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * OpenSearch description document. Lets browsers add kdpcover.pro as an
 * address-bar search provider; the search template points at the pSEO
 * calculator namespace the WebSite SearchAction also advertises.
 */
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<OpenSearchDescription xmlns="http://a9.com/-/spec/opensearch/1.1/">
  <ShortName>${siteConfig.shortName}</ShortName>
  <LongName>${siteConfig.name} — KDP cover calculator</LongName>
  <Description>${siteConfig.description}</Description>
  <InputEncoding>UTF-8</InputEncoding>
  <Image width="16" height="16" type="image/png">${siteConfig.url}/favicon-16.png</Image>
  <Image width="32" height="32" type="image/png">${siteConfig.url}/favicon-32.png</Image>
  <Url type="text/html" method="get" template="${siteConfig.url}/calculator/{searchTerms}"/>
  <moz:SearchForm xmlns:moz="http://www.mozilla.org/2006/browser/search/">${siteConfig.url}/</moz:SearchForm>
</OpenSearchDescription>
`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/opensearchdescription+xml; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}

import {
  PARENT_ORG_NAME,
  PARENT_ORG_URL,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site";

export default function OrganizationJsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/assets/logo-mark.png`,
    description: SITE_DESCRIPTION,
    email: SITE_EMAIL,
    areaServed: "AU",
    parentOrganization: {
      "@type": "NGO",
      name: PARENT_ORG_NAME,
      url: PARENT_ORG_URL,
    },
    sameAs: [PARENT_ORG_URL],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

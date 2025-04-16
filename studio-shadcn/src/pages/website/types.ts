// Define analytics types
export interface AnalyticsPlausible {
  server_url?: string;
  domain?: string;
  embed_code?: string;
}

export interface Analytics {
  plausible: AnalyticsPlausible;
}

// Define media related types
export interface Media {
  id: string;
  url: string;
  dimensions?: {
    height: number;
    width: number;
  };
  alt_text?: string;
  caption?: string;
  file_size?: number;
  file_type?: string;
}

// Define social media URL types
export interface SocialMediaUrls {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  youtube?: string;
  linkedin?: string;
  pinterest?: string;
}

// Define space types
export interface Space {
  id: string;
  name: string;
  slug: string;
  organisation_id: string;

  // Analytics
  analytics?: Analytics;

  // Branding
  logo_id?: string | null;
  logo_mobile_id?: string | null;
  fav_icon_id?: string | null;
  mobile_icon_id?: string | null;
  social_media_urls?: SocialMediaUrls;

  // Website properties
  site_title?: string;
  tag_line?: string;
  description?: string;
  site_address?: string;
  space_id?: string;
  meta_fields?: string | Record<string, any>;

  // Code injection
  header_code?: string;
  footer_code?: string;

  // Allow for additional properties
  [key: string]: any;
}

// Define organization type
export interface Organization {
  id: string;
  title: string;
}

// Define Redux state types
export interface RootState {
  spaces: {
    selected: string;
    details: Record<string, Space>;
    loading: boolean;
    orgs: Organization[];
  };
}

// Define website form data type
export interface WebsiteData {
  name?: string;
  site_title?: string;
  tag_line?: string;
  description?: string;
  slug?: string;
  site_address?: string;
  organisation_id?: string;
  space_id?: string;
  meta_fields?: string | Record<string, any>;
}

// Define branding form values type
export interface BrandingFormValues extends Partial<Space> {
  logo_id?: string | null;
  logo_mobile_id?: string | null;
  fav_icon_id?: string | null;
  mobile_icon_id?: string | null;
  social_media_urls?: SocialMediaUrls;
}

// Define authentication types
export interface AuthMethods {
  authMethodTypes?: string[];
}

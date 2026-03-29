package util

// create enum of meilisearch indexes
type MeilisearchIndex string

const (
	IndexPosts         MeilisearchIndex = "posts"
	IndexCategories    MeilisearchIndex = "categories"
	IndexTags          MeilisearchIndex = "tags"
	IndexFormats       MeilisearchIndex = "formats"
	IndexMedia         MeilisearchIndex = "mediums"
	IndexPolicies      MeilisearchIndex = "policies"
	IndexOrganisations MeilisearchIndex = "organisations"
	IndexMenus         MeilisearchIndex = "menus"
	IndexPages         MeilisearchIndex = "pages"
	IndexClaims        MeilisearchIndex = "claims"
	IndexClaimants     MeilisearchIndex = "claimants"
	IndexSpaces        MeilisearchIndex = "spaces"
	IndexRatings       MeilisearchIndex = "ratings"
	IndexPodcast       MeilisearchIndex = "podcasts"
	IndexEpisodes      MeilisearchIndex = "episodes"
)

func (index MeilisearchIndex) String() string {
	return string(index)
}

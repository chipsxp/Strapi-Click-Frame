# Filter by tag
GET /api/photos?filters[tags][name][$eq]=sunset

# Filter by category (album)
GET /api/photos?filters[category][name][$eq]=vacation

# Filter by author
GET /api/photos?filters[author][username][$eq]=jimmy

# Filter by date range
GET /api/photos?filters[createdAt][$gte]=2026-01-01&filters[createdAt][$lte]=2026-05-03

# Combined filters
GET /api/photos?filters[category][name][$eq]=nature&filters[tags][name][$in]=forest&populate=tags,category,author
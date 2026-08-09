update-packages:
	vp update
	vp install

create-migration:
	vp exec drizzle-kit generate

apply-migration-local:
	vp exec wrangler d1 migrations apply open-artifact-sheet --local

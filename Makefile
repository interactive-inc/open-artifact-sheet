update-packages:
	bunx --bun shadcn@latest add -a -o -y
	bunx --bun shadcn@latest migrate radix -y
	bunx npm-check-updates -u
	bun i
	rm src/components/ui/chart.tsx
	biome check . --fix --unsafe

create-migration:
	bun drizzle-kit generate

apply-migration-local:
	bun wrangler d1 migrations apply open-artifact-sheet --local

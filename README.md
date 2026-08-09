# Open Artifact Sheet

https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack/

## Develop

```bash
vp install
make apply-migration-local
vp dev
```

## マイグレーションを実行する

以下のコマンドを実行します。

```bash
make create-migration
make apply-migration-local
```

## パッケージを更新する

以下のコマンドを実行します。

```bash
make update-packages
```

## 検証

```bash
vp lint
vp fmt
vp test
```

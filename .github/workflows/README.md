# Android release

Push a tag `vMAJOR.MINOR.PATCH` (minor and patch must be 0-99). The workflow builds a signed APK and attaches `app-release.apk` to that GitHub Release.

`versionCode` is `major * 10000 + minor * 100 + patch`. The app compares this number with `GET /api/v1/system/open/android`.

You can also run the workflow manually and pass the same tag.

The previous `latest.json` / MinIO update path is no longer used.

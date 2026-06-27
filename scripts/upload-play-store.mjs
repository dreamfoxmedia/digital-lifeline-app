#!/usr/bin/env node
/**
 * Uploads the release AAB to Google Play Store (internal track by default).
 *
 * Usage:
 *   node scripts/upload-play-store.mjs [track]
 *
 * track: internal (default) | alpha | beta | production
 *
 * Requires: android/app/play-store-key.json  (Google Play service account JSON)
 */

import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

const PACKAGE_NAME = 'com.digilifeline.free.smartrevolutions.app'
const KEY_FILE     = path.join(ROOT, 'android', 'app', 'play-store-key.json')
const AAB_FILE     = path.join(ROOT, 'android', 'build', 'android', 'app', 'outputs', 'bundle', 'release', 'app-release.aab')
const TRACK        = process.argv[2] ?? 'internal'

if (!fs.existsSync(KEY_FILE)) {
  console.error(`\n❌  Service account key not found at:\n    ${KEY_FILE}\n`)
  console.error('Create a service account in Google Play Console → Setup → API access,')
  console.error('download the JSON key, and save it as android/app/play-store-key.json\n')
  process.exit(1)
}

if (!fs.existsSync(AAB_FILE)) {
  console.error(`\n❌  AAB not found at:\n    ${AAB_FILE}\n`)
  console.error('Run "npm run build:aab" first.\n')
  process.exit(1)
}

const auth = new google.auth.GoogleAuth({
  keyFile: KEY_FILE,
  scopes: ['https://www.googleapis.com/auth/androidpublisher'],
})

const publisher = google.androidpublisher({ version: 'v3', auth })

async function upload() {
  console.log(`\n📦  Uploading AAB to Play Store (track: ${TRACK}) …\n`)

  // 1. Open edit
  const { data: edit } = await publisher.edits.insert({ packageName: PACKAGE_NAME })
  const editId = edit.id

  try {
    // 2. Upload AAB
    const { data: bundle } = await publisher.edits.bundles.upload({
      packageName: PACKAGE_NAME,
      editId,
      media: {
        mimeType: 'application/octet-stream',
        body: fs.createReadStream(AAB_FILE),
      },
    })
    console.log(`✅  Bundle uploaded — versionCode: ${bundle.versionCode}`)

    // 3. Assign to track
    await publisher.edits.tracks.update({
      packageName: PACKAGE_NAME,
      editId,
      track: TRACK,
      requestBody: {
        track: TRACK,
        releases: [{
          versionCodes: [String(bundle.versionCode)],
          status: 'completed',
        }],
      },
    })
    console.log(`✅  Assigned to track: ${TRACK}`)

    // 4. Commit edit
    await publisher.edits.commit({ packageName: PACKAGE_NAME, editId })
    console.log(`\n🎉  Done! Version ${bundle.versionCode} is live on the ${TRACK} track.\n`)

  } catch (err) {
    // Roll back edit on failure
    await publisher.edits.delete({ packageName: PACKAGE_NAME, editId }).catch(() => {})
    throw err
  }
}

upload().catch(err => {
  console.error('\n❌  Upload failed:', err.message ?? err)
  process.exit(1)
})

# Photo upload specification

## Purpose

This document specifies the end-to-end file upload flow implemented by `import/import_fotod.js` so another agent can reproduce the behavior.

## Overview

- The script reads rows from a CSV and for each row attaches a photo to an existing Entu entity.
- Two-step flow:
  1. Request creation of a `photo` property on the entity. The server returns upload metadata (url, method, headers).
  2. Upload the file bytes to the returned `upload.url` using the provided method and headers (streamed from disk).
- The script limits concurrency by pausing the CSV stream when many uploads are in-flight.

## Paths and files

- Script: `import/import_fotod.js`
- Input CSV: `import/test.csv` (variable `fotod_csv_path`)
- Local photo folder: `import/in/png_links/` (script appends `Failinimi`)
- Results file: `import/import_fotod_results.csv`
- Environment file: `.env` (expected to contain `ENTU_TOKEN` and optionally `vr_kavaler_type_eid`)

## Environment variables

- `ENTU_TOKEN` (required): Bearer token used for `Authorization: Bearer <token>` in requests to Entu.
- `vr_kavaler_type_eid` (optional): present in the original script but not required for the upload step.

## API contract

### 1. Request upload metadata (create property)

- Endpoint:
  - POST https://{entu_hostname}/{entu_account}/entity/{entity_eid}
  - In the repo: `entu_hostname = 'entu.app/api'`, `entu_account = 'esmuuseum'`.
  - Example: `POST https://entu.app/api/esmuuseum/entity/12345`

- Headers:
  - `Authorization: Bearer <ENTU_TOKEN>`
  - `Accept-Encoding: deflate`
  - `Content-Type: application/json; charset=utf-8`

- Body: JSON array with a photo property descriptor. Example:

```json
[{
  "type": "photo",
  "filename": "Failinimi",
  "filesize": 12345,
  "filetype": "image/png"
}]
```

- Expected response (shape used by the script):

```json
{
  "properties": [
    {
      "upload": {
        "url": "<presigned_url>",
        "method": "PUT",
        "headers": {"Header-Name": "value"}
      }
    }
  ]
}
```

The script reads `json.properties[0].upload` and uses the url/method/headers to upload the file.

### 2. Upload file

- Use the returned `upload.method`, `upload.url` and `upload.headers` exactly as provided.
- Stream the file contents from disk with `fs.createReadStream(file_path)`.
- The original script uses `duplex: 'half'` in the fetch options to allow streaming a Node ReadableStream; Node 18+ or a compatible fetch (undici) is recommended.
- If the upload headers require `Content-Length`, include it (some presigned URLs require exact length).

## Headers and runtime notes

- `Authorization` is required only for the initial POST to Entu. The upload URL is often pre-signed and does not use the same auth.
- The initial request uses `Content-Type: application/json; charset=utf-8`.
- Streaming with Node ReadableStream may need `duplex: 'half'` depending on the fetch implementation.

## Concurrency and throttling

- The script uses a simple in-flight counter-based limiter:
  - `counter` tracks in-progress rows.
  - `full_trshold = 15`: when `counter > full_trshold` the CSV stream is paused.
  - `low_trshold = 14`: when `counter < low_trshold` the CSV stream is resumed.
- This produces approximately 15 concurrent uploads. Ensure `counter--` is executed on every terminal path.

## Error handling (current behavior and recommendations)

Current behavior in the script:

- If the local file is missing: the script decrements `counter`, writes `File <path> does not exist` to the results file, and skips that row.
- The script calls `response.json()` for the initial POST without validating the HTTP status code.
- Upload responses are recorded by `response.statusText` in the results file; there is no retry or rich error capture.

Recommended improvements:

- Wrap each row's processing in try/catch/finally and always decrement `counter` in `finally`.
- Validate HTTP responses (check `res.ok`); log/read the response body on non-2xx.
- Add retries with exponential backoff for transient errors (2–3 attempts).
- Add a `--dry-run` flag to test requests without performing uploads.

## Result logging

- A line is written per CSV row into `import/import_fotod_results.csv` in the form:

```text
<Kavaler_eid> <Kavaler_id> <statusText-or-error>
```

Ensure the write stream is closed at process end.

## Examples

### Node.js (streaming, minimal)

```javascript
const fs = require('fs');
const fetch = globalThis.fetch; // Node 18+ or undici

async function uploadFile(entityEid, filename, filePath, token) {
  const stats = fs.statSync(filePath);
  const filesize = stats.size;

  // 1) request upload metadata
  const postRes = await fetch(`https://entu.app/api/esmuuseum/entity/${entityEid}`, {
    method: 'POST',
    headers: {
      'Accept-Encoding': 'deflate',
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8'
    },
    body: JSON.stringify([{ type: 'photo', filename, filesize, filetype: 'image/png' }])
  });

  if (!postRes.ok) {
    const text = await postRes.text().catch(() => '');
    throw new Error(`POST failed ${postRes.status} ${postRes.statusText}: ${text}`);
  }
  const json = await postRes.json();
  const upload = json.properties[0].upload;

  // 2) upload (streamed)
  const uploadRes = await fetch(upload.url, {
    method: upload.method,
    headers: upload.headers,
    duplex: 'half',
    body: fs.createReadStream(filePath)
  });

  const uploadText = await uploadRes.text().catch(() => '<no-body>');
  if (!uploadRes.ok) {
    throw new Error(`Upload failed ${uploadRes.status} ${uploadRes.statusText}: ${uploadText}`);
  }
  return { status: uploadRes.status, statusText: uploadRes.statusText, body: uploadText };
}
```

### curl example (presigned PUT)

This assumes the upload step returns a presigned URL that accepts a PUT of the raw bytes.

```bash
# Determine filesize in bytes
filesize=$(stat -c%s "import/in/png_links/example.png")

curl -X PUT \
  -H "Content-Type: image/png" \
  -H "Content-Length: ${filesize}" \
  --upload-file "import/in/png_links/example.png" \
  "<presigned-upload-url>"
```

Include any headers returned by the metadata response (for example `x-amz-meta-*`) when constructing the curl command.

## Edge cases and recommendations

- Detect MIME type dynamically (use `mime-types` package) rather than hard-coding `image/png`.
- Add `Content-Length` if required by the upload backend.
- Use a fetch/http client that supports streaming or fall back to buffer uploads for small files.
- Consider idempotency if re-running the script to avoid duplicate properties.

## QA and test cases

1. Happy path: single-row CSV, file exists, valid token -> results file contains success status.
2. Missing file: results shows `File <path> does not exist`.
3. Metadata POST failure: results records status and response body.
4. Upload failure: results records upload status and response body.
5. Concurrency: simulate slow uploads to verify pause/resume behavior around 15 concurrent uploads.

## Acceptance criteria

- Ability to request upload metadata and upload the file using returned metadata.
- Concurrency limit enforced and no deadlocks on errors.
- One result line per input row describing success or a clear failure.

## Where this file lives

`import/UPLOAD_SPEC.md` (this file)

---

If you want, I can now implement the recommended script improvements in `import/import_fotod.js` (error handling, MIME detection, retries, dry-run).

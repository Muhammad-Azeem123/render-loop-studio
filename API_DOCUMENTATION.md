# Headless Video Rendering API

## Overview

This API provides headless video rendering capabilities. Send a template video URL, placeholders, and dynamic data to generate custom videos programmatically.

## Endpoint

```
POST https://ohsywxoozzapiqyuyzaj.supabase.co/functions/v1/render-video
```

## Request Format

```json
{
  "templateUrl": "https://your-s3-bucket.s3.amazonaws.com/template.mp4",
  "placeholders": [
    {
      "id": "text1",
      "type": "text",
      "value": "Hello World",
      "startTime": 0,
      "duration": 5,
      "position": { "x": 50, "y": 50 },
      "style": {
        "fontSize": 48,
        "color": "#ffffff",
        "fontFamily": "Arial"
      }
    },
    {
      "id": "image1",
      "type": "image",
      "value": "https://example.com/logo.png",
      "startTime": 2,
      "duration": 3,
      "position": { "x": 10, "y": 10 }
    }
  ],
  "outputFormat": "mp4",
  "quality": "high"
}
```

## Parameters

### templateUrl (required)
- Type: `string`
- The URL to your video template stored in AWS S3 or any accessible location

### placeholders (required)
- Type: `array`
- Array of placeholder objects to overlay on the video

#### Placeholder Object
- `id` (string): Unique identifier for the placeholder
- `type` (string): Either "text" or "image"
- `value` (string): The content to display (text string or image URL)
- `startTime` (number): When to start showing this element (in seconds)
- `duration` (number): How long to show this element (in seconds)
- `position` (object, optional): Position on screen
  - `x` (number): Horizontal position (0-100%)
  - `y` (number): Vertical position (0-100%)
- `style` (object, optional, text only): Styling for text
  - `fontSize` (number): Font size in pixels
  - `color` (string): Hex color code
  - `fontFamily` (string): Font family name

### outputFormat (optional)
- Type: `string`
- Default: `"mp4"`
- Options: `"mp4"`, `"webm"`

### quality (optional)
- Type: `string`
- Default: `"medium"`
- Options: `"low"`, `"medium"`, `"high"`

## Response Format

### Success Response (200)

```json
{
  "success": true,
  "videoUrl": "https://ohsywxoozzapiqyuyzaj.supabase.co/storage/v1/object/public/rendered-videos/video-id.mp4",
  "renderId": "abc123",
  "fileName": "abc123.mp4"
}
```

### Error Response (500)

```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Setup Requirements

### 1. Video Processing API (Choose One)

This API requires a third-party video processing service. Choose one:

#### Option A: Shotstack (Recommended)
1. Sign up at https://shotstack.io
2. Get your API key
3. Add secret: `SHOTSTACK_API_KEY`

```bash
# Add via Lovable Cloud Secrets
SHOTSTACK_API_KEY=your_api_key_here
```

#### Option B: Creatomate
1. Sign up at https://creatomate.com
2. Get your API key
3. Create a video template in their dashboard
4. Add secret: `CREATOMATE_API_KEY`

```bash
# Add via Lovable Cloud Secrets
CREATOMATE_API_KEY=your_api_key_here
```

### 2. AWS S3 Setup

Store your template videos in a public S3 bucket:

```bash
# Example S3 URL format
https://your-bucket.s3.amazonaws.com/templates/template1.mp4
```

## Example Usage

### cURL

```bash
curl -X POST https://ohsywxoozzapiqyuyzaj.supabase.co/functions/v1/render-video \
  -H "Content-Type: application/json" \
  -d '{
    "templateUrl": "https://my-bucket.s3.amazonaws.com/template.mp4",
    "placeholders": [
      {
        "id": "title",
        "type": "text",
        "value": "Welcome!",
        "startTime": 0,
        "duration": 3,
        "style": {
          "fontSize": 72,
          "color": "#FF0000"
        }
      }
    ],
    "outputFormat": "mp4",
    "quality": "high"
  }'
```

### Node.js

```javascript
const response = await fetch(
  'https://ohsywxoozzapiqyuyzaj.supabase.co/functions/v1/render-video',
  {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      templateUrl: 'https://my-bucket.s3.amazonaws.com/template.mp4',
      placeholders: [
        {
          id: 'title',
          type: 'text',
          value: 'Welcome!',
          startTime: 0,
          duration: 3,
          style: {
            fontSize: 72,
            color: '#FF0000',
          },
        },
      ],
      outputFormat: 'mp4',
      quality: 'high',
    }),
  }
);

const result = await response.json();
console.log('Rendered video URL:', result.videoUrl);
```

### Python

```python
import requests

response = requests.post(
    'https://ohsywxoozzapiqyuyzaj.supabase.co/functions/v1/render-video',
    json={
        'templateUrl': 'https://my-bucket.s3.amazonaws.com/template.mp4',
        'placeholders': [
            {
                'id': 'title',
                'type': 'text',
                'value': 'Welcome!',
                'startTime': 0,
                'duration': 3,
                'style': {
                    'fontSize': 72,
                    'color': '#FF0000'
                }
            }
        ],
        'outputFormat': 'mp4',
        'quality': 'high'
    }
)

result = response.json()
print(f"Rendered video URL: {result['videoUrl']}")
```

## Processing Time

- Typical render time: 30 seconds - 5 minutes
- Depends on video length and complexity
- API polls for completion automatically

## Rate Limits

- No rate limits currently enforced
- Recommended: Max 10 concurrent requests

## Storage

- Rendered videos stored in Lovable Cloud Storage
- Publicly accessible URLs
- No automatic deletion (manage manually if needed)

## Troubleshooting

### "Video processing API not configured"
- Add `SHOTSTACK_API_KEY` or `CREATOMATE_API_KEY` secret

### "Failed to fetch template"
- Ensure S3 URL is publicly accessible
- Check CORS settings on S3 bucket

### "Render timeout"
- Video too long or complex
- Try lower quality setting
- Contact video API support

## Support

For issues with:
- API endpoint: Check Edge Function logs in Lovable Cloud
- Video rendering: Contact Shotstack/Creatomate support
- Storage: Check Lovable Cloud Storage settings

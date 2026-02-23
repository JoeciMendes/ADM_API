<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1mzNxnc4maHegvPTqu-FBiGYTohsc1N6O

## Run Locally

**Prerequisites:** Node.js


1. Install dependencies:
   `npm install`
2. Create a `.env.local` file with Appwrite credentials:
   - `VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1`
   - `VITE_APPWRITE_PROJECT_ID=<your-appwrite-project-id>`
   - `VITE_APPWRITE_DATABASE_ID=<your-appwrite-database-id>`
   - `VITE_APPWRITE_PROFILES_COLLECTION_ID=<profiles-collection-id>`
   - `VITE_APPWRITE_ACTIVITY_LOGS_COLLECTION_ID=<activity-logs-collection-id>`
3. Run the app:
   `npm run dev`

## Appwrite Collections (minimum)

- `profiles` collection:
   - document id: use the authenticated user id
   - attributes: `user_id` (string), `full_name` (string), `role` (string), `avatar_url` (string), `created_at` (datetime), `updated_at` (datetime)
- `activity_logs` collection:
   - attributes: `user_id` (string), `description` (string), `status` (string), `created_at` (datetime)

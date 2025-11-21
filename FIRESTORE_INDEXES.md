# Firebase Firestore Index Setup

For production deployment, you need to create the following composite indexes in Firebase Console.

## Required Indexes

### 1. Invites Collection
- **Fields**: `inviterId` (Ascending), `createdAt` (Descending)
- **Query**: For fetching user's sent invites ordered by date

### 2. Businesses Collection
- **Fields**: `isApproved` (Ascending), `category` (Ascending), `createdAt` (Descending)  
- **Query**: For business directory filtering by category
- **Fields**: `isApproved` (Ascending), `location.county` (Ascending), `createdAt` (Descending)
- **Query**: For business directory filtering by location

### 3. Users Collection
- **Fields**: `role` (Ascending), `createdAt` (Descending)
- **Query**: For admin dashboard user management

## How to Create Indexes

### Method 1: Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database
4. Click on "Indexes" tab
5. Click "Create Index"
6. Add the fields as specified above

### Method 2: Using Firebase CLI
```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init firestore

# Edit firestore.indexes.json
# Then deploy indexes
firebase deploy --only firestore:indexes
```

### Method 3: Auto-create from Error Messages
When you see index requirement errors in development:
1. Copy the index creation URL from the error message
2. Open the URL in your browser
3. Click "Create Index"

## Sample firestore.indexes.json

```json
{
  "indexes": [
    {
      "collectionGroup": "invites",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "inviterId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION", 
      "fields": [
        { "fieldPath": "isApproved", "order": "ASCENDING" },
        { "fieldPath": "category", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "businesses",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "isApproved", "order": "ASCENDING" },
        { "fieldPath": "location.county", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

## Development vs Production

- **Development**: The current API routes use in-memory filtering to avoid index requirements
- **Production**: Create the indexes above and update the API routes to use proper Firestore queries for better performance

## Index Creation Time
- Simple indexes: Usually created within a few minutes
- Complex indexes: May take several minutes to hours depending on data size
- You'll receive an email when index creation is complete

## Monitoring Index Usage
In Firebase Console > Firestore > Usage tab, you can monitor:
- Query performance
- Index usage statistics
- Failed queries due to missing indexes
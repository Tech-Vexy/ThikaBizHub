# Thika Business Hub

A comprehensive business directory and community platform for Thika and surrounding areas. Built with Next.js, Firebase, and modern web technologies.

## 🚀 Features

### Core Features
- **Business Directory**: Browse and search local businesses with advanced filtering
- **User Authentication**: Secure login/signup with Firebase Auth
- **User Profiles**: Customizable user profiles with avatars and bio
- **Admin Dashboard**: Complete business and user management system
- **Responsive Design**: Mobile-first design that works on all devices

### Growth & Engagement
- **Referral System**: Users can invite others and earn rewards ($10 per successful referral)
- **Invite System**: Send targeted invitations (user, business, admin types)
- **Notification System**: Real-time notifications for user actions
- **Analytics Dashboard**: Comprehensive insights and reporting

### Business Features
- **Business Listings**: Detailed business profiles with images, contact info, and location
- **Premium Listings**: Enhanced visibility for premium businesses
- **Category & Location Filtering**: Find businesses by type and location
- **Proof of Visit**: Photo verification system for business visits
- **Reviews & Ratings**: Community-driven business reviews (planned)

### Technical Features
- **Scalable Architecture**: Optimized for performance and growth
- **Caching System**: In-memory caching with Redis-ready architecture
- **Pagination**: Efficient data loading for large datasets
- **Error Handling**: Comprehensive error boundaries and user feedback
- **SEO Optimized**: Server-side rendering and meta tag management

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth with custom claims
- **Storage**: Firebase Storage
- **Icons**: Lucide React
- **Deployment**: Vercel (recommended)

## 📋 Prerequisites

Before you begin, ensure you have:

- Node.js 18+ installed
- npm or yarn package manager
- Firebase project with Authentication, Firestore, and Storage enabled
- Git for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repository-url>
cd thika_biz_hub
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use existing one
3. Enable Authentication with Email/Password provider
4. Create Firestore database in production mode
5. Enable Firebase Storage
6. Download the service account key (for admin operations)

### 4. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Firebase Client Config
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin Config
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="your_private_key"

# App Config
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
```

### 5. Firebase Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     resource.data.keys().hasAny(['isPublic']) && 
                     resource.data.isPublic == true;
    }
    
    // Businesses - approved ones are public, others restricted
    match /businesses/{businessId} {
      allow read: if resource.data.isApproved == true;
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && 
                            (request.auth.uid == resource.data.ownerId || 
                             request.auth.token.role == 'admin');
    }
    
    // Referrals - users can read/write their own
    match /referrals/{referralId} {
      allow read, write: if request.auth != null && 
                        (request.auth.uid == resource.data.referrerId || 
                         request.auth.uid == resource.data.referredUserId);
      allow create: if request.auth != null;
    }
    
    // Invites - users can read/write their own
    match /invites/{inviteId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == resource.data.inviterId;
    }
    
    // Admin only collections
    match /analytics/{document} {
      allow read, write: if request.auth != null && request.auth.token.role == 'admin';
    }
  }
}
```

### 6. Required Database Indexes

For production deployment, you need to create Firestore composite indexes. See [FIRESTORE_INDEXES.md](./FIRESTORE_INDEXES.md) for detailed instructions.

**Quick Setup for Development:**
The current API routes use in-memory filtering to work without indexes during development. For production, create the required indexes for better performance.

### 7. Initialize Database

Run the development server and visit `/debug` as the first user to automatically become admin:

```bash
npm run dev
# or
yarn dev
```

Navigate to `http://localhost:3000` and sign up. The first user automatically becomes admin.

### 7. Required Database Indexes

Create these indexes in Firebase Console > Firestore > Indexes:

```
Collection: businesses
Fields: isApproved (Ascending), createdAt (Descending)

Collection: businesses  
Fields: category (Ascending), isApproved (Ascending), createdAt (Descending)

Collection: businesses
Fields: isApproved (Ascending), location.county (Ascending), createdAt (Descending)

Collection: referrals
Fields: referrerId (Ascending), status (Ascending), createdAt (Descending)

Collection: invites
Fields: inviterId (Ascending), status (Ascending), createdAt (Descending)

Collection: users
Fields: role (Ascending), createdAt (Descending)
```

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── analytics/         # Analytics dashboard
│   ├── deals/             # Special deals page
│   ├── directory/         # Business directory
│   ├── invite/            # Invite acceptance
│   ├── invites/           # Invite management
│   ├── login/             # Authentication
│   ├── profile/           # User profiles
│   ├── proof-of-visit/    # Visit verification
│   ├── referrals/         # Referral system
│   └── globals.css        # Global styles
├── components/
│   ├── layout/            # Layout components
│   ├── ui/                # Reusable UI components
│   └── debug/             # Debug utilities
├── hooks/                 # Custom React hooks
└── lib/                   # Utility libraries
    ├── cache.ts           # Caching utilities
    ├── database.ts        # Database helpers
    ├── firebase.ts        # Firebase client
    ├── firebaseAdmin.ts   # Firebase admin
    └── pagination.ts      # Pagination utilities
```

## 🔧 Development

### Available Scripts

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint

# Type check
npm run type-check
```

### Key Development Notes

1. **Authentication**: First user automatically becomes admin
2. **Referral Codes**: Automatically generated as 8-character alphanumeric codes
3. **Caching**: Implement Redis in production for better performance
4. **Images**: Upload business images to Firebase Storage
5. **Notifications**: Uses React Context for real-time updates

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push

### Firebase Hosting

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase hosting
firebase init hosting

# Build and deploy
npm run build
firebase deploy
```

### Environment Variables for Production

Ensure all environment variables are set in your production environment:

- Firebase configuration
- Admin credentials
- NextAuth secret
- Production URL

## 📊 Database Schema

### Users Collection
```typescript
{
  uid: string;
  email: string;
  displayName?: string;
  role: 'user' | 'admin';
  avatar?: string;
  bio?: string;
  location?: string;
  phoneNumber?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Businesses Collection
```typescript
{
  name: string;
  description: string;
  category: string;
  location: {
    county: string;
    town: string;
    address: string;
    coordinates?: [number, number];
  };
  contact: {
    phone: string;
    email: string;
    whatsapp?: string;
  };
  website?: string;
  images: string[];
  ownerId: string;
  isApproved: boolean;
  isPremium: boolean;
  rating: number;
  reviewCount: number;
  views: number;
  createdAt: string;
  updatedAt: string;
}
```

### Referrals Collection
```typescript
{
  code: string;
  referrerId: string;
  referredUserId?: string;
  status: 'pending' | 'completed';
  reward: number;
  createdAt: string;
  completedAt?: string;
}
```

### Invites Collection
```typescript
{
  code: string;
  inviterId: string;
  email: string;
  type: 'user' | 'business' | 'admin';
  status: 'pending' | 'accepted' | 'expired';
  message?: string;
  acceptedBy?: string;
  createdAt: string;
  acceptedAt?: string;
  expiresAt: string;
}
```

## 🛡️ Security Features

- Firebase Authentication with custom claims
- Firestore security rules
- Input validation and sanitization
- Error boundary implementation
- Rate limiting on API routes
- Secure environment variable handling

## 🔄 Performance Optimizations

- In-memory caching with expiration
- Database indexing for fast queries
- Image optimization with Next.js
- Lazy loading components
- Pagination for large datasets
- Prefetching for better UX

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For support and questions:

- Create an issue on GitHub
- Email: support@thikabusinesshub.com
- WhatsApp: +254 XXX XXX XXX

## 🗺️ Roadmap

### Phase 1 ✅ (Completed)
- [x] Basic business directory
- [x] User authentication
- [x] Admin dashboard
- [x] Referral system
- [x] Invite system
- [x] Analytics dashboard

### Phase 2 🚧 (In Progress)
- [ ] Email notifications
- [ ] Advanced search with Elasticsearch
- [ ] Mobile app development
- [ ] Payment integration
- [ ] Review and rating system

### Phase 3 📅 (Planned)
- [ ] Multi-language support
- [ ] API for third-party integrations
- [ ] Advanced analytics
- [ ] Business marketplace
- [ ] Event management system

## 🏆 Acknowledgments

- Next.js team for the amazing framework
- Firebase for backend infrastructure
- Tailwind CSS for styling system
- Lucide for beautiful icons
- Open source community for inspiration

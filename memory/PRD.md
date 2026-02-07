# TM Real Estate - Product Requirements Document

## Original Problem Statement
Create a modern, premium, ultra-fast real-estate marketplace website for TM Real Estate (टीम रियल एस्टेट) in Airoli, Navi Mumbai, inspired by Housing.com, Magicbricks, and NoBroker, with a strictly controlled, admin-only listing model.

## Business Details
- **Name**: TM Real Estate (टीम रियल एस्टेट)
- **Type**: Real Estate Agency
- **Address**: Shop No.16, Maruti Enclave, Plot No.9, Opposite Yash Paradise Main Gate, Sector 8, Airoli, Navi Mumbai, Maharashtra 400701
- **Phone**: 09820351929
- **Hours**: Open from 9:30 AM

## Architecture & Tech Stack
- **Frontend**: React 18 + TailwindCSS + Shadcn/UI
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **Authentication**: JWT tokens + MSG91 OTP (demo mode)
- **Design**: Teal accent, Light/Dark mode, Manrope + Inter fonts

## User Personas
1. **Property Seekers**: Browse, search, filter, favorite properties
2. **Property Owners**: Request listings via wizard form (no direct posting)
3. **Admin (TM Real Estate)**: Full CRUD on listings, manage enquiries

## Core Requirements (Implemented)
### Public Features
- [x] Homepage with hero, search bar, featured properties, testimonials
- [x] Buy page with filters (location, type, BHK, price, furnishing)
- [x] Rentals page with PG toggle
- [x] Property details with gallery, specs, contact form
- [x] Request Listing wizard with quality meter
- [x] Contact page with form
- [x] About page
- [x] Dark mode toggle
- [x] Mobile responsive

### Authentication
- [x] Phone OTP login for users (MSG91 - demo mode)
- [x] Admin login (Admin@TM_ / hashed password in env)
- [x] JWT token-based sessions

### Admin Dashboard
- [x] Overview stats (properties, enquiries, requests)
- [x] Properties management (publish/unpublish, feature/unfeature, delete)
- [x] Enquiries management with status updates
- [x] Listing requests management with quality scores

## What's Been Implemented (Jan 2026)
- Full-stack real estate marketplace MVP
- 15 demo properties (buy, rent, PG)
- Unsplash real estate images
- Admin-only listing control
- Request listing wizard with WhatsApp integration
- Contact forms logging to database
- Favorites system for authenticated users
- **NEW: Property creation form in admin dashboard**
- **NEW: Image upload functionality (file upload + URL paste)**
- **NEW: Amenities selection chips**
- **NEW: Publish/Feature toggles**

## Prioritized Backlog
### P0 - Critical (Next Sprint)
- MSG91 API integration (currently demo mode)
- ~~Add property creation form in admin dashboard~~ ✅ DONE
- ~~Image upload functionality~~ ✅ DONE

### P1 - High Priority
- Cloud image storage (Cloudinary/S3) for persistent uploads
- Map view for property listings
- Saved searches feature
- Email notifications for enquiries

### P2 - Nice to Have
- Property comparison tool
- Virtual tour integration
- Analytics dashboard

## Next Tasks
1. Configure MSG91 API credentials for production OTP
2. Add property creation/edit form in admin panel
3. Implement image upload (Cloudinary/S3)
4. Add map view with Google Maps
5. Set up email notifications
